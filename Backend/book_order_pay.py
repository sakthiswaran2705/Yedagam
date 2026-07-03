from fastapi import APIRouter,HTTPException,status,Query,Depends
from pydantic import BaseModel
from bson import ObjectId
from email_sender import send_email
from config import books_collection,book_order_collection
from datetime import datetime
from pydantic import BaseModel
from typing import List
from models import ConfirmOrderRequest,BookCreateResponse, BookResponse
from Yedagam_operations import translate_to_en_logic
import config
from config import get_current_user

router = APIRouter()



@router.post("/book/order/")
async def confirm_book_order(data: ConfirmOrderRequest,current_user: dict = Depends(get_current_user)):

    try:

        order_books = []
        total_books = 0
        total_amount = 0

        for item in data.books:

            book = await books_collection.find_one({
                "_id": ObjectId(item.book_id),

            })

            if not book:
                raise HTTPException(
                    status_code=404,
                    detail=f"Book not found : {item.book_id}"
                )

            quantity = item.quantity

            price = (
                book.get("offer")
                if book.get("offer") not in [None, "", 0]
                else book.get("price")
            )

            subtotal = price * quantity

            total_books += quantity
            total_amount += subtotal

            order_books.append({
                "book_id": str(book["_id"]),
                "title": book.get("title"),
                "author": book.get("author"),
                "price": book.get("price"),
                "offer": book.get("offer"),
                "quantity": quantity,
                "subtotal": subtotal,
                "image_url": book.get("image_url")
            })

        order = {
            "user_name": data.user_name,
            "email": data.email,
            "phone": data.phone,
            "books": order_books,
            "total_books": total_books,
            "total_amount": total_amount,
            "payment_status": "Pending",
            "order_status": "Pending",
            "created_at": datetime.utcnow()
        }

        result = await book_order_collection.insert_one(order)

        subject = "New Book Order"

        body = f"""
New Book Order Received

Order ID : {result.inserted_id}

Name : {data.user_name}
Email : {data.email}
Phone : {data.phone}

Total Books : {total_books}
Total Amount : ₹{total_amount}

Please verify the payment and process the order.
"""

        send_email(
            to_email=config.ADMIN_EMAIL,
            subject=subject,
            body=body,
            reply_to=data.email
        )

        return {
            "success": True,
            "message": "Order placed successfully.",
            "order_id": str(result.inserted_id),
            "total_books": total_books,
            "total_amount": total_amount
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
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