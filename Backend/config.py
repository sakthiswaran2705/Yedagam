import os
from datetime import datetime, timedelta, timezone
import bcrypt
from jose import jwt, JWTError
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from jose import jwt, JWTError, ExpiredSignatureError
from fastapi import HTTPException, Depends
from dotenv import load_dotenv
load_dotenv()

MONGO_URI = os.getenv("MONGODB_URL")
client = AsyncIOMotorClient(MONGO_URI)
db = client["yedagam_db"]
posts_collection = db["posts"]
users_collection = db["users"]
category_collection = db["category_collection"]
notifications_collection = db["notifications"]
donate_collection = db["donate-by"]
books_collection = db["Books-Store"]
contact_collection = db["Contact-Collection"]
payment_collection = db["Payment-Collection"]
courses_collection = db["courses_collection"]
book_order_collection = db["book-cart"]
form_collection = db["Memebershipform-collection"]
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587



ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")

ADMIN_EMAIL_PASSWORD = os.getenv("ADMIN_EMAIL")

SECRET_KEY = os.getenv("SECRET_KEY")
REFRESH_SECRET_KEY = os.getenv("ADMIN_EMAIL_PASSWORD")
ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 Days

bearer_scheme = HTTPBearer()

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


# --- TOKEN GENERATION ---
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)


# --- SECURITY DEPENDENCY ---

async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        email = payload.get("email")

        if not email:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        user = await users_collection.find_one(
            {"email": email}
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        if user.get("status") != "admin":
            raise HTTPException(
                status_code=403,
                detail="Blocked"
            )

        return user

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Access token expired"
        )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

def verify_refresh_token(refresh_token: str) -> str:
    try:
        payload = jwt.decode(refresh_token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token type")

        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
        return user_id
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired or invalid")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        email = payload.get("email")

        if not email:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        user = await users_collection.find_one({"email": email})

        if not user:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        return user

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Access token expired"
        )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )
