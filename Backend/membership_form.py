from fastapi import APIRouter, Form, UploadFile, File, HTTPException, status,Depends
from typing import Optional
from models import MembershipResponse, MembershipCreateResponse
from config import form_collection,get_current_admin
from datetime import datetime, timezone
import os
import uuid
from email_sender import send_email
import config



router = APIRouter()


UPLOAD_DIR = "static/uploads/membership"

if not os.getenv("VERCEL"):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_FILE_SIZE = 2 * 1024 * 1024



def save_file(file: UploadFile, allowed_extensions: list) -> str:
    ext = file.filename.split(".")[-1].lower()

    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Only {', '.join(allowed_extensions)} files are allowed."
        )


    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0)

    if size == 0:
        raise HTTPException(
            status_code=400,
            detail="Empty file is not allowed."
        )

    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size should not exceed 2 MB."
        )

    filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    return f"/static/uploads/membership/{filename}"



@router.post(
    "/membership/form/",
    response_model=MembershipCreateResponse,
    status_code=status.HTTP_200_OK
)
async def apply_membership(
    teaching_course: str = Form(...),
    name: str = Form(...),
    father_or_husband_name: str = Form(...),
    date_of_birth: str = Form(...),
    qualification: str = Form(...),
    office_or_college_address: str = Form(...),
    mobile_no: str = Form(...),
    extra_qualification: Optional[str] = Form(None),


    photo: UploadFile = File(...),

    #current_admin: dict = Depends(get_current_admin),
    aadhar_card: Optional[UploadFile] = File(None)
):


    if len(name.strip()) < 2:
        raise HTTPException(
            status_code=400,
            detail="Invalid name"
        )


    if not mobile_no.isdigit() or len(mobile_no) != 10:
        raise HTTPException(
            status_code=400,
            detail="Invalid mobile number"
        )


    if not office_or_college_address.strip():
        raise HTTPException(
            status_code=400,
            detail="Office/College address is required"
        )

    existing_member = await form_collection.find_one(
        {"mobile_no": mobile_no}
    )

    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Membership already exists with this mobile number."
        )


    photo_path = save_file(
        photo,
        ["jpg", "jpeg", "png"]
    )


    file_path = None

    if aadhar_card:
        file_path = save_file(
            aadhar_card,
            ["pdf", "jpg", "jpeg", "png"]
        )

    membership_id = str(uuid.uuid4())



    data = {
        "id": membership_id,
        "teaching_course": teaching_course,
        "name": name,
        "father_or_husband_name": father_or_husband_name,
        "date_of_birth": date_of_birth,
        "qualification": qualification,
        "office_or_college_address": office_or_college_address,
        "mobile_no": mobile_no,
        "extra_qualification": extra_qualification,
        "photo_path": photo_path,
        "file_path": file_path,
        "submitted_date": datetime.now(timezone.utc)
    }


    await form_collection.insert_one(data)
    subject = "New Membership Application Received"

    body = f"""
    New Membership Application Received

    Teaching Course        : {teaching_course}
    Name                   : {name}
    Father/Husband Name    : {father_or_husband_name}
    Date of Birth          : {date_of_birth}
    Qualification          : {qualification}
    Office/College Address : {office_or_college_address}
    Mobile Number          : {mobile_no}
    Extra Qualification    : {extra_qualification if extra_qualification else "N/A"}

    Photo Uploaded         : {"Yes" if photo_path else "No"}
    Aadhaar Uploaded       : {"Yes" if file_path else "No"}
    Submitted Date         : {data["submitted_date"]}
    """

    email_sent = send_email(
        to_email=config.ADMIN_EMAIL,
        subject=subject,
        body=body
    )

    return MembershipCreateResponse(
        status=True,
        message="Membership application submitted successfully.",
        email_sent=email_sent,
        data=MembershipResponse(
            id=membership_id,
            teaching_course=teaching_course,
            name=name,
            father_or_husband_name=father_or_husband_name,
            date_of_birth=date_of_birth,
            qualification=qualification,
            office_or_college_address=office_or_college_address,
            mobile_no=mobile_no,
            extra_qualification=extra_qualification,
            photo_path=photo_path,
            file_path=file_path,
            submitted_date=data["submitted_date"]

        )
    )

@router.get(
    "/membership/form/",
    response_model=list[MembershipResponse],
    status_code=status.HTTP_200_OK
)
async def get_all_memberships(admin: dict = Depends(get_current_admin)):

    memberships = await form_collection.find({}, {"_id": 0}).to_list(length=None)

    response = []

    for membership in memberships:
        response.append(
            MembershipResponse(
                id=membership["id"],
                teaching_course=membership["teaching_course"],
                name=membership["name"],
                father_or_husband_name=membership["father_or_husband_name"],
                date_of_birth=membership["date_of_birth"],
                qualification=membership["qualification"],
                office_or_college_address=membership["office_or_college_address"],
                mobile_no=membership["mobile_no"],
                extra_qualification=membership.get("extra_qualification"),
                photo_path=membership["photo_path"],
                file_path=membership.get("file_path"),
                submitted_date=membership.get("submitted_date")
            )
        )

    return response

@router.delete("/membership/form/{membership_id}/")
async def delete_membership(membership_id: str, admin: dict = Depends(get_current_admin)):
    membership = await form_collection.find_one({"id": membership_id})

    if not membership:
        raise HTTPException(
            status_code=404,
            detail="Membership application not found."
        )

    if membership.get("photo_path"):
        photo_file = membership["photo_path"].lstrip("/")
        if os.path.exists(photo_file):
            os.remove(photo_file)

    if membership.get("file_path"):
        aadhaar_file = membership["file_path"].lstrip("/")
        if os.path.exists(aadhaar_file):
            os.remove(aadhaar_file)

    result = await form_collection.delete_one({"id": membership_id})

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=500,
            detail="Failed to delete membership application."
        )

    return {
        "status": True,
        "message": "Membership application deleted successfully."
    }