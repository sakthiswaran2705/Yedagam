
from fastapi import APIRouter, File, Form, UploadFile, status, HTTPException, Request, Depends,Query
import os
import shutil
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from deep_translator import GoogleTranslator

import config
from config import get_current_admin
from models import BlogResponse, CategoryDetail, SubCategoryDetail,LoginRequest,ChangeUserRoleRequest,NotificationResponse
from Yedagam_operations import translate_text,translate_keywords,build_nested_relations,translate_to_en_logic
from translator import ta_to_en

router = APIRouter()


@router.get(
    "/All/blogs/yedagam/",
    response_model=List[BlogResponse],
    operation_id="All-Blogs"
)

async def Blog_all_yedagam(
    lang: str = "ta",
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    cursor = (
        config.posts_collection
        .find({"status": "published"})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    
    posts = await cursor.to_list(length=limit)

    response_list = []

    for post in posts:
        final_image_urls = []

        raw_urls = post.get("image_urls")
        if isinstance(raw_urls, list):
            for item in raw_urls:
                if isinstance(item, dict):
                    img = (
                        item.get("path")
                        or item.get("image")
                        or item.get("main_image")
                    )
                else:
                    img = item

                if img:
                    final_image_urls.append(str(img))

        if lang == "en":
            title = ta_to_en(post.get("title_ta", ""))
            content = ta_to_en(post.get("content_ta", ""))
            author = ta_to_en(post.get("author_ta", ""))
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
                title=str(title),
                content=str(content),
                author=str(author),
                keywords=[str(k) for k in keywords],
                image_url=str(post.get("image_url"))
                if post.get("image_url")
                else None,
                image_urls=final_image_urls,
                video_url=str(post.get("video_url"))
                if post.get("video_url")
                else None,
                created_at=post.get("created_at"),
                language_delivered=lang,
            )
        )

    return response_list


@router.get("/notification/", response_model=List[NotificationResponse])
async def fetch_user_notifications(lang: str = "ta"):

    cursor = config.notifications_collection.find({})
    user_notifications = await cursor.to_list(length=None)

    response_list = []

    for notif in user_notifications:
        title = notif.get("title", "Alert")
        notif_type = notif.get("notif_type", "blog_published")
        message = notif.get("message", "")

        if lang == "en":
            title = ta_to_en(title)
            notif_type = ta_to_en(notif_type)
            message = ta_to_en(message)

        response_list.append(
            NotificationResponse(
                notification_id=str(notif["_id"]),
                user_id=str(notif["user_id"]),
                title=title,
                notif_type=notif_type,
                message=message,
                blog_id=str(notif.get("blog_id", "")),
                image_url=notif.get("image_url"),
                is_read=bool(notif.get("is_read", False)),
                created_at=notif.get("created_at")
            )
        )

    return response_list