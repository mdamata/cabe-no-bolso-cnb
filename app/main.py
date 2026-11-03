from fastapi import FastAPI
from app.database import engine, Base
from app.routers import auth

# Cria automaticamente as tabelas no banco de dados local/remoto
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Cabe no Bolso (CNB) API",
    version="1.0.0",
    description="API Backend de organização financeira, treinos e estudos com IA para portfólio."
)

app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"message": "API do Cabe no Bolso (CNB) a funcionar em pleno!"}