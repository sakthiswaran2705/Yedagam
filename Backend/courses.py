from fastapi import APIRouter, Form, File, UploadFile, HTTPException, status, Query, Depends
from datetime import datetime
import os
import uuid
from bson import ObjectId
from typing import List
from config import courses_collection, get_current_admin
from models import CourseCreateResponse, CourseResponse
from translator import en_to_ta, ta_to_en
from datetime import datetime
router = APIRouter()

UPLOAD_DIR = "static/courses"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"]
MAX_FILE_SIZE = 5 * 1024 * 1024


@router.post(
    "/create-courses/",
    response_model=CourseCreateResponse,
    status_code=status.HTTP_200_OK
)
async def create_course(
        title: str = Form(...),
        description: str = Form(...),
        price: float = Form(...),

        start_date: str = Form(...),
        start_time: str = Form(...),

        end_date: str = Form(...),
        end_time: str = Form(...),

        image_file: UploadFile = File(...),
        admin: dict = Depends(get_current_admin)
):
    if not title:
        raise HTTPException(status_code=400, detail="Title is required")

    if price <= 0:
        raise HTTPException(status_code=400, detail="Price must be greater than 0")

    if image_file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid image format")

    contents = await image_file.read()

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large")

    file_ext = image_file.filename.split(".")[-1]
    file_name = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)

    with open(file_path, "wb") as f:
        f.write(contents)

    image_url = f"static/courses/{file_name}"

    tamil_title = en_to_ta(title)
    tamil_description = en_to_ta(description)
    start_date = datetime.strptime(start_date, "%d/%m/%Y").strftime("%Y-%m-%d")
    end_date = datetime.strptime(end_date, "%d/%m/%Y").strftime("%Y-%m-%d")

    course_data = {
        "title": tamil_title,
        "description": tamil_description,
        "price": price,

        "start_date": start_date,
        "start_time": start_time,
        "end_date": end_date,
        "end_time": end_time,

        "image_url": image_url,
        "status": "pending",
        "created_at": datetime.utcnow()
    }

    result = await courses_collection.insert_one(course_data)

    return CourseCreateResponse(
        success=True,
        message="Course created successfully",
        data=CourseResponse(
            id=str(result.inserted_id),
            title=tamil_title,
            description=tamil_description,
            price=price,

            start_date=start_date,
            start_time=start_time,
            end_date=end_date,
            end_time=end_time,

            image_url=image_url,
            status="pending",
            created_at=course_data["created_at"]
        )
    )


@router.get("/all-courses/", response_model=List[CourseResponse], status_code=status.HTTP_200_OK)
async def get_all_courses(lang: str = Query("ta")):
    try:
        response = []

        async for course in courses_collection.find():

            title = course.get("title", "")
            description = course.get("description", "")

            if lang == "en":
                title = ta_to_en(title)
                description = ta_to_en(description)

            response.append(
                CourseResponse(
                    id=str(course["_id"]),
                    title=title,
                    description=description,
                    price=course.get("price", 0),

                    start_date=course.get("start_date", ""),
                    start_time=course.get("start_time", ""),
                    end_date=course.get("end_date", ""),
                    end_time=course.get("end_time", ""),

                    image_url=course.get("image_url", ""),
                    created_at=course.get("created_at"),
                    status=course.get("status", "pending")
                )
            )

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put(
    "/update/{course_id}/",
    response_model=CourseCreateResponse,
    status_code=status.HTTP_200_OK
)
async def update_course(
        course_id: str,

        title: str = Form(None),
        description: str = Form(None),
        price: float = Form(None),

        start_date: str = Form(None),
        start_time: str = Form(None),

        end_date: str = Form(None),
        end_time: str = Form(None),

        image_file: UploadFile = File(None),
        admin: dict = Depends(get_current_admin)
):
    course = await courses_collection.find_one({"_id": ObjectId(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if not ObjectId.is_valid(course_id):
        raise HTTPException(status_code=400, detail="Invalid course ID")

    update_data = {}

    if title:
        update_data["title"] = en_to_ta(title)

    if description:
        update_data["description"] = en_to_ta(description)

    if price is not None:
        if price <= 0:
            raise HTTPException(status_code=400, detail="Price must be greater than 0")
        update_data["price"] = price

    if start_date:
        update_data["start_date"] = datetime.strptime(
            start_date, "%d/%m/%Y"
        ).strftime("%Y-%m-%d")

    if start_time:
        update_data["start_time"] = start_time
    if end_date:
        update_data["end_date"] = datetime.strptime(
            end_date, "%d/%m/%Y"
        ).strftime("%Y-%m-%d")
    if end_time:
        update_data["end_time"] = end_time

    if image_file:
        if image_file.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(status_code=400, detail="Invalid image format")

        contents = await image_file.read()

        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        file_ext = image_file.filename.split(".")[-1]
        file_name = f"{uuid.uuid4()}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, file_name)

        with open(file_path, "wb") as f:
            f.write(contents)

        update_data["image_url"] = f"static/courses/{file_name}"

    await courses_collection.update_one(
        {"_id": ObjectId(course_id)},
        {"$set": update_data}
    )

    updated_course = await courses_collection.find_one({"_id": ObjectId(course_id)})

    return CourseCreateResponse(
        success=True,
        message="Course updated successfully",
        data=CourseResponse(
            id=str(updated_course["_id"]),
            title=updated_course.get("title"),
            description=updated_course.get("description"),
            price=updated_course.get("price"),

            start_date=updated_course.get("start_date"),
            start_time=updated_course.get("start_time"),
            end_date=updated_course.get("end_date"),
            end_time=updated_course.get("end_time"),

            image_url=updated_course.get("image_url"),
            status=updated_course.get("status", "pending"),
            created_at=updated_course.get("created_at")
        )
    )


@router.delete("/delete/{course_id}/", status_code=status.HTTP_200_OK)
async def delete_course(
        course_id: str,
        admin: dict = Depends(get_current_admin)
):
    try:

        if not ObjectId.is_valid(course_id):
            raise HTTPException(status_code=400, detail="Invalid course ID")

        course = await courses_collection.find_one({"_id": ObjectId(course_id)})
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        await courses_collection.delete_one({"_id": ObjectId(course_id)})

        return {
            "success": True,
            "message": "Course deleted successfully",
            "data": {
                "id": course_id
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/status/replacer/courses/{course_id}/")
async def course_status_replacer(
        course_id: str,
        current_admin: dict = Depends(get_current_admin)
):
    if not ObjectId.is_valid(course_id):
        raise HTTPException(status_code=400, detail="Invalid course ID")

    course = await courses_collection.find_one({"_id": ObjectId(course_id)})

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    new_status = (
        "published"
        if course.get("status") == "pending"
        else "pending"
    )

    await courses_collection.update_one(
        {"_id": ObjectId(course_id)},
        {"$set": {"status": new_status}}
    )

    return {
        "success": True,
        "message": "Course status updated successfully",
        "status": new_status
    }


@router.get(
    "/published/all/courses/",
    response_model=list[CourseResponse],
    status_code=status.HTTP_200_OK
)
async def get_published_courses(
        lang: str = Query("ta")
):
    try:

        courses = await courses_collection.find(
            {"status": "published"}
        ).to_list(None)

        response = []

        for course in courses:

            title = course.get("title", "")
            description = course.get("description", "")

            if lang == "en":
                title = ta_to_en(title)
                description = ta_to_en(description)

            response.append(
                CourseResponse(
                    id=str(course["_id"]),
                    title=title,
                    description=description,
                    price=course.get("price", 0),

                    start_date=course.get("start_date", ""),
                    start_time=course.get("start_time", ""),
                    end_date=course.get("end_date", ""),
                    end_time=course.get("end_time", ""),

                    image_url=course.get("image_url", ""),
                    created_at=course.get("created_at"),
                    status=course.get("status", "pending")
                )
            )

        return response

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


