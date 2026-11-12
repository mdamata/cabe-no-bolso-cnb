from fastapi import APIRouter

# A variável 'router' precisa existir exatamente com este nome
router = APIRouter(prefix="/workouts", tags=["Treinos"])

@router.get("/")
def get_workouts():
    return {"message": "Rota de treinos funcionando"}