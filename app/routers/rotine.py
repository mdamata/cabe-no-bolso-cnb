from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Routine
from app.schemas.schemas import RoutineCreate, RoutineResponse
from app.services.auth_deps import get_current_user
from app.models.models import User

router = APIRouter(prefix="/routines", tags=["Rotinas"])

@router.get("/", response_model=list[RoutineResponse])
def get_routines(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Routine).filter(Routine.user_id == current_user.id).all()

@router.post("/", response_model=RoutineResponse, status_code=status.HTTP_201_CREATED)
def create_routine(routine_data: RoutineCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_routine = Routine(
        user_id=current_user.id,
        title=routine_data.title,
        description=routine_data.description,
        time=routine_data.time,
        days_of_week=routine_data.days_of_week
    )
    db.add(new_routine)
    db.commit()
    db.refresh(new_routine)
    return new_routine