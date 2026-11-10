import json
from fastapi import APIRouter, Depends, status, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import StudyPlan, User
from app.schemas.schemas import StudyPlanCreate, StudyPlanResponse
from app.services.auth_deps import get_current_user
from app.services.ai_agent import generate_study_schedule_with_ai

router = APIRouter(prefix="/studies", tags=["Estudos e IA"])

# Payload que o Frontend vai enviar
class AIStudyRequest(BaseModel):
    topic: str
    source_material: str
    days: int = 5

@router.post("/ai-generate", response_model=StudyPlanResponse, status_code=status.HTTP_201_CREATED)
def create_ai_study_plan(
    request_data: AIStudyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # 1. Chama a IA para gerar o cronograma estruturado
        ai_schedule = generate_study_schedule_with_ai(
            topic=request_data.topic,
            source_material=request_data.source_material,
            days=request_data.days
        )
        
        # 2. Guarda na Base de Dados (transformando o dict da IA numa string JSON para a coluna schedule_json)
        new_study = StudyPlan(
            user_id=current_user.id,
            topic=request_data.topic,
            source_material=request_data.source_material,
            schedule_json=json.dumps(ai_schedule, ensure_ascii=False)
        )
        
        db.add(new_study)
        db.commit()
        db.refresh(new_study)
        return new_study
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar cronograma de estudos: {str(e)}"
        )