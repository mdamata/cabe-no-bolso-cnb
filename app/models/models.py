from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    monthly_income = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relacionamentos
    fixed_expenses = relationship("FixedExpense", back_populates="user", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    routines = relationship("Routine", back_populates="user", cascade="all, delete-orphan")
    workouts = relationship("Workout", back_populates="user", cascade="all, delete-orphan")
    study_plans = relationship("StudyPlan", back_populates="user", cascade="all, delete-orphan")


class FixedExpense(Base):
    __tablename__ = "fixed_expenses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    description = Column(String(150), nullable=False)
    amount = Column(Float, nullable=False)
    due_day = Column(Integer, nullable=False) # Dia do vencimento (ex: 5, 10, 20)
    category = Column(String(50), nullable=False)

    user = relationship("User", back_populates="fixed_expenses")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    description = Column(String(255), nullable=False) # Ex: "Uber para Fiap"
    amount = Column(Float, nullable=False)
    payment_method = Column(String(50), nullable=False) # Pix, Crédito, Débito, Dinheiro
    category = Column(String(50), nullable=False) # Preenchido via IA ou manual
    date = Column(Date, nullable=False)

    user = relationship("User", back_populates="expenses")


class Routine(Base):
    __tablename__ = "routines"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    time = Column(String(10), nullable=False) # Ex: "07:00"
    days_of_week = Column(String(50), nullable=False) # Ex: "Seg,Qua,Sex"

    user = relationship("User", back_populates="routines")


class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    day_of_week = Column(String(20), nullable=False) # Segunda, Terça, etc.
    type = Column(String(50), nullable=False) # Musculação, Corrida, CrossFit, Outro
    exercises = Column(Text, nullable=False) # Armazenado estruturado ou JSON text (ex: Supino 4x10)

    user = relationship("User", back_populates="workouts")


class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic = Column(String(150), nullable=False)
    source_material = Column(Text, nullable=True) # Material fornecido pelo usuário
    schedule_json = Column(Text, nullable=False) # Cronograma gerado pelo Gemini em JSON
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="study_plans")