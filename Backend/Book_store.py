from fastapi import APIRouter, Form, File, UploadFile, HTTPException, status, Depends, Query
from datetime import datetime
from typing import Optional
import os
import uuid
from bson import ObjectId
import config
from config import books_collection,get_current_admin
from models import BookCreateResponse, BookResponse
from Yedagam_operations import translate_to_en_logic
from translator import en_to_ta, ta_to_en

router = APIRouter()


UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post(
    "/create/",
    response_model=BookCreateResponse,
    status_code=status.HTTP_200_OK
)
async def create_book(
    title: str = Form(...),
    price: float = Form(...),
    description: str = Form(...),
    offer: str = Form(...),
    pages: int = Form(...),
    author: str = Form(...),
    image_file: UploadFile = File(...),
    admin: dict = Depends(get_current_admin)
):
    try:


        if not title:
            raise HTTPException(status_code=400, detail="Title is required")

        if not description:
            raise HTTPException(status_code=400, detail="Description is required")

        if not author:
            raise HTTPException(status_code=400, detail="Author is required")

        if price <= 0:
            raise HTTPException(status_code=400, detail="Price must be greater than 0")

        if pages <= 0:
            raise HTTPException(status_code=400, detail="Pages must be greater than 0")


        if not image_file.filename.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            raise HTTPException(status_code=400, detail="Invalid image format")


        file_name = f"{uuid.uuid4()}_{image_file.filename}"
        file_path = os.path.join(UPLOAD_DIR, file_name)

        with open(file_path, "wb") as buffer:
            buffer.write(await image_file.read())

        image_url = f"static/uploads/{file_name}"

        title_ta = en_to_ta(title)
        description_ta = en_to_ta(description)
        author_ta = en_to_ta(author)

        try:
            offer_value = float(offer.replace("%", "").strip())
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Offer must be a valid number"
            )

        book_data = {
            "title": title_ta,
            "price": price,
            "description": description_ta,
            "offer": offer_value,
            "pages": pages,
            "author": author_ta,
            "image_url": image_url,
            "created_at": datetime.utcnow(),
            "status": "pending"


        }

        result = await books_collection.insert_one(book_data)

        return BookCreateResponse(
            success=True,
            message="Book added successfully",
            data=BookResponse(
                id = str(result.inserted_id),
                title=title_ta,
                description=description_ta,
                author=author_ta,
                price=price,
                offer=offer,
                pages=pages,
                image_url=image_url,
                created_at=book_data["created_at"],
                status="pending"
            )
        )



    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get(
    "/get/all/",
    response_model=list[BookResponse],
    status_code=status.HTTP_200_OK
)
async def get_books(
    lang: str = Query("ta")
):
    try:

        books = await books_collection.find().to_list(None)

        response = []

        for book in books:

            title = book.get("title", "")
            description = book.get("description", "")
            author = book.get("author", "")

            if lang == "en":
                title = ta_to_en(title)
                description = ta_to_en(description)
                author = ta_to_en(author)

            response.append(
                BookResponse(
                    id=str(book["_id"]),
                    title=title,
                    description=description,
                    author=author,
                    price=book.get("price"),
                    offer=book.get("offer"),
                    pages=book.get("pages"),
                    image_url=book.get("image_url"),
                    created_at=book.get("created_at"),
                    status=book.get("status", "pending")
                )
            )

        return response

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
@router.put(
    "/update/{book_id}/",
    response_model=BookCreateResponse,
    status_code=status.HTTP_200_OK
)
async def update_book(
    book_id: str,
    title: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    description: Optional[str] = Form(None),
    offer: Optional[str] = Form(None),
    pages: Optional[int] = Form(None),
    author: Optional[str] = Form(None),
    image_file: Optional[UploadFile] = File(None),
    admin: dict = Depends(get_current_admin)
):
    try:

        book = await books_collection.find_one(
            {"_id": ObjectId(book_id)}
        )

        if not book:
            raise HTTPException(
                status_code=404,
                detail="Book not found"
            )

        update_data = {}


        if title:
            update_data["title"] = en_to_ta(title)

        if description:
            update_data["description"] = en_to_ta(description)

        if author:
            update_data["author"] = en_to_ta(author)


        if price is not None:
            if price <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="Price must be greater than 0"
                )
            update_data["price"] = price

        if pages is not None:
            if pages <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="Pages must be greater than 0"
                )
            update_data["pages"] = pages

        if offer is not None:
            try:
                update_data["offer"] = float(
                    offer.replace("%", "").strip()
                )
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Offer must be a valid number"
                )


        if image_file:

            if not image_file.filename.lower().endswith(
                (".jpg", ".jpeg", ".png", ".webp")
            ):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid image format"
                )

            file_name = f"{uuid.uuid4()}_{image_file.filename}"
            file_path = os.path.join(UPLOAD_DIR, file_name)

            with open(file_path, "wb") as buffer:
                buffer.write(await image_file.read())

            update_data["image_url"] = f"static/uploads/{file_name}"

        update_data["updated_at"] = datetime.utcnow()

        await books_collection.update_one(
            {"_id": ObjectId(book_id)},
            {"$set": update_data}
        )

        updated_book = await books_collection.find_one(
            {"_id": ObjectId(book_id)}
        )

        return BookCreateResponse(
            success=True,
            message="Book updated successfully",
            data=BookResponse(
                id=str(updated_book["_id"]),
                title=updated_book["title"],
                description=updated_book["description"],
                author=updated_book["author"],
                price=updated_book["price"],
                offer=updated_book["offer"],
                pages=updated_book["pages"],
                image_url=updated_book["image_url"],
                created_at=updated_book["created_at"],
                status=updated_book.get("status", "pending")
            )
        )



    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.delete(
    "/delete/{book_id}/",
    status_code=status.HTTP_200_OK
)
async def delete_book(
    book_id: str,
    admin: dict = Depends(get_current_admin)
):
    try:

        book = await books_collection.find_one(
            {"_id": ObjectId(book_id)}
        )

        if not book:
            raise HTTPException(
                status_code=404,
                detail="Book not found"
            )

        await books_collection.delete_one(
            {"_id": ObjectId(book_id)}
        )

        return {
            "success": True,
            "message": "Book deleted successfully"
        }


    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.post("/status/replacer/{book_id}/")
async def status_replacer(
    book_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    book = await books_collection.find_one(
        {"_id": ObjectId(book_id)}
    )

    if not book:
        raise HTTPException(
            status_code=404,
            detail="Book not found"
        )

    new_status = (
        "published"
        if book.get("status") == "pending"
        else "pending"
    )

    await books_collection.update_one(
        {"_id": ObjectId(book_id)},
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


@router.get(
    "/published/all/",
    response_model=list[BookResponse],
    status_code=status.HTTP_200_OK
)

async def get_published_books(
    lang: str = Query("ta")
):
    try:

        books = await books_collection.find(
            {"status": "published"}
        ).to_list(None)

        response = []

        for book in books:

            title = book.get("title", "")
            description = book.get("description", "")
            author = book.get("author", "")

            if lang == "en":
                title = translate_to_en_logic(title)
                description = translate_to_en_logic(description)
                author = translate_to_en_logic(author)

            response.append(
                BookResponse(
                    id=str(book["_id"]),
                    title=title,
                    description=description,
                    author=author,
                    price=book.get("price"),
                    offer=book.get("offer"),
                    pages=book.get("pages"),
                    image_url=book.get("image_url"),
                    created_at=book.get("created_at"),
                    status=book.get("status")
                )
            )

        return response

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )