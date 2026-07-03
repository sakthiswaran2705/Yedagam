from fastapi import APIRouter, Form, HTTPException, status,Depends
import uuid
import config
from models import ContactResponse

router = APIRouter()

from config import get_current_user,get_current_admin

@router.post(
    "/contact/details/",
    response_model=ContactResponse,
    status_code=200,
    operation_id="contact-details"
)
async def contact_create(

    name: str = Form(...),
    email: str = Form(...),
    place: str = Form(...),
    district: str = Form(...),
    mobile: str = Form(...)
):
    try:
        form_data = {
             "id": str(uuid.uuid4()),
            "name": name,
            "email": email,
            "place": place,
            "district": district,
            "mobile": mobile
        }

        await config.contact_collection.insert_one(form_data)

        return {
            "status": "success",
            "message": "Contact saved successfully",
            "data": form_data
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save: {str(e)}"
        )

@router.get("/contact/all/", status_code=200)
async def get_all_contacts(current_admin: dict = Depends(get_current_admin),):
    try:
        contacts = await config.contact_collection.find({}, {"_id": 0}).to_list(length=None)

        return {
            "status": "success",
            "message": "Contacts fetched successfully",
            "count": len(contacts),
            "data": contacts
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch contacts: {str(e)}"
        )

@router.delete("/contact/delete/{contact_id}/", status_code=200)
async def delete_contact(contact_id: str,current_admin: dict = Depends(get_current_admin),):
    try:
        result = await config.contact_collection.delete_one(
            {"id": contact_id}
        )

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Contact not found"
            )

        return {
            "status": "success",
            "message": "Contact deleted successfully"
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete contact: {str(e)}"
        )