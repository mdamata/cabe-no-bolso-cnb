from __future__ import annotations
from datetime import datetime, timedelta
from jose import jwt
import bcrypt

# Configurações de Segurança
SECRET_KEY = "sua-chave-secreta-super-segura-e-inviolavel-cnb"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # Token válido por 24 horas

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a palavra-passe em texto corresponde ao hash armazenado."""
    return bcrypt.checkpw(
        plain_password.encode('utf-8'), 
        hashed_password.encode('utf-8')
    )

def get_password_hash(password: str) -> str:
    """Gera o hash seguro da palavra-passe usando bcrypt diretamente."""
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """Cria o token JWT de autenticação."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt