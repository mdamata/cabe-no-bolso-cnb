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
    window.location.href = 'index.html';
});

// Função utilitária defensiva: só altera o texto se o ID existir no HTML
function setTextSafe(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

// ==========================================
// ROTEADOR DA SPA E ATUALIZAÇÃO DO DASHBOARD
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
        
        if(targetId === 'sec-dashboard') {
            renderDashboard();
        }
    });
});

// ==========================================
// MÓDULO G & H: O DASHBOARD PRINCIPAL (AGREGADOR)
// ==========================================
function renderDashboard() {
    // 1. Agregação Financeira
    const incomes = JSON.parse(localStorage.getItem('cnb_incomes')) || [];
    const sumIncome = incomes.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    
    const fixed = JSON.parse(localStorage.getItem('cnb_fixed_expenses')) || [];
    const sumFixed = fixed.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    
    const variable = JSON.parse(localStorage.getItem('cnb_variable_expenses')) || [];
    const sumVar = variable.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    
    const totalOut = sumFixed + sumVar;
    const balance = sumIncome - totalOut;

    setTextSafe('dash-income-total', sumIncome.toFixed(2));
    setTextSafe('dash-fixed-total', sumFixed.toFixed(2));
    setTextSafe('dash-var-total', sumVar.toFixed(2));
    setTextSafe('dash-all-total', totalOut.toFixed(2)); // Seguro: não quebra se não existir no HTML!
    
    const balanceEl = document.getElementById('dash-balance-total');
    if (balanceEl) {
        balanceEl.innerText = `R$ ${balance.toFixed(2)}`;
        balanceEl.style.color = balance >= 0 ? '#166534' : '#dc2626';
    }

    // 2. Agregação de Estudos
    const studies = JSON.parse(localStorage.getItem('cnb_study_list')) || [];
    const done = studies.filter(s => s.status === 'Concluído').length;
    const pend = studies.length - done;
    
    setTextSafe('dash-study-done', done);
    setTextSafe('dash-study-pend', pend);

    // 3. O Meu Dia (Checklist Dinâmica)
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const todayName = days[new Date().getDay()]; 
    setTextSafe('dash-today-name', todayName);

    const todayList = document.getElementById('dash-today-list');
    if (!todayList) return;
    todayList.innerHTML = '';
    
    let activities = [];
    
    // Compromissos de hoje
    const agenda = JSON.parse(localStorage.getItem('cnb_agenda')) || [];
    agenda.filter(a => a.day === todayName).forEach(a => activities.push(`Compromisso: ${a.title} (${a.time})`));
    
    // Rotina de trabalho de hoje
    const routines = JSON.parse(localStorage.getItem('cnb_routines')) || [];
    routines.filter(r => r.day === todayName).forEach(r => activities.push(`Trabalho: ${r.type} (${r.time})`));
    
    // Treinos de hoje
    const workouts = JSON.parse(localStorage.getItem('cnb_workouts')) || [];
    workouts.filter(w => w.day === todayName).forEach(w => activities.push(`Treino: ${w.type} - ${w.desc} (${w.time})`));
    
    // Refeições de hoje
    const meals = JSON.parse(localStorage.getItem('cnb_meals')) || [];
    meals.filter(m => m.day === todayName).forEach(m => {
        const mealType = m.type === 'Pequeno-almoço' ? 'Café da Manhã' : m.type;
        activities.push(`Refeição (${mealType}): ${m.desc}`);
    });

    // Estudos pendentes (aparecem todos os dias enquanto não forem concluídos)
    studies.filter(s => s.status !== 'Concluído').forEach(s => {
        activities.push(`Estudar (${s.status}): ${s.topic}`);
    });
    
    if (activities.length === 0) {
        todayList.innerHTML = '<p style="color: var(--text-muted); font-size: 14px;">Nenhuma atividade ou estudo pendente para hoje.</p>';
    } else {
        activities.forEach(act => {
            todayList.insertAdjacentHTML('beforeend', `
                <div style="padding: 12px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 10px; transition: 0.2s;">
                    <input type="checkbox" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary-color);">
                    <span style="color: var(--text-main); font-size: 15px;">${act}</span>
                </div>
            `);
        });
    }
}

// ==========================================
// FUNÇÕES DE RENDERIZAÇÃO E IA
// ==========================================
function renderExpenseResult(aiAnalysis) {
    const resultBox = document.getElementById('ai-result-box');
    if (!resultBox) return;
    setTextSafe('res-amount', Number(aiAnalysis.amount).toFixed(2));
    setTextSafe('res-category', aiAnalysis.category);
    setTextSafe('res-desc', aiAnalysis.description);
    resultBox.style.display = 'block';
}

function renderStudySchedule(scheduleData) {
    const resultBox = document.getElementById('study-result-box');
    const scheduleContainer = document.getElementById('schedule-container');
    if (!resultBox || !scheduleContainer) return;
    
    scheduleContainer.innerHTML = '';
    const titleHtml = `<h5 style="margin-bottom: 10px; color: #1e3a8a;">${scheduleData.topic}</h5>`;
    scheduleContainer.insertAdjacentHTML('beforeend', titleHtml);
    scheduleData.modules.forEach(mod => {
        scheduleContainer.insertAdjacentHTML('beforeend', `
            <div style="background: white; padding: 10px; margin-bottom: 10px; border-radius: 6px; border: 1px solid #bfdbfe;">
                <strong style="color: #2563eb;">Dia ${mod.day}: ${mod.focus_topic}</strong>
                <p style="font-size: 13px; margin: 5px 0;"><strong>Missão:</strong> ${mod.practical_task}</p>
                <p style="font-size: 12px; color: #6b7280;">Tempo: ${mod.duration_minutes} min</p>
            </div>
        `);
    });
    resultBox.style.display = 'block';
}

// ==========================================
// MÓDULOS CRUD (Render e Edição)
// ==========================================

// ROTINAS
window.editRoutine = function(day) {
    const r = (JSON.parse(localStorage.getItem('cnb_routines')) || []).find(x => x.day === day);
    if(r) { document.getElementById('routine-day').value = r.day; document.getElementById('routine-type').value = r.type; document.getElementById('routine-time').value = r.time; document.getElementById('routine-time').focus(); }
};
window.deleteRoutine = function(day) {
    if(confirm(`Excluir a rotina de ${day}?`)) { localStorage.setItem('cnb_routines', JSON.stringify((JSON.parse(localStorage.getItem('cnb_routines')) || []).filter(x => x.day !== day))); renderRoutines(); renderDashboard(); }
};
function renderRoutines() {
    const list = document.getElementById('routine-list');
    const data = JSON.parse(localStorage.getItem('cnb_routines')) || [];
    if (data.length === 0) { list.innerHTML = '<p style="color: var(--text-muted); font-size: 14px;">Nenhuma rotina cadastrada.</p>'; return; }
    list.innerHTML = ''; 
    const order = { "Segunda-feira": 1, "Terça-feira": 2, "Quarta-feira": 3, "Quinta-feira": 4, "Sexta-feira": 5 };
    data.sort((a, b) => order[a.day] - order[b.day]).forEach(r => {
        const bg = r.type === 'Home Office' ? '#dcfce7' : '#fee2e2', tc = r.type === 'Home Office' ? '#166534' : '#991b1b';
        list.insertAdjacentHTML('beforeend', `<div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid var(--border-color);"><div><strong style="display: block;">${r.day}</strong><span style="font-size: 13px; color: var(--text-muted);">${r.time}</span></div><div style="display: flex; gap: 10px; align-items: center;"><span style="background: ${bg}; color: ${tc}; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;">${r.type}</span><button onclick="editRoutine('${r.day}')" style="background:none; border:none; cursor:pointer;">✏️</button><button onclick="deleteRoutine('${r.day}')" style="background:none; border:none; cursor:pointer;">🗑️</button></div></div>`);
    });
}

// TREINOS
window.editWorkout = function(day) {
    const w = (JSON.parse(localStorage.getItem('cnb_workouts')) || []).find(x => x.day === day);
    if(w) { document.getElementById('workout-day').value = w.day; document.getElementById('workout-type').value = w.type; document.getElementById('workout-desc').value = w.desc; document.getElementById('workout-time').value = w.time === 'S/ Hora' ? '' : w.time; document.getElementById('workout-desc').focus(); }
};
window.deleteWorkout = function(day) {
    if(confirm(`Excluir o treino de ${day}?`)) { localStorage.setItem('cnb_workouts', JSON.stringify((JSON.parse(localStorage.getItem('cnb_workouts')) || []).filter(x => x.day !== day))); renderWorkouts(); renderDashboard(); }
};
function renderWorkouts() {
    const list = document.getElementById('workout-list');
    const data = JSON.parse(localStorage.getItem('cnb_workouts')) || [];
    if (data.length === 0) { list.innerHTML = '<p style="color: var(--text-muted); font-size: 14px;">Nenhum treino cadastrado.</p>'; return; }
    list.innerHTML = ''; 
    const order = { "Segunda-feira": 1, "Terça-feira": 2, "Quarta-feira": 3, "Quinta-feira": 4, "Sexta-feira": 5, "Sábado": 6, "Domingo": 7 };
    data.sort((a, b) => order[a.day] - order[b.day]).forEach(w => {
        list.insertAdjacentHTML('beforeend', `<div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid var(--border-color);"><div style="flex: 1;"><strong style="display: block;">${w.day} <span style="font-weight: normal; font-size: 12px; color: var(--text-muted);">(${w.time})</span></strong><span style="font-size: 13px; color: var(--text-muted);">${w.desc}</span></div><div style="display: flex; gap: 10px; align-items: center;"><span style="background: #f3f4f6; color: #374151; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;">${w.type}</span><button onclick="editWorkout('${w.day}')" style="background:none; border:none; cursor:pointer;">✏️</button><button onclick="deleteWorkout('${w.day}')" style="background:none; border:none; cursor:pointer;">🗑️</button></div></div>`);
    });
}

// ESTUDOS
window.editStudyTrack = function(topic) {
    const s = (JSON.parse(localStorage.getItem('cnb_study_list')) || []).find(x => x.topic === topic);
    if(s) { document.getElementById('study-list-topic').value = s.topic; document.getElementById('study-list-status').value = s.status; document.getElementById('study-list-topic').focus(); }
};
window.deleteStudyTrack = function(topic) {
    if(confirm(`Excluir a meta "${topic}"?`)) { localStorage.setItem('cnb_study_list', JSON.stringify((JSON.parse(localStorage.getItem('cnb_study_list')) || []).filter(x => x.topic !== topic))); renderStudyTracker(); renderDashboard(); }
};
function renderStudyTracker() {
    const list = document.getElementById('study-list-container');
    const data = JSON.parse(localStorage.getItem('cnb_study_list')) || [];
    if (data.length === 0) { list.innerHTML = '<p style="color: var(--text-muted); font-size: 14px;">Nenhuma meta cadastrada.</p>'; return; }
    list.innerHTML = ''; 
    data.forEach(s => {
        const textStyle = s.status === 'Concluído' ? 'text-decoration: line-through; opacity: 0.6;' : '';
        list.insertAdjacentHTML('beforeend', `<div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid var(--border-color);"><div><strong style="display: block; ${textStyle}">${s.topic}</strong></div><div style="display: flex; gap: 10px; align-items: center;"><span style="background: #f3f4f6; color: #374151; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;">${s.status}</span><button onclick="editStudyTrack('${s.topic}')" style="background:none; border:none; cursor:pointer;">✏️</button><button onclick="deleteStudyTrack('${s.topic}')" style="background:none; border:none; cursor:pointer;">🗑️</button></div></div>`);
    });
}

// REFEIÇÕES (Com migração automática de Pequeno-almoço para Café da Manhã)
window.editMeal = function(day, type) {
    const m = (JSON.parse(localStorage.getItem('cnb_meals')) || []).find(x => x.day === day && x.type === type);
    if(m) { document.getElementById('meal-day').value = m.day; document.getElementById('meal-type').value = m.type; document.getElementById('meal-desc').value = m.desc; document.getElementById('meal-desc').focus(); }
};
window.deleteMeal = function(day, type) {
    if(confirm(`Excluir ${type} de ${day}?`)) { localStorage.setItem('cnb_meals', JSON.stringify((JSON.parse(localStorage.getItem('cnb_meals')) || []).filter(x => !(x.day === day && x.type === type)))); renderMeals(); renderDashboard(); }
};
function renderMeals() {
    const list = document.getElementById('meal-list-container');
    let data = JSON.parse(localStorage.getItem('cnb_meals')) || [];
    
    // Limpeza automática de dados antigos de Portugal no LocalStorage
    let updated = false;
    data = data.map(m => {
        if (m.type === 'Pequeno-almoço') {
            m.type = 'Café da Manhã';
            updated = true;
        }
        return m;
    });
    if (updated) localStorage.setItem('cnb_meals', JSON.stringify(data));

    if (data.length === 0) { list.innerHTML = '<p style="color: var(--text-muted); font-size: 14px;">Nenhuma refeição cadastrada.</p>'; return; }
    list.innerHTML = ''; 
    const dayOrder = { "Segunda-feira": 1, "Terça-feira": 2, "Quarta-feira": 3, "Quinta-feira": 4, "Sexta-feira": 5, "Sábado": 6, "Domingo": 7 };
    const mealOrder = { "Café da Manhã": 1, "Almoço": 2, "Lanche": 3, "Jantar": 4, "Ceia": 5 };
    
    data.sort((a, b) => {
        if(dayOrder[a.day] !== dayOrder[b.day]) return dayOrder[a.day] - dayOrder[b.day];
        return (mealOrder[a.type] || 99) - (mealOrder[b.type] || 99);
    }).forEach(m => {
        list.insertAdjacentHTML('beforeend', `<div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid var(--border-color);"><div style="flex: 1;"><strong style="display: block;">${m.day} - <span style="color: #c2410c;">${m.type}</span></strong><span style="font-size: 13px; color: var(--text-muted);">${m.desc}</span></div><div style="display: flex; gap: 10px; align-items: center;"><button onclick="editMeal('${m.day}', '${m.type}')" style="background:none; border:none; cursor:pointer;">✏️</button><button onclick="deleteMeal('${m.day}', '${m.type}')" style="background:none; border:none; cursor:pointer;">🗑️</button></div></div>`);
    });
}

// AGENDA
window.editAgenda = function(id) {
    const a = (JSON.parse(localStorage.getItem('cnb_agenda')) || []).find(x => x.id === id);
    if(a) { document.getElementById('agenda-id').value = a.id; document.getElementById('agenda-day').value = a.day; document.getElementById('agenda-time').value = a.time; document.getElementById('agenda-type').value = a.type; document.getElementById('agenda-title').value = a.title; document.getElementById('agenda-title').focus(); }
};
window.deleteAgenda = function(id) {
    if(confirm(`Excluir compromisso?`)) { localStorage.setItem('cnb_agenda', JSON.stringify((JSON.parse(localStorage.getItem('cnb_agenda')) || []).filter(x => x.id !== id))); renderAgenda(); renderDashboard(); }
};
function renderAgenda() {
    const list = document.getElementById('agenda-list-container');
    const data = JSON.parse(localStorage.getItem('cnb_agenda')) || [];
    if (data.length === 0) { list.innerHTML = '<p style="color: var(--text-muted); font-size: 14px;">Nenhum compromisso cadastrado.</p>'; return; }
    list.innerHTML = ''; 
    const dayOrder = { "Segunda-feira": 1, "Terça-feira": 2, "Quarta-feira": 3, "Quinta-feira": 4, "Sexta-feira": 5, "Sábado": 6, "Domingo": 7 };
    
    data.sort((a, b) => {
        if(dayOrder[a.day] !== dayOrder[b.day]) return dayOrder[a.day] - dayOrder[b.day];
        return a.time.localeCompare(b.time);
    }).forEach(a => {
        list.insertAdjacentHTML('beforeend', `<div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid var(--border-color);"><div style="flex: 1;"><strong style="display: block;">${a.day} <span style="color: var(--primary-color);">(${a.time})</span></strong><span style="font-size: 13px; color: var(--text-muted);">${a.title}</span></div><div style="display: flex; gap: 10px; align-items: center;"><span style="background: #f3f4f6; color: #374151; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;">${a.type}</span><button onclick="editAgenda('${a.id}')" style="background:none; border:none; cursor:pointer;">✏️</button><button onclick="deleteAgenda('${a.id}')" style="background:none; border:none; cursor:pointer;">🗑️</button></div></div>`);
    });
}

// GASTOS FIXOS
window.editFixedExpense = function(id) {
    const ex = (JSON.parse(localStorage.getItem('cnb_fixed_expenses')) || []).find(x => x.id === id);
    if(ex) { document.getElementById('fixed-expense-id').value = ex.id; document.getElementById('fixed-expense-desc').value = ex.desc; document.getElementById('fixed-expense-amount').value = ex.amount; document.getElementById('fixed-expense-day').value = ex.day; document.getElementById('fixed-expense-desc').focus(); }
};
window.deleteFixedExpense = function(id) {
    if(confirm(`Excluir este custo fixo?`)) { localStorage.setItem('cnb_fixed_expenses', JSON.stringify((JSON.parse(localStorage.getItem('cnb_fixed_expenses')) || []).filter(x => x.id !== id))); renderFixedExpenses(); renderDashboard(); }
};
function renderFixedExpenses() {
    const list = document.getElementById('fixed-expense-list-container');
    const totalSpan = document.getElementById('fixed-total-amount');
    const data = JSON.parse(localStorage.getItem('cnb_fixed_expenses')) || [];
    if (data.length === 0) { list.innerHTML = '<p style="color: var(--text-muted); font-size: 14px;">Nenhum custo fixo cadastrado.</p>'; if(totalSpan) totalSpan.innerText = '0.00'; return; }
    list.innerHTML = ''; 
    let total = 0;
    data.sort((a, b) => parseInt(a.day) - parseInt(b.day)).forEach(ex => {
        total += parseFloat(ex.amount);
        list.insertAdjacentHTML('beforeend', `<div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid var(--border-color);"><div style="flex: 1;"><strong style="display: block;">${ex.desc}</strong><span style="font-size: 12px; color: var(--text-muted);">Vence dia: ${ex.day}</span></div><div style="display: flex; align-items: center; gap: 15px;"><span style="color: #dc2626; font-weight: 600;">R$ ${parseFloat(ex.amount).toFixed(2)}</span><div><button onclick="editFixedExpense('${ex.id}')" style="background:none; border:none; cursor:pointer;">✏️</button><button onclick="deleteFixedExpense('${ex.id}')" style="background:none; border:none; cursor:pointer;">🗑️</button></div></div></div>`);
    });
    if(totalSpan) totalSpan.innerText = total.toFixed(2);
}

// RECEITAS
window.editIncome = function(id) {
    const inc = (JSON.parse(localStorage.getItem('cnb_incomes')) || []).find(x => x.id === id);
    if(inc) { document.getElementById('income-id').value = inc.id; document.getElementById('income-source').value = inc.source; document.getElementById('income-amount').value = inc.amount; document.getElementById('income-day').value = inc.day; document.getElementById('income-source').focus(); }
};
window.deleteIncome = function(id) {
    if(confirm(`Excluir esta receita?`)) { localStorage.setItem('cnb_incomes', JSON.stringify((JSON.parse(localStorage.getItem('cnb_incomes')) || []).filter(x => x.id !== id))); renderIncomes(); renderDashboard(); }
};
function renderIncomes() {
    const list = document.getElementById('income-list-container');
    const totalSpan = document.getElementById('income-total-amount');
    const data = JSON.parse(localStorage.getItem('cnb_incomes')) || [];
    if (data.length === 0) { list.innerHTML = '<p style="color: var(--text-muted); font-size: 14px;">Nenhuma receita cadastrada.</p>'; if(totalSpan) totalSpan.innerText = '0.00'; return; }
    list.innerHTML = ''; 
    let total = 0;
    data.sort((a, b) => parseInt(a.day) - parseInt(b.day)).forEach(inc => {
        total += parseFloat(inc.amount);
        list.insertAdjacentHTML('beforeend', `<div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid var(--border-color);"><div style="flex: 1;"><strong style="display: block; color: var(--text-main);">${inc.source}</strong><span style="font-size: 12px; color: var(--text-muted);">Recebe dia: ${inc.day}</span></div><div style="display: flex; align-items: center; gap: 15px;"><span style="color: #16a34a; font-weight: 600;">+ R$ ${parseFloat(inc.amount).toFixed(2)}</span><div><button onclick="editIncome('${inc.id}')" style="background:none; border:none; cursor:pointer;">✏️</button><button onclick="deleteIncome('${inc.id}')" style="background:none; border:none; cursor:pointer;">🗑️</button></div></div></div>`);
    });
    if(totalSpan) totalSpan.innerText = total.toFixed(2);
}

// ==========================================
// INICIALIZAÇÃO NO LOAD DA PÁGINA
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    const savedExpense = localStorage.getItem('cnb_last_expense');
    if (savedExpense) renderExpenseResult(JSON.parse(savedExpense));
    
    const savedStudy = localStorage.getItem('cnb_last_study');
    if (savedStudy) renderStudySchedule(JSON.parse(savedStudy));
    
    renderRoutines();
    renderWorkouts(); 
    renderStudyTracker(); 
    renderMeals(); // Já converte Pequeno-almoço automaticamente para Café da Manhã!
    renderAgenda(); 
    renderFixedExpenses();
    renderIncomes(); 
    renderDashboard(); 
});

// ==========================================
// SUBMITS DOS FORMULÁRIOS
// ==========================================

document.getElementById('routine-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const day = document.getElementById('routine-day').value;
    const type = document.getElementById('routine-type').value;
    const time = document.getElementById('routine-time').value;
    
    let data = JSON.parse(localStorage.getItem('cnb_routines')) || [];
    data = data.filter(r => r.day !== day);
    data.push({ day, type, time });
    
    localStorage.setItem('cnb_routines', JSON.stringify(data));
    document.getElementById('routine-time').value = '';
    
    renderRoutines(); 
    renderDashboard(); 
});

document.getElementById('workout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const day = document.getElementById('workout-day').value;
    const type = document.getElementById('workout-type').value;
    const desc = document.getElementById('workout-desc').value;
    const time = document.getElementById('workout-time').value || 'S/ Hora';
    
    let data = JSON.parse(localStorage.getItem('cnb_workouts')) || [];
    data = data.filter(w => w.day !== day);
    data.push({ day, type, desc, time });
    
    localStorage.setItem('cnb_workouts', JSON.stringify(data));
    document.getElementById('workout-desc').value = '';
    document.getElementById('workout-time').value = '';
    
    renderWorkouts();
    renderDashboard();
});

document.getElementById('study-list-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const topic = document.getElementById('study-list-topic').value;
    const status = document.getElementById('study-list-status').value;
    
    let data = JSON.parse(localStorage.getItem('cnb_study_list')) || [];
    data = data.filter(s => s.topic !== topic);
    data.push({ topic, status });
    
    localStorage.setItem('cnb_study_list', JSON.stringify(data));
    document.getElementById('study-list-topic').value = '';
    document.getElementById('study-list-status').value = 'A Fazer';
    
    renderStudyTracker();
    renderDashboard();
});

document.getElementById('meal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const day = document.getElementById('meal-day').value;
    const type = document.getElementById('meal-type').value;
    const desc = document.getElementById('meal-desc').value;
    
    let data = JSON.parse(localStorage.getItem('cnb_meals')) || [];
    data = data.filter(m => !(m.day === day && m.type === type));
    data.push({ day, type, desc });
    
    localStorage.setItem('cnb_meals', JSON.stringify(data));
    document.getElementById('meal-desc').value = '';
    
    renderMeals();
    renderDashboard();
});

document.getElementById('agenda-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('agenda-id').value || Date.now().toString();
    const day = document.getElementById('agenda-day').value;
    const time = document.getElementById('agenda-time').value;
    const type = document.getElementById('agenda-type').value;
    const title = document.getElementById('agenda-title').value;
    
    let data = JSON.parse(localStorage.getItem('cnb_agenda')) || [];
    data = data.filter(a => a.id !== id);
    data.push({ id, day, time, type, title });
    
    localStorage.setItem('cnb_agenda', JSON.stringify(data));
    document.getElementById('agenda-id').value = '';
    document.getElementById('agenda-title').value = '';
    document.getElementById('agenda-time').value = '';
    
    renderAgenda();
    renderDashboard();
});

document.getElementById('fixed-expense-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('fixed-expense-id').value || Date.now().toString();
    const desc = document.getElementById('fixed-expense-desc').value;
    const amount = document.getElementById('fixed-expense-amount').value;
    const day = document.getElementById('fixed-expense-day').value;
    
    let data = JSON.parse(localStorage.getItem('cnb_fixed_expenses')) || [];
    data = data.filter(x => x.id !== id);
    data.push({ id, desc, amount, day });
    
    localStorage.setItem('cnb_fixed_expenses', JSON.stringify(data));
    document.getElementById('fixed-expense-id').value = '';
    document.getElementById('fixed-expense-desc').value = '';
    document.getElementById('fixed-expense-amount').value = '';
    document.getElementById('fixed-expense-day').value = '';
    
    renderFixedExpenses();
    renderDashboard();
});

document.getElementById('income-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('income-id').value || Date.now().toString();
    const source = document.getElementById('income-source').value;
    const amount = document.getElementById('income-amount').value;
    const day = document.getElementById('income-day').value;
    
    let data = JSON.parse(localStorage.getItem('cnb_incomes')) || [];
    data = data.filter(x => x.id !== id);
    data.push({ id, source, amount, day });
    
    localStorage.setItem('cnb_incomes', JSON.stringify(data));
    document.getElementById('income-id').value = '';
    document.getElementById('income-source').value = '';
    document.getElementById('income-amount').value = '';
    document.getElementById('income-day').value = '';
    
    renderIncomes();
    renderDashboard();
});

// IA Financeira
document.getElementById('ai-expense-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const textInput = document.getElementById('expense-text').value;
    const btnSubmit = document.getElementById('btn-analyze');
    
    btnSubmit.innerText = "Analisando com IA...";
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
            
            let varExpenses = JSON.parse(localStorage.getItem('cnb_variable_expenses')) || [];
            varExpenses.push(data.ai_analysis);
            localStorage.setItem('cnb_variable_expenses', JSON.stringify(varExpenses));
            
            renderExpenseResult(data.ai_analysis);
            document.getElementById('expense-text').value = ''; 
            renderDashboard(); 
        } else {
            const err = await response.json(); 
            alert("Erro na IA: " + err.detail);
        }
    } catch (error) { 
        alert("Erro de conexão com o servidor."); 
    } finally { 
        btnSubmit.innerText = "Analisar e Salvar com IA"; 
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
    
    btnSubmit.innerText = "Pensando e planejando...";
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
            alert("Erro na IA: " + err.detail);
        }
    } catch (error) { 
        alert("Erro no navegador."); 
    } finally { 
        btnSubmit.innerText = "Gerar Plano com IA"; 
        btnSubmit.disabled = false; 
    }
});