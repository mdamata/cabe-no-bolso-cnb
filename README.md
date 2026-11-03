# Cabe no Bolso (CNB)

> Aplicativo Full-Stack de Organização Pessoal e Produtividade potencializado por Inteligência Artificial (Gemini API).

## 🚀 Sobre o Projeto
O **CNB** foi arquitetado para centralizar o controle financeiro (renda, gastos fixos e variáveis com categorização automática via IA), gestão de treinos estruturados, rotinas diárias e planejamento automatizado de estudos baseados em materiais do usuário. Desenvolvido com foco em alta performance, código limpo e arquitetura desacoplada.

## 🛠️ Tech Stack
- **Backend:** Python, FastAPI, SQLAlchemy, Pydantic, JWT Auth, Bcrypt.
- **Banco de Dados:** MySQL (Hospedado na Render).
- **Inteligência Artificial:** Google GenAI SDK (Gemini API) para extração de dados não estruturados em JSON e Agente de Estudos.
- **Frontend:** HTML5, CSS3, JavaScript Vanilla (Deploy na Vercel).
- **Infraestrutura:** Render & Vercel.

## 📂 Arquitetura do Sistema
O backend segue os princípios de **Clean Architecture / Separation of Concerns**:
- `routers/`: Camada de exposição de rotas HTTP REST.
- `models/`: Mapeamento ORM relacional das entidades.
- `schemas/`: Contratos de serialização e validação de entrada/saída de dados.
- `services/`: Regras de negócio complexas e integração com o motor de IA.

---
*Desenvolvido por Marcelo da Mata.*
