from fastapi import APIRouter, File, Form, UploadFile, status, HTTPException, Request, Query, Depends
import os
import shutil
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from deep_translator import GoogleTranslator
import config
from config import get_current_admin
from models import CategoryGroupResponse, SubCategoryResponse

router = APIRouter()


UPLOAD_DIR = "static/uploads"

if os.path.exists(UPLOAD_DIR):
    pass
elif not os.getenv("VERCEL"):
    os.makedirs(UPLOAD_DIR, exist_ok=True)




def translate_text(text: str, source_lang: str = 'en', target_lang: str = 'ta', strict: bool = False) -> str:
    if not text or not text.strip():
        return ""
    try:
        return GoogleTranslator(source=source_lang, target=target_lang).translate(text)
    except Exception as e:
        if strict:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Translation failed. Data not stored to keep database purely Tamil."
            )
        return text


def save_uploaded_file(upload_file: UploadFile, prefix: str) -> str:
    unique_file_id = str(uuid.uuid4())[:8]
    clean_filename = "".join(c for c in upload_file.filename if c.isalnum() or c in "._-")
    file_path = f"{UPLOAD_DIR}/{prefix}_{unique_file_id}_{clean_filename}"

    with open(file_path, "wb+") as file_object:
        shutil.copyfileobj(upload_file.file, file_object)
    return file_path


@router.post("/category-add/", response_model=CategoryGroupResponse, status_code=200,operation_id="category-add")
async def add_category_item(
        category_name: str = Form(...),
        category_image: Optional[UploadFile] = File(None),
        subcategory_name: str = Form(...),
        subcategory_image: Optional[UploadFile] = File(None),
        current_admin: dict = Depends(get_current_admin)
):
    if not category_name.strip() or not subcategory_name.strip():
        raise HTTPException(status_code=400, detail="Category and subcategory names cannot be empty")

    # Enforce strict initial conversion into Tamil for text database storage fields
    category_name_ta = translate_text(category_name.strip(), source_lang='en', target_lang='ta', strict=True).lower()
    subcategory_name_ta = translate_text(subcategory_name.strip(), source_lang='en', target_lang='ta',
                                         strict=True).lower()

    existing_record = await config.category_collection.find_one({"category_name": category_name_ta})
    parent_id = existing_record["_id"] if existing_record else str(uuid.uuid4())

    generated_sub_id = str(uuid.uuid4())

    cat_image_path = existing_record.get("image_path") if existing_record else None
    if category_image and category_image.filename:
        cat_image_path = save_uploaded_file(category_image, f"cat_{parent_id}")

    sub_image_path = None
    if subcategory_image and subcategory_image.filename:
        sub_image_path = save_uploaded_file(subcategory_image, f"sub_{generated_sub_id[:8]}")

    new_subcategory = {
        "id": generated_sub_id,
        "name": subcategory_name_ta,
        "image_path": sub_image_path
    }

    if existing_record:
        if "subcategories" not in existing_record or not isinstance(existing_record["subcategories"], list):
            await config.category_collection.update_one({"_id": parent_id}, {"$set": {"subcategories": []}})

        for sub in existing_record.get("subcategories", []):
            if sub.get("name") == subcategory_name_ta:
                raise HTTPException(status_code=400,
                                    detail=f"Subcategory named '{subcategory_name_ta}' already exists.")

        await config.category_collection.update_one(
            {"_id": parent_id},
            {
                "$push": {"subcategories": new_subcategory},
                "$set": {"image_path": cat_image_path}
            }
        )
    else:
        new_record = {
            "_id": parent_id,
            "category_name": category_name_ta,
            "image_path": cat_image_path,
            "subcategories": [new_subcategory]
        }
        await config.category_collection.insert_one(new_record)

    updated_record = await config.category_collection.find_one({"_id": parent_id})

    return CategoryGroupResponse(
        id=str(updated_record["_id"]),
        category_name=updated_record["category_name"],
        image_path=updated_record.get("image_path"),
        subcategories=[
            SubCategoryResponse(id=s["id"], name=s["name"], image_path=s.get("image_path"))
            for s in updated_record.get("subcategories", [])
        ],
        language_delivered="ta"
    )



@router.get("/category/search/",operation_id="category-search")
async def search_category(
    category: str = Query(""),
    lang: str = Query("ta")
):
    search_text = category.strip().lower()

    records = await config.category_collection.find({}).to_list(length=100)

    results = []

    for item in records:

        category_name = item.get("category_name", "")

        display_name = category_name

        if lang == "en":
            display_name = translate_text(
                category_name,
                source_lang="ta",
                target_lang="en"
            )

        if display_name.lower().startswith(search_text):

            results.append({
                "_id": str(item["_id"]),
                "category_name": display_name,
                "image_path": item.get("image_path")
            })

            if len(results) >= 10:
                break

    return {
        "status": "success",
        "data": results
    }


@router.get("/subcategory/search/", operation_id="searchSubCategory")
async def search_subcategory(
    subcategory: str = Query(""),
    lang: str = Query("ta")
):
    search_text = subcategory.strip().lower()

    if not search_text:
        raise HTTPException(
            status_code=400,
            detail="Subcategory search text cannot be empty"
        )

    records = await config.category_collection.find({}).to_list(length=100)

    results = []

    for item in records:

        parent_category = item.get("category_name", "")

        if lang == "en":
            try:
                parent_category = translate_text(
                    parent_category,
                    source_lang="ta",
                    target_lang="en"
                )
            except:
                pass

        for sub in item.get("subcategories", []):

            sub_name = sub.get("name", "")

            display_sub_name = sub_name

            if lang == "en":
                try:
                    display_sub_name = translate_text(
                        sub_name,
                        source_lang="ta",
                        target_lang="en"
                    )
                except:
                    pass

            if display_sub_name.lower().startswith(search_text):

                results.append({
                    "subcategory_id": sub.get("id"),
                    "subcategory_name": display_sub_name,
                    "image_path": sub.get("image_path"),
                    "category_id": str(item["_id"]),
                    "parent_category": parent_category
                })

    return {
        "status": "success",
        "message": "Subcategory search successful",
        "data": results
    }

@router.put("/update-category/{category_id}/", response_model=CategoryGroupResponse,operation_id="updateCategory")
async def modify_category_items(
        category_id: str,
        target_subcategory_id: Optional[str] = Form(None),
        category_image: Optional[UploadFile] = File(None),
        subcategory_image: Optional[UploadFile] = File(None),
        lang_preference: str = Form("ta"),
        current_admin: dict = Depends(get_current_admin)
):
    existing_record = await config.category_collection.find_one({"_id": category_id})
    if not existing_record:
        raise HTTPException(status_code=404, detail="Category record not found")

    update_data = {}

    # 1. Main Category image modifications processing
    if category_image and category_image.filename:
        update_data["image_path"] = save_uploaded_file(category_image, f"cat_{category_id}")

    if update_data:
        await config.category_collection.update_one({"_id": category_id}, {"$set": update_data})

    # 2. Array filtering image properties update execution
    if target_subcategory_id and target_subcategory_id.strip():
        sub_id = target_subcategory_id.strip()

        if subcategory_image and subcategory_image.filename:
            result = await config.category_collection.update_one(
                {"_id": category_id},
                {"$set": {
                    "subcategories.$[sub].image_path": save_uploaded_file(subcategory_image, f"sub_{sub_id[:8]}")}},
                array_filters=[{"sub.id": sub_id}]
            )
            if result.matched_count == 0:
                raise HTTPException(
                    status_code=404,
                    detail=f"Subcategory ID '{sub_id}' not found under this category group."
                )

    # 3. Fetch fresh data out of MongoDB and parse languages dynamically before returning
    updated_record = await config.category_collection.find_one({"_id": category_id})

    category_name = updated_record["category_name"]
    subcategories_list = updated_record.get("subcategories", [])

    if lang_preference == "en":
        category_name = translate_text(category_name, source_lang='ta', target_lang='en')
        processed_subs = [
            SubCategoryResponse(
                id=s["id"],
                name=translate_text(s["name"], source_lang='ta', target_lang='en'),
                image_path=s.get("image_path")
            ) for s in subcategories_list
        ]
    else:
        processed_subs = [
            SubCategoryResponse(id=s["id"], name=s["name"], image_path=s.get("image_path"))
            for s in subcategories_list
        ]

    return CategoryGroupResponse(
        id=str(updated_record["_id"]),
        category_name=category_name,
        image_path=updated_record.get("image_path"),
        subcategories=processed_subs,
        language_delivered=lang_preference
    )


# --- 4. DELETE ---
@router.delete("/remove/{category_id}/",operation_id="delete-category")
async def remove_category_or_subcategory(
        category_id: str,
        target_subcategory_id: Optional[str] = Form(None),
        current_admin: dict = Depends(get_current_admin)
):
    existing_record = await config.category_collection.find_one({"_id": category_id})
    if not existing_record:
        raise HTTPException(status_code=404, detail="Category group record not found")

    if target_subcategory_id:
        await config.category_collection.update_one(
            {"_id": category_id},
            {"$pull": {"subcategories": {"id": target_subcategory_id.strip()}}}
        )
        return {"status": "success", "message": f"Subcategory '{target_subcategory_id}' successfully removed."}

    await config.category_collection.delete_one({"_id": category_id})
    return {"status": "success", "message": "Category document wiped completely."}
# --- 5. GET ALL CATEGORIES ---
@router.get("/category-all/", response_model=List[CategoryGroupResponse])
async def get_all_categories(lang: str = Query("ta")):
    records = await config.category_collection.find({}).to_list(length=1000)

    result = []

    for record in records:
        category_name = record.get("category_name", "")
        subcategories = record.get("subcategories", [])

        if lang == "en":
            category_name = translate_text(
                category_name,
                source_lang="ta",
                target_lang="en"
            )

            processed_subs = [
                SubCategoryResponse(
                    id=sub["id"],
                    name=translate_text(
                        sub["name"],
                        source_lang="ta",
                        target_lang="en"
                    ),
                    image_path=sub.get("image_path")
                )
                for sub in subcategories
            ]
        else:
            processed_subs = [
                SubCategoryResponse(
                    id=sub["id"],
                    name=sub["name"],
                    image_path=sub.get("image_path")
                )
                for sub in subcategories
            ]

        result.append(
            CategoryGroupResponse(
                id=str(record["_id"]),
                category_name=category_name,
                image_path=record.get("image_path"),
                subcategories=processed_subs,
                language_delivered=lang
            )
        )

    return result

