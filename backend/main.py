
import os
from io import BytesIO

import httpx
from dotenv import load_dotenv
from docx import Document
from fastapi import (
    Depends,
    FastAPI,
    File,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import (
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm,
)
from pypdf import PdfReader
from pydantic import BaseModel, Field
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database import Base, engine, SessionLocal
from models import Service, FAQ, Product, ContactMessage, User
from schemas import (
    ServiceResponse,
    FAQResponse,
    ContactMessageCreate,
    ContactMessageResponse,
    UserRegister,
    UserLogin,
    UserResponse,
)
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)


# ---------------- ENVIRONMENT ----------------

# Always load the .env file located beside this file.
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(BACKEND_DIR, ".env")
load_dotenv(dotenv_path=ENV_FILE, override=False)


# ---------------- DATABASE ----------------

Base.metadata.create_all(bind=engine)


# ---------------- APPLICATION ----------------

app = FastAPI(
    title="Mountain-AI Technologies",
    description="Hybrid RAG Company Assistant API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/docs-login")


# ---------------- DATABASE DEPENDENCY ----------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- AUTHORIZATION ----------------

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(token)
        user_id = int(payload.get("sub", ""))
    except Exception:
        raise credentials_error

    user = db.query(User).filter(User.id == user_id).first()

    if not user or not user.is_active:
        raise credentials_error

    return user


def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role.strip().lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return current_user


# ---------------- GENERAL ----------------

@app.get("/")
def home():
    return {
        "message": "Mountain-AI Technologies API is running!",
        "status": "success",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# ---------------- SERVICES ----------------

@app.get("/services", response_model=list[ServiceResponse])
def get_services(db: Session = Depends(get_db)):
    return (
        db.query(Service)
        .filter(Service.status == "active")
        .order_by(Service.id)
        .all()
    )


@app.get("/services/{service_id}", response_model=ServiceResponse)
def get_service(
    service_id: int,
    db: Session = Depends(get_db),
):
    service = db.query(Service).filter(
        Service.id == service_id
    ).first()

    if not service:
        raise HTTPException(
            status_code=404,
            detail="Service not found",
        )

    return service


# ---------------- FAQs ----------------

@app.get("/faqs", response_model=list[FAQResponse])
def get_faqs(db: Session = Depends(get_db)):
    return db.query(FAQ).order_by(FAQ.id).all()


# ---------------- CONTACT FORM ----------------

@app.post(
    "/contact",
    response_model=ContactMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_contact_message(
    contact: ContactMessageCreate,
    db: Session = Depends(get_db),
):
    new_message = ContactMessage(
        name=contact.name.strip(),
        email=str(contact.email),
        message=contact.message.strip(),
    )

    db.add(new_message)

    try:
        db.commit()
        db.refresh(new_message)
        return new_message

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to save your message right now.",
        )


# ---------------- REGISTRATION ----------------

@app.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    user_data: UserRegister,
    db: Session = Depends(get_db),
):
    email = str(user_data.email).lower().strip()

    existing_user = db.query(User).filter(
        User.email == email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists.",
        )

    user = User(
        name=user_data.name.strip(),
        email=email,
        hashed_password=hash_password(user_data.password),
        role="user",
        is_active=True,
    )

    db.add(user)

    try:
        db.commit()
        db.refresh(user)
        return user

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists.",
        )

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to create your account right now.",
        )


# ---------------- JSON LOGIN FOR REACT ----------------

@app.post("/login")
def login_user(
    credentials: UserLogin,
    db: Session = Depends(get_db),
):
    email = str(credentials.email).lower().strip()

    user = db.query(User).filter(
        User.email == email
    ).first()

    if (
        not user
        or not user.is_active
        or not verify_password(
            credentials.password,
            user.hashed_password,
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(
        user_id=user.id,
        role=user.role,
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        },
    }


# ---------------- FORM LOGIN FOR SWAGGER ----------------

@app.post("/docs-login", include_in_schema=False)
def swagger_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    email = form_data.username.lower().strip()

    user = db.query(User).filter(
        User.email == email
    ).first()

    if (
        not user
        or not user.is_active
        or not verify_password(
            form_data.password,
            user.hashed_password,
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(
        user_id=user.id,
        role=user.role,
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }


# ---------------- CURRENT USER ----------------

@app.get("/me", response_model=UserResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    return current_user


# ---------------- ADMIN CONTACT MESSAGES ----------------

@app.get("/admin/contact-messages")
def get_contact_messages(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return (
        db.query(ContactMessage)
        .order_by(ContactMessage.created_at.desc())
        .all()
    )


# ---------------- ADMIN PRIVATE DOCUMENT UPLOAD ----------------

@app.post("/admin/documents/upload")
async def upload_private_document(
    file: UploadFile = File(...),
    admin: User = Depends(require_admin),
):
    filename = os.path.basename((file.filename or "").strip())
    extension = os.path.splitext(filename)[1].lower()

    if extension not in {".pdf", ".docx", ".txt"}:
        await file.close()
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOCX, and TXT files are supported.",
        )

    try:
        content = await file.read()
    finally:
        await file.close()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    # Extract text in memory; do not save the original file to disk.
    try:
        if extension == ".pdf":
            reader = PdfReader(BytesIO(content))
            extracted_text = "\n".join(
                page.extract_text() or ""
                for page in reader.pages
            )

        elif extension == ".docx":
            document = Document(BytesIO(content))
            extracted_text = "\n".join(
                paragraph.text
                for paragraph in document.paragraphs
            )

        else:
            extracted_text = content.decode("utf-8-sig")

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Unable to extract text from this file.",
        )

    extracted_text = extracted_text.strip()

    if not extracted_text:
        raise HTTPException(
            status_code=400,
            detail="No readable text was found in the document.",
        )

    # Read the private n8n configuration from backend/.env.
    webhook_url = os.getenv("N8N_PRIVATE_WEBHOOK_URL")
    webhook_secret = os.getenv("N8N_PRIVATE_WEBHOOK_SECRET")

    if not webhook_url or not webhook_secret:
        print(
            "Private webhook configuration missing:",
            f"url_present={bool(webhook_url)},",
            f"secret_present={bool(webhook_secret)}",
        )
        raise HTTPException(
            status_code=500,
            detail="Private document processing is not configured.",
        )

    payload = {
        "text": extracted_text,
        "source": "admin-upload",
        "filename": filename,
    }

    try:
        async with httpx.AsyncClient(
            timeout=60.0,
            follow_redirects=False,
        ) as client:
            response = await client.post(
                webhook_url,
                json=payload,
                headers={
                    "X-Admin-Webhook-Key": webhook_secret,
                },
            )

            response.raise_for_status()

    except httpx.HTTPStatusError as exc:
        # Log status and a limited response body, never the secret.
        print(
            "Private n8n webhook returned HTTP status:",
            exc.response.status_code,
        )
        print(
            "Private n8n webhook response:",
            exc.response.text[:1000],
        )

        raise HTTPException(
            status_code=502,
            detail=(
                "n8n rejected the request. Check the backend terminal "
                "for its HTTP status and response."
            ),
        )

    except httpx.TimeoutException:
        print("Private n8n webhook request timed out.")

        raise HTTPException(
            status_code=504,
            detail="The private n8n workflow timed out.",
        )

    except httpx.RequestError as exc:
        # Do not print the request URL: it may contain sensitive data.
        print(
            "Private n8n connection error:",
            type(exc).__name__,
        )

        raise HTTPException(
            status_code=502,
            detail=(
                "The backend could not connect to n8n. "
                "Check the backend terminal for the connection error type."
            ),
        )

    return {
        "message": "Document sent for private processing.",
        "filename": filename,
        "characters_extracted": len(extracted_text),
    }

# ---------------- ADMIN PRIVATE CHAT ----------------



class AdminChatRequest(BaseModel):
    chatInput: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="Question for the private company assistant",
    )


@app.post("/admin/private-chat")
async def admin_private_chat(
    chat_request: AdminChatRequest,
    admin: User = Depends(require_admin),
):
    """Forward an authenticated admin question to the private n8n chatbot."""
    webhook_url = os.getenv("N8N_PRIVATE_CHAT_WEBHOOK_URL")
    webhook_secret = os.getenv("N8N_PRIVATE_WEBHOOK_SECRET")

    if not webhook_url or not webhook_secret:
        print(
            "Private chat webhook configuration missing:",
            f"url_present={bool(webhook_url)},",
            f"secret_present={bool(webhook_secret)}",
        )
        raise HTTPException(
            status_code=500,
            detail="Private chat is not configured on the server.",
        )

    try:
        async with httpx.AsyncClient(timeout=90.0, follow_redirects=False) as client:
            response = await client.post(
                webhook_url,
                json={"chatInput": chat_request.chatInput.strip()},
                headers={"X-Admin-Webhook-Key": webhook_secret},
            )
            response.raise_for_status()

    except httpx.HTTPStatusError as exc:
        print("Private chat n8n webhook returned HTTP status:", exc.response.status_code)
        print("Private chat n8n webhook response:", exc.response.text[:1000])
        raise HTTPException(
            status_code=502,
            detail="The private chatbot service rejected the request. Check the backend terminal.",
        )
    except httpx.TimeoutException:
        print("Private chat n8n webhook request timed out.")
        raise HTTPException(
            status_code=504,
            detail="The private chatbot took too long to respond. Please try again.",
        )
    except httpx.RequestError as exc:
        print("Private chat n8n connection error:", type(exc).__name__)
        raise HTTPException(
            status_code=502,
            detail="The backend could not connect to the private chatbot service.",
        )

    try:
        result = response.json()
    except ValueError:
        result = {"output": response.text}

    # n8n AI Agent commonly returns an `output` field. Preserve other formats too.
    if isinstance(result, dict):
        answer = (
            result.get("output")
            or result.get("answer")
            or result.get("response")
            or result.get("text")
        )
        if answer is not None:
            return {"answer": answer}
        return {"answer": result}

    if isinstance(result, list) and result and isinstance(result[0], dict):
        first = result[0]
        answer = first.get("output") or first.get("answer") or first.get("response") or first.get("text")
        if answer is not None:
            return {"answer": answer}

    return {"answer": result}

