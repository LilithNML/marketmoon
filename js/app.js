/**
 * Lógica Central - Game Center
 * Maneja el estado global, persistencia y utilidades UI.
 */

const STATE_KEY = 'gamecenter_v1_state';

// Estado inicial por defecto
const defaultState = {
    coins: 100, // Monedas iniciales de regalo
    inventory: [], // Compras realizadas
    settings: {
        darkMode: false
    },
    stats: {
        gamesPlayed: 0,
        totalEarnings: 0
    }
};

let currentState = { ...defaultState };

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initUI();
});

// --- Gestión de Estado (LocalStorage) ---

function loadState() {
    const stored = localStorage.getItem(STATE_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            // Fusionar con defaults para evitar errores en versiones nuevas
            currentState = { ...defaultState, ...parsed, settings: { ...defaultState.settings, ...parsed.settings } };
        } catch (e) {
            console.error("Error cargando estado, reseteando...", e);
        }
    }
    applySettings();
    updateBalanceUI();
}

function saveState() {
    localStorage.setItem(STATE_KEY, JSON.stringify(currentState));
    updateBalanceUI();
}

// --- Economía ---

function addCoins(amount) {
    currentState.coins += amount;
    currentState.stats.totalEarnings += amount;
    saveState();
    showNotification(`¡Ganaste ${amount} monedas!`, 'success');
    triggerConfetti();
}

function spendCoins(amount) {
    if (currentState.coins >= amount) {
        currentState.coins -= amount;
        saveState();
        return true;
    }
    return false;
}

// --- Interfaz de Usuario (UI) ---

function initUI() {
    // Toggle Modo Oscuro
    const toggleBtn = document.getElementById('dark-mode-toggle');
    if(toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            currentState.settings.darkMode = !currentState.settings.darkMode;
            saveState();
            applySettings();
        });
    }

    // Exportar / Importar
    const exportBtn = document.getElementById('btn-export');
    const importInput = document.getElementById('inp-import');
    
    if(exportBtn) exportBtn.addEventListener('click', exportData);
    if(importInput) importInput.addEventListener('change', importData);
}

function updateBalanceUI() {
    const els = document.querySelectorAll('.coin-balance-display');
    els.forEach(el => {
        el.textContent = currentState.coins;
        // Pequeña animación visual
        el.style.transform = 'scale(1.2)';
        setTimeout(() => el.style.transform = 'scale(1)', 200);
    });
}

function applySettings() {
    if (currentState.settings.darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

function showNotification(msg, type = 'info') {
    // Simple alert o toast customizado
    alert(msg); // Por simplicidad, usamos alert. En producción usar un div flotante.
}

// --- Exportar / Importar Sistema ---

function exportData() {
    const dataStr = JSON.stringify(currentState, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_juegos_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    if(!confirm("¿Estás seguro de importar? Se sobrescribirá tu progreso actual.")) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if(data.coins !== undefined) {
                currentState = data;
                saveState();
                location.reload(); // Recargar para aplicar cambios
            } else {
                alert("Archivo inválido.");
            }
        } catch (err) {
            alert("Error al leer el archivo.");
        }
    };
    reader.readAsText(file);
}

// --- Efectos Visuales ---

function triggerConfetti() {
    // Implementación mínima de confeti sin librerías
    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    for(let i=0; i<100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            color: `hsl(${Math.random()*360}, 100%, 50%)`,
            speed: Math.random() * 5 + 2
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;
        particles.forEach(p => {
            p.y += p.speed;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, 5, 5);
            if(p.y < canvas.height) active = true;
        });
        if(active) requestAnimationFrame(animate);
        else canvas.remove();
    }
    animate();
}
