from fastapi import APIRouter, Form, HTTPException, Depends
from datetime import datetime, timezone
from typing import Optional
from bson import ObjectId
import config
from email_sender import send_email
from config import get_current_admin

router = APIRouter()


@router.post("/donate-by/", status_code=200)
async def donate_by(
    message: str = Form(...),
    email: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    # current_user: dict = Depends(get_current_user)
):
    if not email and not phone:
        raise HTTPException(
            status_code=400,
            detail="Please provide either an email or phone number."
        )

    donate_data = {
        # "user_id": str(current_user["_id"]),
        "email": email,
        "phone": phone,
        "message": message,
        "created_at": datetime.now(timezone.utc),
    }

    # Insert into DB
    result = await config.donate_collection.insert_one(donate_data)

    subject = "New Donation Request Received"


    body = f"""
New Donation Request Received

Message : {message}
Email   : {email if email else "N/A"}
Phone   : {phone if phone else "N/A"}
Time    : {donate_data["created_at"].isoformat()}

"""


    email_sent = send_email(
        to_email=config.ADMIN_EMAIL,
        subject=subject,
        body=body,
        reply_to=email
    )

    return {
        "status": True,
        "message": "Donation request submitted successfully.",
        "id": str(result.inserted_id),
        "email_sent": email_sent
    }


@router.get("/donate-by/all/", status_code=200)
async def get_all_donations(
     current_admin: dict = Depends(get_current_admin),
):
    donations = []

    async for item in config.donate_collection.find().sort("created_at", -1):
        item["_id"] = str(item["_id"])

        if item.get("created_at"):
            item["created_at"] = item["created_at"].isoformat()

        donations.append(item)

    return {
        "status": True,
        "count": len(donations),
        "data": donations,
    }


@router.delete("/donate-by/delete/{donate_id}/", status_code=200)
async def delete_donation(
    donate_id: str,
    current_admin: dict = Depends(get_current_admin),
):

    donation = await config.donate_collection.find_one(
        {"_id": ObjectId(donate_id)}
    )

    if not donation:
        raise HTTPException(
            status_code=404,
            detail="Donation request not found."
        )

    # Delete donation
    await config.donate_collection.delete_one(
        {"_id": ObjectId(donate_id)}
    )

    return {
        "status": True,
        "message": "Donation request deleted successfully."
    }
