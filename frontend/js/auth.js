// URL base da nossa API (mudaremos para a URL da Render quando fizermos o deploy)
const API_URL = 'http://127.0.0.1:8000';

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede a página de recarregar

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Sucesso! Guarda o token no navegador (localStorage)
            localStorage.setItem('cnb_token', data.access_token);
            
            // Redirecionar para o dashboard (vamos criar essa página a seguir)
            window.location.href = 'dashboard.html';
        } else {
            // Falha (senha errada, etc)
            alert(data.detail || 'Erro ao fazer login.');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro ao conectar com o servidor. Verifique se o backend está a correr.');
    }
});