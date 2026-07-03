from fastapi import APIRouter, HTTPException, Query, Depends, status
from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException, Form
from config import users_collection, payment_collection, get_current_admin
from models import PaymentCreateResponse, SearchUsersResponse

router = APIRouter()


@router.post(
    "/admin/payment/create/",
    response_model=PaymentCreateResponse,
    status_code=status.HTTP_200_OK
)
async def create_payment(
    payment_id: str = Form(...),
    email: str = Form(...),
    amount: float = Form(...),
    admin: dict = Depends(get_current_admin)
):

    try:
        user = await users_collection.find_one({"email": email})

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        payment_data = {
            "payment_id": payment_id,
            "user_id": str(user["_id"]),
            "email": user["email"],
            "amount": amount,
            "created_at": datetime.utcnow()
        }

        result = await payment_collection.insert_one(payment_data)

        return {
            "success": True,
            "message": "Payment created successfully",
            "data": {
                "id": str(result.inserted_id),
                "payment_id": payment_id,
                "user_id": str(user["_id"]),
                "email": user["email"],
                "amount": amount,
                "created_at": payment_data["created_at"]
            }
        }



    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
@router.get("/users/search/", response_model=SearchUsersResponse, status_code=status.HTTP_200_OK)
async def search_users(search: str = Query(...),admin: dict = Depends(get_current_admin)):

    try:
        emails = []

        cursor = users_collection.find({
            "email": {
                "$regex": search,
                "$options": "i"
            }
        })

        async for user in cursor:
            emails.append(user["email"])

        return {
            "success": True,
            "data": emails
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )



@router.get("/payments/all/")
async def get_all_payments(admin: dict = Depends(get_current_admin)):
    try:
        payments = await payment_collection.find().sort("created_at", -1).to_list(None)

        response = []

        for payment in payments:
            response.append({
                "id": str(payment["_id"]),
                "payment_id": payment.get("payment_id"),
                "user_id": payment.get("user_id"),
                "email": payment.get("email"),
                "amount": payment.get("amount"),
                "created_at": payment.get("created_at"),
            })

        return {
            "success": True,
            "count": len(response),
            "data": response
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.delete("/payments/delete/{payment_id}/")
async def delete_payment(payment_id: str):
    try:
        result = await payment_collection.delete_one(
            {"_id": ObjectId(payment_id)}
        )

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Payment not found."
            )

        return {
            "success": True,
            "message": "Payment deleted successfully."
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )