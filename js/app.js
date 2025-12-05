/**
 * Game Center Core - Sistema Económico
 */

const CONFIG = {
    stateKey: 'gamecenter_v2_core',
    initialCoins: 0
};

// Estado Reactivo Simple
const store = {
    coins: 0,
    history: []
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    updateUI();
    
    // Inicializar iconos Lucide
    if (window.lucide) {
        lucide.createIcons();
    }
});

function loadState() {
    const data = localStorage.getItem(CONFIG.stateKey);
    if (data) {
        const parsed = JSON.parse(data);
        store.coins = parsed.coins || 0;
        store.history = parsed.history || [];
    } else {
        store.coins = CONFIG.initialCoins;
        saveState();
    }
}

function saveState() {
    localStorage.setItem(CONFIG.stateKey, JSON.stringify(store));
    updateUI();
}

function updateUI() {
    // Actualizar todos los contadores de monedas en el DOM
    document.querySelectorAll('.coin-display').forEach(el => {
        el.textContent = store.coins;
    });
}

// --- API Pública para Juegos y Tienda ---

window.GameCenter = {
    // Sumar monedas (Usado por los juegos)
    addCoins: (amount, reason = 'Juego') => {
        store.coins += amount;
        saveState();
        // Feedback visual simple si estamos en el mismo contexto
        console.log(`+${amount} Monedas ganadas en: ${reason}`);
    },

    // Gastar monedas (Usado por la tienda)
    spendCoins: (amount, item) => {
        if (store.coins >= amount) {
            store.coins -= amount;
            store.history.push({
                item: item,
                cost: amount,
                date: new Date().toISOString()
            });
            saveState();
            return true;
        }
        return false;
    },

    getBalance: () => store.coins
};
