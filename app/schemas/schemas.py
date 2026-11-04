from __future__ import annotations
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    monthly_income: float = 0.0

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    monthly_income: float
    created_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# --- ROTINAS ---
class RoutineCreate(BaseModel):
    title: str
    description: Optional[str] = None
    time: str
    days_of_week: str

class RoutineResponse(RoutineCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# --- TREINOS ---
class WorkoutCreate(BaseModel):
    day_of_week: str
    type: str # Ex: Musculação, CrossFit
    exercises: str

class WorkoutResponse(WorkoutCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# --- ESTUDOS ---
class StudyPlanCreate(BaseModel):
    topic: str
    source_material: Optional[str] = None
    schedule_json: str

class StudyPlanResponse(StudyPlanCreate):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True