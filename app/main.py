from fastapi import FastAPI
from app.database import engine, Base
from app.routers import auth, rotine, study, workout, finance  # <-- O 'rotine' tem de estar aqui importado!

# Cria automaticamente as tabelas no banco de dados local/remoto
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Cabe no Bolso (CNB) API",
    version="1.0.0",
    description="API Backend de organização financeira, treinos e estudos com IA para portfólio."
)

# Regista os routers na aplicação FastAPI
app.include_router(auth.router)
app.include_router(rotine.router) 
app.include_router(finance.router) 
app.include_router(study.router)# <-- E registado aqui embaixo

@app.get("/")
def read_root():
    return {"message": "API do Cabe no Bolso (CNB) a funcionar em pleno! 🚀"}