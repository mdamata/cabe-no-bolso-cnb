from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.models.models import User
from app.services.auth_deps import get_current_user
from app.services.ai_agent import categorize_expense_with_ai

router = APIRouter(prefix="/finance", tags=["Finanças e IA"])

# Schema específico para receber o texto livre
class ExpensePrompt(BaseModel):
    text: str

@router.post("/ai-categorize", status_code=status.HTTP_200_OK)
def categorize_expense_from_text(prompt: ExpensePrompt, current_user: User = Depends(get_current_user)):
    try:
        # Chama a IA passando o texto do utilizador
        ai_result = categorize_expense_with_ai(prompt.text)
        
        return {
            "message": "Despesa analisada com sucesso pela IA.",
            "user_id": current_user.id,
            "ai_analysis": ai_result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ocorreu um erro ao processar a despesa com a Inteligência Artificial."
        )