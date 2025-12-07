/**
 * Game Center Core - Material Edition
 */

const CONFIG = {
    stateKey: 'gamecenter_material_v1',
    initialCoins: 0 // CORREGIDO: Empieza en 0
};

// Estado por defecto
const defaultState = {
    coins: CONFIG.initialCoins,
    progress: { maze: [], wordsearch: [] }, // Registro de IDs completados
    history: []
};

let store = { ...defaultState };

document.addEventListener('DOMContentLoaded', () => {
    loadState();
    updateUI();
    if (window.lucide) lucide.createIcons();
});

function loadState() {
    try {
        const data = localStorage.getItem(CONFIG.stateKey);
        if (data) {
            const parsed = JSON.parse(data);
            store = { ...defaultState, ...parsed, progress: { ...defaultState.progress, ...parsed.progress } };
        } else {
            saveState(); // Guarda el 0 inicial
        }
    } catch (e) {
        store = { ...defaultState };
    }
}

function saveState() {
    localStorage.setItem(CONFIG.stateKey, JSON.stringify(store));
    updateUI();
}

function updateUI() {
    document.querySelectorAll('.coin-display').forEach(el => el.textContent = store.coins);
}

window.GameCenter = {
    // Sistema seguro para pagar solo la primera vez por nivel
    completeLevel: (gameId, levelId, rewardAmount) => {
        if (!store.progress[gameId]) store.progress[gameId] = [];

        // Si ya existe el nivel en el historial, NO pagar
        if (store.progress[gameId].includes(levelId)) {
            return { paid: false, total: store.coins };
        }

        // Si es nuevo, pagar
        store.progress[gameId].push(levelId);
        store.coins += rewardAmount;
        saveState();
        return { paid: true, total: store.coins };
    },

    // Generar código de seguridad único para compras
    generateSecurityCode: (itemName) => {
        const prefix = itemName.substring(0, 3).toUpperCase();
        const random = Math.floor(Math.random() * 9999);
        const date = Date.now().toString().slice(-4);
        return `${prefix}-${date}-${random}`;
    },

    spendCoins: (amount, itemName) => {
        if (store.coins >= amount) {
            store.coins -= amount;
            const code = window.GameCenter.generateSecurityCode(itemName);
            
            store.history.push({ 
                item: itemName, 
                cost: amount, 
                code: code,
                date: new Date().toISOString() 
            });
            
            saveState();
            return { success: true, code: code };
        }
        return { success: false };
    },

    getBalance: () => store.coins
};
