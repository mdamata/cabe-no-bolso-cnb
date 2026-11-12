from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base

# Importação de todos os módulos (routers) da nossa aplicação
from app.routers import auth, rotine, workout, study, finance

# Cria as tabelas na base de dados automaticamente ao iniciar o servidor
Base.metadata.create_all(bind=engine)

# 1. Instanciação da Aplicação
app = FastAPI(
    title="Cabe no Bolso (CNB) API",
    description="API Full-Stack integrada com Inteligência Artificial",
    version="1.0.0"
)

# 2. Configuração do CORS (Crucial para a separação Backend/Frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Na fase final de deploy, limitaremos ao domínio da Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Registo de todas as rotas (Microsserviços lógicos)
app.include_router(auth.router)
app.include_router(rotine.router)
app.include_router(workout.router)
app.include_router(study.router)
app.include_router(finance.router)