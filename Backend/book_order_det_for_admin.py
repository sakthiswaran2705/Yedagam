from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from config import book_order_collection
from models import UpdateOrderStatus
from  config import get_current_admin
router = APIRouter()

@router.get("/admin/book/orders/")
async def get_all_book_orders(current_admin: dict = Depends(get_current_admin)):
    try:
        orders = await book_order_collection.find().sort("created_at", -1).to_list(None)

        for order in orders:
            order["_id"] = str(order["_id"])

        return orders

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/admin/book/order/{order_id}/")
async def get_single_book_order(order_id: str,current_admin: dict = Depends(get_current_admin)):
    try:
        order = await book_order_collection.find_one(
            {"_id": ObjectId(order_id)}
        )

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Order not found"
            )

        order["_id"] = str(order["_id"])
        return order

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.put("/admin/book/order/{order_id}/")
async def update_book_order(
    order_id: str,
    data: UpdateOrderStatus,
    current_admin: dict = Depends(get_current_admin)
):
    try:

        result = await book_order_collection.update_one(
            {"_id": ObjectId(order_id)},
            {
                "$set": {
                    "order_status": data.order_status,
                    "payment_status": data.payment_status
                }
            }
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Order not found"
            )

        return {
            "success": True,
            "message": "Order updated successfully"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
@router.delete("/admin/book/order/{order_id}/")
async def delete_book_order(order_id: str,current_admin: dict = Depends(get_current_admin)):
    try:

        result = await book_order_collection.delete_one(
            {"_id": ObjectId(order_id)}
        )

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Order not found"
            )

        return {
            "success": True,
            "message": "Order deleted successfully"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )