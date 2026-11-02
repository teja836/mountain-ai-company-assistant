
from pydantic import BaseModel, ConfigDict


class ServiceResponse(BaseModel):
    id: int
    name: str
    category: str
    description: str
    technologies: str | None = None
    starting_price_inr: int
    estimated_duration: str | None = None
    status: str

    model_config = ConfigDict(from_attributes=True)


class FAQResponse(BaseModel):
    id: int
    question: str
    answer: str

    model_config = ConfigDict(from_attributes=True)


from pydantic import EmailStr, Field


class ContactMessageCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    message: str = Field(min_length=5, max_length=5000)


class ContactMessageResponse(BaseModel):
    id: int
    name: str
    email: str
    message: str

    model_config = ConfigDict(from_attributes=True)


class UserRegister(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    model_config = ConfigDict(from_attributes=True)
