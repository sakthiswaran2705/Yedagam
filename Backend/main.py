from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os

from Yedagam_operations import router as app_router
from category_operation import router as category_router
from All_news import router as all_news_router
from Donate_by_emailorphone import router as donate_router
from Reports import router as report_router
from Book_store import router as books_router
from Contact_us import router as contact_router
from Payments import router as payment_router
from book_order_pay import router as order_pay_router
from courses import router as course_router
from book_order_det_for_admin import router as order_det_for_admin_router
from membership_form import router as membership_form_router

app = FastAPI(
    title="Yedagam API | ஏடகம் வலைப்பதிவு மற்றும் கல்வி பின்தளம்",
    version="1.0.0",
    docs_url="/api/",
    redoc_url=None
)

os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(app_router)
app.include_router(category_router)
app.include_router(all_news_router)
app.include_router(donate_router)
app.include_router(report_router)
app.include_router(books_router)
app.include_router(contact_router)
app.include_router(payment_router)
app.include_router(order_pay_router)
app.include_router(course_router)
app.include_router(order_det_for_admin_router)
app.include_router(membership_form_router)

@app.get("/")
async def root():
    return {
        "message": "Yedagam API Working Successfully",
        "status": "active"
    }