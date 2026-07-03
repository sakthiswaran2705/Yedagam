from fastapi import APIRouter, Depends
import config

from config import get_current_admin

router = APIRouter()

@router.get("/annual/report/", operation_id="AnnualReport")
async def annual_report(
    #current_admin: dict = Depends(get_current_admin)
):
    # Posts Collection
    total_posts = await config.posts_collection.count_documents({})
    published_posts = await config.posts_collection.count_documents(
        {"status": "published"}
    )
    pending_posts = await config.posts_collection.count_documents(
        {"status": "pending"}
    )

    # Book Store Collection
    total_books = await config.book_store_collection.count_documents({})
    published_books = await config.book_store_collection.count_documents(
        {"status": "published"}
    )
    pending_books = await config.book_store_collection.count_documents(
        {"status": "pending"}
    )

    return {
        "posts": {
            "total": total_posts,
            "published": published_posts,
            "pending": pending_posts
        },
        "books": {
            "total": total_books,
            "published": published_books,
            "pending": pending_books
        },
        "summary": {
            "total_content": total_posts + total_books,
            "total_published": published_posts + published_books,
            "total_pending": pending_posts + pending_books
        }
    }


@router.get("/report/monthly/")
async def monthly_report():
    try:

        posts = await config.posts_collection.find().to_list(None)

        report = {}

        for post in posts:

            year = post["created_at"].year
            month = post["created_at"].month

            key = f"{year}-{month}"

            if key not in report:
                report[key] = 0

            report[key] += 1

        return {
            "success": True,
            "data": report
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/report/yearly/")
async def yearly_report():
    try:

        posts = await config.posts_collection.find().to_list(None)

        report = {} 

        for post in posts:

            year = str(post["created_at"].year)

            if year not in report:
                report[year] = 0

            report[year] += 1

        return {
            "success": True,
            "data": report
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )