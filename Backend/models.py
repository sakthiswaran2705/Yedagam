from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, File, Form, UploadFile


class LoginRequest(BaseModel):
    username: str
    password: str

class CategoryDetail(BaseModel):
    id: str
    name: str  # Dynamically populated with category_name (translated if lang='en')

class SubCategoryDetail(BaseModel):
    id: str
    name: str  # Dynamically populated with subcategory name (translated if lang='en')
    category_id: str
class MediaItem(BaseModel):
    type: str
    path: str
class BlogResponse(BaseModel):
    id: str
    category: Optional[CategoryDetail] = None
    subcategory: Optional[SubCategoryDetail] = None
    title: str
    content: str
    author: str
    keywords: List[str] = []
    image_url: Optional[str] = None

    media: Optional[List[MediaItem]] = None

    video_url: Optional[str] = None
    created_at: datetime
    language_delivered: str = "ta"
    status: Optional[str] = "pending"

    class Config:
        from_attributes = True

class SubCategoryResponse(BaseModel):
    id: str
    name: str
    image_path: Optional[str] = None

    class Config:
        from_attributes = True

class CategoryGroupResponse(BaseModel):
    id: str
    category_name: str
    image_path: Optional[str] = None
    subcategories: List[SubCategoryResponse] = []
    language_delivered: str = "ta"

    class Config:
        from_attributes = True
class ChangeUserRoleRequest(BaseModel):

    email: str
    status: str  # admin or user


class NotificationResponse(BaseModel):
    notification_id: str
    user_id: str
    title: str
    notif_type: str
    message: str
    blog_id: str | None = None
    image_url: str | None = None
    is_read: bool
    created_at: datetime | None = None
class BookResponse(BaseModel):
    id: str
    title: str
    description: str
    author: str
    price: float
    offer: float
    pages: int
    image_url: str
    created_at: datetime
    status: str

    class Config:
        from_attributes = True


# ---------------- BOOK CREATE RESPONSE ----------------
class BookCreateResponse(BaseModel):
    success: bool
    message: str
    data: BookResponse

class CreateContact(BaseModel):
    id: str
    name: str
    email:str
    place: str
    district: str
    mobile: str

class ContactResponse(BaseModel):
    status: str
    message: str
    data: CreateContact


class PaymentResponse(BaseModel):
    id: str
    payment_id: str
    user_id: str
    email: str
    amount: float
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaymentCreateResponse(BaseModel):
    success: bool
    message: str
    data: PaymentResponse

class SearchUsersResponse(BaseModel):
    success: bool
    data: List[str]
class CourseResponse(BaseModel):
    id: str
    title: str
    description: str
    price: float

    start_date: str
    start_time: str
    end_date: str
    end_time: str

    image_url: str
    status: str
    created_at: datetime


class CourseCreateResponse(BaseModel):
    success: bool
    message: str
    data: CourseResponse


class OrderBook(BaseModel):
    book_id: str
    quantity: int

class ConfirmOrderRequest(BaseModel):
    user_id: str
    user_name: str
    email: str
    phone: str
    books: List[OrderBook]

class UpdateOrderStatus(BaseModel):
    order_status: str
    payment_status: str

class MembershipResponse(BaseModel):
    id: str
    teaching_course: str
    name: str
    father_or_husband_name: str
    date_of_birth: str
    qualification: str
    office_or_college_address: str
    mobile_no: str
    extra_qualification: Optional[str] = None

    photo_path: str
    file_path: Optional[str] = None

class MembershipCreateResponse(BaseModel):
    status: bool
    message: str
    email_sent: bool
    data: MembershipResponse
