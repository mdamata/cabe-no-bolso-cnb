import os
import json
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY não encontrada no arquivo .env")

client = genai.Client(api_key=api_key)

# Modelos atuais prioritários por ordem de tentativa
CANDIDATE_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3-flash-preview",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
]

class ExpenseCategorization(BaseModel):
    amount: float = Field(description="O valor numérico gasto. Se não identificado, use 0.0.")
    category: str = Field(description="Categoria exata: Alimentação, Transporte, Lazer, Saúde, Educação, Casa ou Outros.")
    description: str = Field(description="Resumo curto e direto da despesa.")

def get_available_model() -> str:
    """Consulta a API do Google para descobrir qual modelo Gemini está ativo na conta."""
    try:
        for m in client.models.list():
            name = m.name.replace("models/", "")
            if "gemini" in name and "flash" in name and "vision" not in name and "1.5" not in name:
                return name
    except Exception as e:
        print(f"Erro ao listar modelos disponíveis: {e}")
    return "gemini-3.5-flash-lite"

def categorize_expense_with_ai(user_text: str) -> dict:
    prompt = f"""
    Você é um assistente financeiro de alta precisão do app Cabe no Bolso (CNB).
    Analise o seguinte relato de despesa do usuário: "{user_text}"
    
    Extraia o valor gasto, classifique exatamente em uma das categorias permitidas 
    (Alimentação, Transporte, Lazer, Saúde, Educação, Casa, Outros) e gere uma descrição curta.
    """
    
    models_to_try = list(dict.fromkeys(CANDIDATE_MODELS + [get_available_model()]))
    
    for model_id in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_id,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=ExpenseCategorization,
                    temperature=0.1,
                ),
            )
            print(f"✅ Sucesso na IA utilizando o modelo: {model_id}")
            return json.loads(response.text)
            
        except Exception as e:
            print(f"⚠️ Modelo {model_id} recusado ({e}). Testando próximo da fila...")
            
    return {
        "amount": 0.0,
        "category": "Outros",
        "description": user_text
    }


class StudyModule(BaseModel):
    day: int = Field(description="Número do dia no cronograma (ex: 1, 2, 3).")
    focus_topic: str = Field(description="Tópico principal a ser estudado neste dia.")
    practical_task: str = Field(description="Exercício prático ou entregável do dia.")
    duration_minutes: int = Field(description="Tempo estimado de estudo em minutos.")

class StudyScheduleSchema(BaseModel):
    topic: str = Field(description="Título consolidado do plano de estudos gerado.")
    modules: list[StudyModule] = Field(description="Lista sequencial de dias contendo os módulos de estudo.")

def generate_study_schedule_with_ai(topic: str, source_material: str, days: int = 5) -> dict:
    prompt = f"""
    És um Tech Lead e mentor técnico especialista.
    Cria um cronograma prático de estudos de {days} dias sobre o tema: "{topic}".
    Material base fornecido pelo aluno: "{source_material}".
    Divide o conteúdo em módulos diários progressivos, garantindo sempre uma tarefa prática de código ou configuração.
    """
    
    # Reutilizamos a fila de fallback (CANDIDATE_MODELS) definida no Dia 5
    models_to_try = list(dict.fromkeys(CANDIDATE_MODELS + [get_available_model()]))
    
    for model_id in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_id,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=StudyScheduleSchema, # O nosso Schema Aninhado
                    temperature=0.2, # Baixa temperatura para manter o foco no currículo
                ),
            )
            print(f"✅ Cronograma gerado pela IA utilizando o modelo: {model_id}")
            return json.loads(response.text)
            
        except Exception as e:
            print(f"⚠️ Modelo {model_id} falhou no Agente de Estudos ({e}). A testar o próximo...")
            
    # Fallback extremo caso todos os modelos falhem ou a API caia
    return {
        "topic": topic,
        "modules": [
            {
                "day": 1,
                "focus_topic": f"Fundamentos de {topic}",
                "practical_task": f"Ler e testar: {source_material}",
                "duration_minutes": 60
            }
        ]
    }