from fastapi import APIRouter, File, Form, UploadFile, status, HTTPException, Request, Depends,Query
import os
import shutil
import uuid
from bson import ObjectId
from datetime import datetime, timezone
from typing import Optional, List
from deep_translator import GoogleTranslator
import config
from config import get_current_admin
from models import BlogResponse, CategoryDetail, SubCategoryDetail, LoginRequest, ChangeUserRoleRequest
import json
from translator import ta_to_en, en_to_ta
from cache import get_cached, set_cache

router = APIRouter()

def translate_to_en_logic(text: str) -> str:
    if not text or not isinstance(text, str) or text.strip() == "":
        return text
    if text.replace(" ", "").isdigit():
        return text
    cached = get_cached(text)
    if cached: return cached
    try:
        translated = ta_to_en(text)
        if translated:
            set_cache(text, translated)
            return translated
    except:
        pass
    return text


def translate_text(text: str, source_lang: str = 'en', target_lang: str = 'ta', strict: bool = False) -> str:
    if not text or not text.strip():
        return ""
    try:
        return GoogleTranslator(source=source_lang, target=target_lang).translate(text)
    except Exception:
        if strict:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Translation failed. Data not stored to keep database purely Tamil."
            )
        return text

def translate_keywords(keywords: List[str], source_lang: str = 'en', target_lang: str = 'ta', strict: bool = False) -> List[str]:
    translator = GoogleTranslator(source=source_lang, target=target_lang)
    translated_list = []
    for kw in keywords:
        try:
            translated_list.append(translator.translate(kw))
        except Exception:
            if strict:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Keyword translation failed."
                )
            translated_list.append(kw)
    return translated_list

@router.post("/register/", status_code=status.HTTP_201_CREATED, operation_id="Register")
async def register_new_admin(
        firstname: str = Form(...),
        lastname: str = Form(...),
        email: str = Form(...),
        password: str = Form(...)
):
    existing_user = await config.users_collection.find_one(
        {"email": email}
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    hashed_password = config.get_password_hash(password)

    new_user_document = {
        "firstname": firstname,
        "lastname": lastname,
        "email": email,
        "password": hashed_password,
        "status": "user"
    }

    await config.users_collection.insert_one(
        new_user_document
    )

    return {
        "status": "success",
        "message": "User created successfully"
    }


@router.post("/login/", operation_id="Login")
async def login_for_auth_tokens(
        username: str = Form(...),
        password: str = Form(...)
):
    user = await config.users_collection.find_one(
        {"email": username}
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    if not config.verify_password(
        password,
        user["password"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    token_payload = {
        "user_id": str(user["_id"]),
        "email": user["email"],
        "status": user.get("status", "user")
    }

    return {
        "access_token": config.create_access_token(token_payload),
        "refresh_token": config.create_refresh_token(token_payload),
        "token_type": "bearer",
        "firstname": user.get("firstname"),
        "lastname": user.get("lastname"),
        "email": user["email"],
        "status": user.get("status", "user")
    }


async def get_category_by_name(category_name: str) -> dict:
    if not category_name:
        return None

    search_value = category_name.strip()

    category = await config.category_collection.find_one({
        "category_name": search_value
    })

    if category:
        return category

    try:
        tamil_name = GoogleTranslator(
            source="auto",
            target="ta"
        ).translate(search_value)

        category = await config.category_collection.find_one({
            "category_name": tamil_name
        })

        if category:
            return category

    except Exception:
        pass

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Category '{category_name}' not found in the database."
    )


async def get_subcategory_by_name(
        subcategory_name: str,
        category_doc: dict
) -> dict:
    if not subcategory_name or not category_doc:
        return None

    search_value = subcategory_name.strip()
    subcategories = category_doc.get("subcategories", [])

    for sub in subcategories:
        if sub.get("name", "").strip() == search_value:
            return sub

    try:
        tamil_name = GoogleTranslator(
            source="auto",
            target="ta"
        ).translate(search_value)

        for sub in subcategories:
            if sub.get("name", "").strip() == tamil_name:
                return sub

    except Exception:
        pass

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Subcategory '{subcategory_name}' not found under this category."
    )

async def build_nested_relations(category_id: Optional[str], sub_category_id: Optional[str],
                                 target_lang: str = "ta") -> tuple:
    cat_detail = None
    sub_detail = None

    if category_id:
        cat_doc = await config.category_collection.find_one({"_id": category_id})
        if cat_doc:
            cat_name = cat_doc.get("category_name", "")
            if target_lang == "ta":
                cat_name = cat_name
            else:
                cat_name = cat_name

            cat_detail = CategoryDetail(id=str(cat_doc["_id"]), name=cat_name)

            if sub_category_id:
                for sub in cat_doc.get("subcategories", []):
                    if str(sub.get("id")) == str(sub_category_id):
                        sub_name = sub.get("name", "")
                        if target_lang == "ta":
                            sub_name = sub_name
                        else:
                            sub_name = sub_name

                        sub_detail = SubCategoryDetail(
                            id=str(sub["id"]),
                            name=sub_name,
                            category_id=str(category_id)
                        )
                        break

    return cat_detail, sub_detail


#  CORE ROUTE OPERATIONS

@router.post("/blog/post/", response_model=BlogResponse, status_code=status.HTTP_200_OK, operation_id="new-blog-post")
async def publish_new_blog_post(
        title: str = Form(...),
        content: str = Form(...),
        author: str = Form(...),
        category: Optional[str] = Form(None, description="Type category name like 'Book'"),
        subcategory: Optional[str] = Form(None, description="Type subcategory name like 'ebook'"),
        keywords: Optional[str] = Form(None),
        image_file: Optional[UploadFile] = File(None),
        media: list[UploadFile] = File(None),
        video_file: Optional[UploadFile] = File(None),
        current_admin: dict = Depends(get_current_admin)
):
    keywords_en = [kw.strip() for kw in keywords.split(",") if kw.strip()] if keywords else []

    title_ta = translate_text(title, source_lang='en', target_lang='ta', strict=True)
    content_ta = translate_text(content, source_lang='en', target_lang='ta', strict=True)
    author_ta = translate_text(author, source_lang='en', target_lang='ta', strict=True)
    keywords_ta = translate_keywords(keywords_en, source_lang='en', target_lang='ta', strict=True)

    resolved_category_id = None
    resolved_sub_category_id = None

    if category:
        cat_doc = await get_category_by_name(category)
        resolved_category_id = str(cat_doc["_id"])
        if subcategory:
            sub_doc = await get_subcategory_by_name(subcategory, cat_doc)
            resolved_sub_category_id = str(sub_doc["id"])

    blog_id = str(uuid.uuid4())
    db_image_url = None

    if image_file and image_file.filename:
        db_image_url = f"static/uploads/{blog_id}_{image_file.filename}"
        with open(db_image_url, "wb+") as file_object:
            shutil.copyfileobj(image_file.file, file_object)

    media_items = []
    if media:
        os.makedirs("static/uploads/", exist_ok=True)
        for file in media:
            if not file.filename:
                continue

            file_path = f"static/uploads/{uuid.uuid4()}_{file.filename}"

            with open(file_path, "wb+") as buffer:
                shutil.copyfileobj(file.file, buffer)

            media_type = "video" if file.content_type.startswith("video") else "image"

            media_items.append({
                "type": media_type,
                "path": file_path
            })

    db_video_url = None
    if video_file and video_file.filename:
        db_video_url = f"static/uploads/{blog_id}_{video_file.filename}"
        with open(db_video_url, "wb+") as file_object:
            shutil.copyfileobj(video_file.file, file_object)

    new_post = {
        "_id": blog_id,
        "category_id": resolved_category_id,
        "sub_category_id": resolved_sub_category_id,
        "title_ta": title_ta,
        "content_ta": content_ta,
        "author_ta": author_ta,
        "keywords_ta": keywords_ta,
        "image_url": db_image_url,
        "media": media_items,
        "video_url": db_video_url,
        "created_at": datetime.now(timezone.utc),
        "status": "pending"
    }
    await config.posts_collection.insert_one(new_post)

    cursor = config.users_collection.find({"status": "user"})


    message_body_ta = translate_text(
        "New blog has been published",
        source_lang="en",
        target_lang="ta"
    )

    notification_type_ta = translate_text(
        "Blog published",
        source_lang="en",
        target_lang="ta"
    )

    notifications = []

    async for user in cursor:
        notifications.append({
            "user_id": str(user["_id"]),
            "title": title_ta,
            "notif_type": notification_type_ta,
            "message": f"{message_body_ta} '{title_ta}'",
            "blog_id": blog_id,
            "image_url": db_image_url,
            "is_read": False,
            "created_at": datetime.now(timezone.utc)
        })


    if notifications:
        await config.notifications_collection.insert_many(notifications)

    cat_detail, sub_detail = await build_nested_relations(
        resolved_category_id,
        resolved_sub_category_id,
        target_lang="ta"
    )

    return BlogResponse(
        id=blog_id,
        category=cat_detail,
        subcategory=sub_detail,
        title=title_ta,
        content=content_ta,
        author=author_ta,
        keywords=keywords_ta,
        image_url=db_image_url,
        media=media_items,
        video_url=db_video_url,
        created_at=new_post["created_at"],
        language_delivered="ta",
        status=new_post.get("status", "pending")
    )


@router.get(
    "/blog/all/",
    response_model=List[BlogResponse],
    operation_id="fetch-all-post"
)
async def fetch_all_blog_posts(
    page: int = Query(1, ge=1),
    limit: int = Query(8, ge=1, le=50),
    lang: str = Query("ta")
):
    skip = (page - 1) * limit

    cursor = (
        config.posts_collection
        .find({})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )

    posts = await cursor.to_list(length=limit)

    response_list = []

    for post in posts:

        if lang == "en":
            title = translate_to_en_logic(post.get("title_ta", ""))
            content = translate_to_en_logic(post.get("content_ta", ""))
            author = translate_to_en_logic(post.get("author_ta", ""))
            keywords = translate_to_en_logic(post.get("keywords_ta", []))
        else:
            title = post.get("title_ta", "")
            content = post.get("content_ta", "")
            author = post.get("author_ta", "")
            keywords = post.get("keywords_ta", [])

        cat_detail, sub_detail = await build_nested_relations(
            post.get("category_id"),
            post.get("sub_category_id"),
            target_lang=lang
        )

        response_list.append(
            BlogResponse(
                id=str(post["_id"]),
                category=cat_detail,
                subcategory=sub_detail,
                title=str(title),
                content=str(content),
                author=str(author),
                keywords=[str(k) for k in keywords] if isinstance(keywords, list) else [str(keywords)],
                image_url=post.get("image_url"),
                media=post.get("media", []),
                video_url=post.get("video_url"),
                created_at=post.get(
                    "created_at",
                    datetime.now(timezone.utc)
                ),
                language_delivered=lang,
                status=post.get("status", "pending")
            )
        )

    return response_list


@router.get("/read_blog/{blog_id}/", response_model=BlogResponse, status_code=status.HTTP_200_OK, operation_id="Read-particular")
async def fetch_blog_post_by_id(blog_id: str, lang: str = "ta"):
    post = await config.posts_collection.find_one({"_id": blog_id})
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    if lang == "en":
        title = translate_text(post.get("title_ta", ""), 'ta', 'en')
        content = translate_text(post.get("content_ta", ""), 'ta', 'en')
        author = translate_text(post.get("author_ta", ""), 'ta', 'en')
        keywords = translate_keywords(post.get("keywords_ta", []), 'ta', 'en')
    else:
        title = post.get("title_ta", "")
        content = post.get("content_ta", "")
        author = post.get("author_ta", "")
        keywords = post.get("keywords_ta", [])

    cat_detail, sub_detail = await build_nested_relations(
        post.get("category_id"),
        post.get("sub_category_id"),
        target_lang=lang
    )

    return BlogResponse(
        id=str(post["_id"]),
        category=cat_detail,
        subcategory=sub_detail,
        title=str(title),
        content=str(content),
        author=str(author),
        keywords=[str(k) for k in keywords],
        image_url=str(post.get("image_url")) if post.get("image_url") else None,
        media=post.get("media", []),
        video_url=str(post.get("video_url")) if post.get("video_url") else None,
        created_at=post.get("created_at", datetime.now(timezone.utc)),
        language_delivered=lang,
        status=post.get("status", "pending")
    )


@router.put(
    "/replace_blog/{blog_id}/",
    response_model=BlogResponse,
    status_code=status.HTTP_200_OK,
    operation_id="Update-Blog"
)
async def modify_existing_blog_post(

    blog_id: str,

    category: Optional[str] = Form(None),
    subcategory: Optional[str] = Form(None),
    keywords: Optional[str] = Form(None),

    title_en: Optional[str] = Form(None),
    content_en: Optional[str] = Form(None),
    author: Optional[str] = Form(None),

    image_file: Optional[UploadFile] = File(None),
    media: list[UploadFile] = File(None),
    video_file: Optional[UploadFile] = File(None),

    deleted_media: Optional[str] = Form(None),

    lang_preference: str = Form("ta"),
    current_admin: dict = Depends(get_current_admin)
):
    post = await config.posts_collection.find_one({"_id": blog_id})

    if not post:
        raise HTTPException(
            status_code=404,
            detail="Blog post not found"
        )

    update_data = {}

    # ----------------------------
    # CATEGORY UPDATE
    # ----------------------------
    if category:
        cat_doc = await get_category_by_name(category)

        update_data["category_id"] = str(cat_doc["_id"])

        if subcategory:
            sub_doc = await get_subcategory_by_name(
                subcategory,
                cat_doc
            )
            update_data["sub_category_id"] = str(sub_doc["id"])

    elif subcategory:
        current_cat_id = post.get("category_id")

        if not current_cat_id:
            raise HTTPException(
                status_code=400,
                detail="Base category missing"
            )

        cat_doc = await config.category_collection.find_one(
            {"_id": current_cat_id}
        )

        sub_doc = await get_subcategory_by_name(
            subcategory,
            cat_doc
        )

        update_data["sub_category_id"] = str(sub_doc["id"])

    # ----------------------------
    # KEYWORDS
    # ----------------------------
    if keywords:
        kws_en = [
            kw.strip()
            for kw in keywords.split(",")
            if kw.strip()
        ]

        update_data["keywords_ta"] = translate_keywords(
            kws_en,
            source_lang="en",
            target_lang="ta",
            strict=True
        )

    # ----------------------------
    # COVER IMAGE
    # ----------------------------
    if image_file and image_file.filename:

        old_image = post.get("image_url")

        if old_image and os.path.exists(old_image):
            try:
                os.remove(old_image)
            except:
                pass

        local_img_path = (
            f"static/uploads/{blog_id}_{image_file.filename}"
        )

        with open(local_img_path, "wb+") as buffer:
            shutil.copyfileobj(image_file.file, buffer)

        update_data["image_url"] = local_img_path

    # ----------------------------
    # FEATURED VIDEO
    # ----------------------------
    if video_file and video_file.filename:

        old_video = post.get("video_url")

        if old_video and os.path.exists(old_video):
            try:
                os.remove(old_video)
            except:
                pass

        local_vid_path = (
            f"static/uploads/{blog_id}_{video_file.filename}"
        )

        with open(local_vid_path, "wb+") as buffer:
            shutil.copyfileobj(video_file.file, buffer)

        update_data["video_url"] = local_vid_path

    # ----------------------------
    # EXISTING MEDIA
    # ----------------------------
    existing_media = post.get("media", [])

    # ----------------------------
    # DELETE SELECTED MEDIA
    # ----------------------------
    if deleted_media:
        try:
            deleted_paths = json.loads(deleted_media)

            # delete physical files
            for path in deleted_paths:
                try:
                    if os.path.exists(path):
                        os.remove(path)
                except Exception as e:
                    print("File delete error:", e)

            # remove from mongo media list
            existing_media = [
                item
                for item in existing_media
                if item.get("path") not in deleted_paths
            ]

        except Exception as e:
            print("deleted_media parse error:", e)

    # ----------------------------
    # NEW MEDIA UPLOAD
    # ----------------------------
    media_items = []

    if media:

        os.makedirs("static/uploads", exist_ok=True)

        for file in media:

            if not file.filename:
                continue

            file_path = (
                f"static/uploads/"
                f"{uuid.uuid4()}_{file.filename}"
            )

            with open(file_path, "wb+") as buffer:
                shutil.copyfileobj(
                    file.file,
                    buffer
                )

            media_type = (
                "video"
                if file.content_type.startswith("video")
                else "image"
            )

            media_items.append({
                "type": media_type,
                "path": file_path
            })

    # ----------------------------
    # FINAL MEDIA LIST
    # ----------------------------
    update_data["media"] = existing_media + media_items

    # ----------------------------
    # TRANSLATIONS
    # ----------------------------
    if title_en:
        update_data["title_ta"] = translate_text(
            title_en,
            source_lang="en",
            target_lang="ta",
            strict=True
        )

    if content_en:
        update_data["content_ta"] = translate_text(
            content_en,
            source_lang="en",
            target_lang="ta",
            strict=True
        )

    if author:
        update_data["author_ta"] = translate_text(
            author,
            source_lang="en",
            target_lang="ta",
            strict=True
        )

    # ----------------------------
    # SAVE
    # ----------------------------
    if update_data:
        await config.posts_collection.update_one(
            {"_id": blog_id},
            {"$set": update_data}
        )

        post = await config.posts_collection.find_one(
            {"_id": blog_id}
        )

    # ----------------------------
    # RESPONSE LANGUAGE
    # ----------------------------
    title_ta_val = post.get("title_ta", "")
    content_ta_val = post.get("content_ta", "")
    author_ta_val = post.get("author_ta", "")
    keywords_ta_val = post.get("keywords_ta", [])

    if lang_preference == "en":

        title = translate_text(
            title_ta_val,
            "ta",
            "en"
        )

        content = translate_text(
            content_ta_val,
            "ta",
            "en"
        )

        author = translate_text(
            author_ta_val,
            "ta",
            "en"
        )

        keywords = translate_keywords(
            keywords_ta_val,
            "ta",
            "en"
        )

    else:
        title = title_ta_val
        content = content_ta_val
        author = author_ta_val
        keywords = keywords_ta_val

    cat_detail, sub_detail = await build_nested_relations(
        post.get("category_id"),
        post.get("sub_category_id"),
        target_lang=lang_preference
    )

    return BlogResponse(
        id=blog_id,
        category=cat_detail,
        subcategory=sub_detail,
        title=str(title),
        content=str(content),
        author=str(author),
        keywords=keywords,
        image_url=post.get("image_url", ""),
        media=post.get("media", []),
        video_url=post.get("video_url"),
        created_at=post["created_at"],
        language_delivered=lang_preference,
        status=post.get("status", "pending")
    )
@router.delete("/remove_blog/{blog_id}", status_code=status.HTTP_200_OK, operation_id="Delete-blog")
async def remove_blog_post_permanently(blog_id: str, current_admin: dict = Depends(get_current_admin)):
    result = await config.posts_collection.delete_one({"_id": blog_id})

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Blog post with ID {blog_id} not found or already deleted."
        )

    return {"status": "success", "message": "Blog post deleted successfully"}

@router.post("/status/changer/{blog_id}/", operation_id="pending-publish-changer")
async def status_changer(
    blog_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    blog = await config.posts_collection.find_one(
        {"_id": blog_id}
    )

    if not blog:
        raise HTTPException(
            status_code=404,
            detail="Blog not found"
        )

    new_status = (
        "published"
        if blog.get("status") == "pending"
        else "pending"
    )

    await config.posts_collection.update_one(
        {"_id": blog_id},
        {
            "$set": {
                "status": new_status
            }
        }
    )

    return {
        "message": "Status updated successfully",
        "status": new_status
    }

@router.put("/change-user-role/", operation_id="change-user-role")
async def change_user_role(
    data: ChangeUserRoleRequest,
    current_admin: dict = Depends(get_current_admin) # Uncomment for JWT protection
):
    if data.status not in ["admin", "user"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be either 'admin' or 'user'"
        )

    user = await config.users_collection.find_one({"email": data.email})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with email '{data.email}' was not found."
        )

    if user.get("status") != data.status:
        await config.users_collection.update_one(
            {"email": data.email},
            {"$set": {"status": data.status}}
        )

    admin_cursor = config.users_collection.find({"status": "admin"}, {"email": 1, "_id": 0})
    admin_docs = await admin_cursor.to_list(length=100)
    admin_emails = [doc["email"] for doc in admin_docs if "email" in doc]
    admin_count = len(admin_emails)

    user_cursor = config.users_collection.find({"status": "user"}, {"email": 1, "_id": 0})
    user_docs = await user_cursor.to_list(length=100)
    user_emails = [doc["email"] for doc in user_docs if "email" in doc]
    user_count = len(user_emails)

    return {
        "status": "success",
        "message": "User role changed successfully",
        "target_account": {
            "email": data.email,
            "assigned_role": data.status
        },
        "admins": {
            "count": admin_count,
            "emails": admin_emails
        },
        "users": {
            "count": user_count,
            "emails": user_emails
        }
    }

@router.get("/blog/category/{category_id}/", response_model=List[BlogResponse], operation_id="particular-category")
async def get_blogs_by_category(
    category_id: str,
    lang: str = "ta"
):
    posts = await config.posts_collection.find({
        "category_id": category_id,
        "status": "published"
    }).to_list(length=1000)

    response_list = []

    for post in posts:
        if lang == "en":
            title = translate_text(
                post.get("title_ta", ""),
                "ta",
                "en"
            )

            content = translate_text(
                post.get("content_ta", ""),
                "ta",
                "en"
            )

            author = translate_text(
                post.get("author_ta", ""),
                "ta",
                "en"
            )

            keywords = translate_keywords(
                post.get("keywords_ta", []),
                "ta",
                "en"
            )
        else:
            title = post.get("title_ta", "")
            content = post.get("content_ta", "")
            author = post.get("author_ta", "")
            keywords = post.get("keywords_ta", [])

        cat_detail, sub_detail = await build_nested_relations(
            post.get("category_id"),
            post.get("sub_category_id"),
            target_lang=lang
        )

        response_list.append(
            BlogResponse(
                id=str(post["_id"]),
                category=cat_detail,
                subcategory=sub_detail,
                title=title,
                content=content,
                author=author,
                keywords=keywords,
                image_url=post.get("image_url"),
                media=post.get("media", []),
                video_url=post.get("video_url"),
                created_at=post.get("created_at"),
                language_delivered=lang,
                status=post.get("status", "pending")
            )
        )

    return response_list

@router.delete(
    "/notification/{notification_id}/",
    status_code=status.HTTP_200_OK,
    operation_id="delete-notification"
)
async def delete_notification(notification_id: str):
    try:

        if not ObjectId.is_valid(notification_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid notification id format"
            )


        existing = await config.notifications_collection.find_one(
            {"_id": ObjectId(notification_id)}
        )

        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )


        result = await config.notifications_collection.delete_one(
            {"_id": ObjectId(notification_id)}
        )

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification already deleted"
            )

        return {
            "status": "success",
            "message": "Notification deleted successfully",
            "deleted_id": notification_id
        }


    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete notification: {str(e)}"
        )
