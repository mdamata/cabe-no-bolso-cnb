// ==========================================
// CONFIGURAÇÕES GERAIS E AUTENTICAÇÃO
// ==========================================
const API_URL = 'http://127.0.0.1:8000'; 
const token = localStorage.getItem('cnb_token');

if (!token) {
    window.location.href = 'index.html'; 
}

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('cnb_token');
    localStorage.removeItem('cnb_last_study');
    localStorage.removeItem('cnb_last_expense');
    localStorage.removeItem('cnb_routines');
    localStorage.removeItem('cnb_workouts'); 
    window.location.href = 'index.html';
});

// ==========================================
// ROTEADOR DA SPA
// ==========================================
const navItems = document.querySelectorAll('.nav-item[data-target]');
const pageSections = document.querySelectorAll('.page-section');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        pageSections.forEach(section => section.classList.remove('active'));
        const targetId = item.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
    });
});

// ==========================================
// FUNÇÕES DE RENDERIZAÇÃO (IA)
// ==========================================
function renderExpenseResult(aiAnalysis) {
    const resultBox = document.getElementById('ai-result-box');
    document.getElementById('res-amount').innerText = Number(aiAnalysis.amount).toFixed(2);
    document.getElementById('res-category').innerText = aiAnalysis.category;
    document.getElementById('res-desc').innerText = aiAnalysis.description;
    resultBox.style.display = 'block';
}

function renderStudySchedule(scheduleData) {
    const resultBox = document.getElementById('study-result-box');
    const scheduleContainer = document.getElementById('schedule-container');
    
    scheduleContainer.innerHTML = '';
    const titleHtml = `<h5 style="margin-bottom: 10px; color: #1e3a8a;">${scheduleData.topic}</h5>`;
    scheduleContainer.insertAdjacentHTML('beforeend', titleHtml);
    
    scheduleData.modules.forEach(mod => {
        const dayHtml = `
            <div style="background: white; padding: 10px; margin-bottom: 10px; border-radius: 6px; border: 1px solid #bfdbfe;">
                <strong style="color: #2563eb;">Dia ${mod.day}: ${mod.focus_topic}</strong>
                <p style="font-size: 13px; margin: 5px 0;"><strong>Missão:</strong> ${mod.practical_task}</p>
                <p style="font-size: 12px; color: #6b7280;">Tempo estimado: ${mod.duration_minutes} min</p>
            </div>
        `;
        scheduleContainer.insertAdjacentHTML('beforeend', dayHtml);
    });
    
    resultBox.style.display = 'block';
}

// ==========================================
// MÓDULO 3: ROTINA (RENDER, EDIT, DELETE)
// ==========================================
window.editRoutine = function(day) {
    const routines = JSON.parse(localStorage.getItem('cnb_routines')) || [];
    const r = routines.find(x => x.day === day);
    if(r) {
        document.getElementById('routine-day').value = r.day;
        document.getElementById('routine-type').value = r.type;
        document.getElementById('routine-time').value = r.time;
        document.getElementById('routine-time').focus(); // Foca no campo para mostrar que carregou
    }
};

window.deleteRoutine = function(day) {
    if(confirm(`Tem a certeza que quer excluir a rotina de ${day}?`)) {
        let routines = JSON.parse(localStorage.getItem('cnb_routines')) || [];
        routines = routines.filter(x => x.day !== day);
        localStorage.setItem('cnb_routines', JSON.stringify(routines));
        renderRoutines();
    }
};

function renderRoutines() {
    const routineList = document.getElementById('routine-list');
    const routines = JSON.parse(localStorage.getItem('cnb_routines')) || [];
    
    if (routines.length === 0) {
        routineList.innerHTML = '<p style="color: var(--text-muted); font-size: 14px;">Nenhuma rotina registada ainda.</p>';
        return;
    }
    
    routineList.innerHTML = ''; 
    const order = { "Segunda-feira": 1, "Terça-feira": 2, "Quarta-feira": 3, "Quinta-feira": 4, "Sexta-feira": 5 };
    routines.sort((a, b) => order[a.day] - order[b.day]);
    
    routines.forEach(r => {
        const badgeColor = r.type === 'Home Office' ? '#dcfce7' : '#fee2e2';
        const textColor = r.type === 'Home Office' ? '#166534' : '#991b1b';
        
        const card = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid var(--border-color);">
                <div>
                    <strong style="display: block; color: var(--text-main);">${r.day}</strong>
                    <span style="font-size: 13px; color: var(--text-muted);">⏱️ ${r.time}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="background: ${badgeColor}; color: ${textColor}; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                        ${r.type}
                    </span>
                    <button onclick="editRoutine('${r.day}')" style="background:none; border:none; cursor:pointer; font-size:14px;" title="Editar">✏️</button>
                    <button onclick="deleteRoutine('${r.day}')" style="background:none; border:none; cursor:pointer; font-size:14px;" title="Excluir">🗑️</button>
                </div>
            </div>
        `;
        routineList.insertAdjacentHTML('beforeend', card);
    });
}

// ==========================================
// MÓDULO 4: TREINOS (RENDER, EDIT, DELETE)
// ==========================================
window.editWorkout = function(day) {
    const workouts = JSON.parse(localStorage.getItem('cnb_workouts')) || [];
    const w = workouts.find(x => x.day === day);
    if(w) {
        document.getElementById('workout-day').value = w.day;
        document.getElementById('workout-type').value = w.type;
        document.getElementById('workout-desc').value = w.desc;
        document.getElementById('workout-time').value = w.time === 'S/ Hora' ? '' : w.time;
        document.getElementById('workout-desc').focus();
    }
};

window.deleteWorkout = function(day) {
    if(confirm(`Tem a certeza que quer excluir o treino de ${day}?`)) {
        let workouts = JSON.parse(localStorage.getItem('cnb_workouts')) || [];
        workouts = workouts.filter(x => x.day !== day);
        localStorage.setItem('cnb_workouts', JSON.stringify(workouts));
        renderWorkouts();
    }
};

function renderWorkouts() {
    const workoutList = document.getElementById('workout-list');
    const workouts = JSON.parse(localStorage.getItem('cnb_workouts')) || [];
    
    if (workouts.length === 0) {
        workoutList.innerHTML = '<p style="color: var(--text-muted); font-size: 14px;">Nenhum treino registado ainda.</p>';
        return;
    }
    
    workoutList.innerHTML = ''; 
    const order = { "Segunda-feira": 1, "Terça-feira": 2, "Quarta-feira": 3, "Quinta-feira": 4, "Sexta-feira": 5, "Sábado": 6, "Domingo": 7 };
    workouts.sort((a, b) => order[a.day] - order[b.day]);
    
    workouts.forEach(w => {
        let badgeBg = '#f3f4f6', badgeText = '#374151';
        if (w.type === 'Musculação') { badgeBg = '#dbeafe'; badgeText = '#1e40af'; }
        if (w.type === 'Cardio' || w.type === 'Crossfit') { badgeBg = '#fef08a'; badgeText = '#854d0e'; }
        if (w.type === 'Mobilidade' || w.type === 'Descanso Ativo') { badgeBg = '#dcfce7'; badgeText = '#166534'; }

        const card = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid var(--border-color);">
                <div style="flex: 1;">
                    <strong style="display: block; color: var(--text-main);">${w.day} <span style="font-weight: normal; font-size: 12px; color: var(--text-muted);">(${w.time})</span></strong>
                    <span style="font-size: 13px; color: var(--text-muted);">${w.desc}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="background: ${badgeBg}; color: ${badgeText}; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap;">
                        ${w.type}
                    </span>
                    <button onclick="editWorkout('${w.day}')" style="background:none; border:none; cursor:pointer; font-size:14px;" title="Editar">✏️</button>
                    <button onclick="deleteWorkout('${w.day}')" style="background:none; border:none; cursor:pointer; font-size:14px;" title="Excluir">🗑️</button>
                </div>
            </div>
        `;
        workoutList.insertAdjacentHTML('beforeend', card);
    });
}

// RESTAURAÇÃO DE DADOS NO LOAD
window.addEventListener('DOMContentLoaded', () => {
    const savedExpense = localStorage.getItem('cnb_last_expense');
    if (savedExpense) renderExpenseResult(JSON.parse(savedExpense));

    const savedStudy = localStorage.getItem('cnb_last_study');
    if (savedStudy) renderStudySchedule(JSON.parse(savedStudy));
    
    renderRoutines();
    renderWorkouts(); 
});

// ==========================================
// SUBMITS DOS FORMULÁRIOS
// ==========================================

// IA Financeira
document.getElementById('ai-expense-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const textInput = document.getElementById('expense-text').value;
    const btnSubmit = document.getElementById('btn-analyze');
    btnSubmit.innerText = "A analisar com IA...";
    btnSubmit.disabled = true;
    try {
        const response = await fetch(`${API_URL}/finance/ai-categorize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ text: textInput })
        });
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('cnb_last_expense', JSON.stringify(data.ai_analysis));
            renderExpenseResult(data.ai_analysis);
            document.getElementById('expense-text').value = ''; 
        } else {
            const err = await response.json();
            alert("Erro na IA Financeira: " + err.detail);
        }
    } catch (error) {
        alert("Erro de conexão com o servidor.");
    } finally {
        btnSubmit.innerText = "Analisar e Guardar com IA";
        btnSubmit.disabled = false;
    }
});

// IA Estudos
document.getElementById('ai-study-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const topic = document.getElementById('study-topic').value;
    const source_material = document.getElementById('study-material').value;
    const days = parseInt(document.getElementById('study-days').value);
    const btnSubmit = document.getElementById('btn-study-analyze');
    btnSubmit.innerText = "A pensar e planear...";
    btnSubmit.disabled = true;
    try {
        const response = await fetch(`${API_URL}/studies/ai-generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ topic, source_material, days })
        });
        if (response.ok) {
            const data = await response.json();
            let scheduleData = typeof data.schedule_json === 'string' ? JSON.parse(data.schedule_json) : data.schedule_json;
            localStorage.setItem('cnb_last_study', JSON.stringify(scheduleData));
            renderStudySchedule(scheduleData);
        } else {
            const err = await response.json();
            alert("Erro na IA de Estudos: " + err.detail);
        }
    } catch (error) {
        alert("Algo deu errado no navegador. Inspecione o Console (F12).");
    } finally {
        btnSubmit.innerText = "Gerar Cronograma";
        btnSubmit.disabled = false;
    }
});

// Rotina
document.getElementById('routine-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const day = document.getElementById('routine-day').value;
    const type = document.getElementById('routine-type').value;
    const time = document.getElementById('routine-time').value;
    
    let routines = JSON.parse(localStorage.getItem('cnb_routines')) || [];
    routines = routines.filter(r => r.day !== day); // Remove o antigo (UPSERT)
    routines.push({ day, type, time });
    
    localStorage.setItem('cnb_routines', JSON.stringify(routines));
    document.getElementById('routine-time').value = '';
    renderRoutines();
});

// Treinos
document.getElementById('workout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const day = document.getElementById('workout-day').value;
    const type = document.getElementById('workout-type').value;
    const desc = document.getElementById('workout-desc').value;
    const time = document.getElementById('workout-time').value || 'S/ Hora';
    
    let workouts = JSON.parse(localStorage.getItem('cnb_workouts')) || [];
    workouts = workouts.filter(w => w.day !== day); // Remove o antigo (UPSERT)
    workouts.push({ day, type, desc, time });
    
    localStorage.setItem('cnb_workouts', JSON.stringify(workouts));
    document.getElementById('workout-desc').value = '';
    document.getElementById('workout-time').value = '';
    renderWorkouts();
});