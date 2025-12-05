/**
 * Game Center Core v3 - Optimizado y Seguro
 */

const CONFIG = {
    stateKey: 'gamecenter_v3_core',
    initialCoins: 50 // Regalo de bienvenida
};

// Estado inicial optimizado
const defaultState = {
    coins: CONFIG.initialCoins,
    // Registro de niveles pagados para evitar farming
    progress: {
        maze: [],       // Guardará IDs de niveles completados ej: [0, 1, 2]
        wordsearch: []  // Guardará IDs de capítulos completados
    },
    history: []
};

let store = { ...defaultState };

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    updateUI();
    if (window.lucide) lucide.createIcons();
});

// --- Gestión de Estado ---
function loadState() {
    try {
        const data = localStorage.getItem(CONFIG.stateKey);
        if (data) {
            const parsed = JSON.parse(data);
            // Fusionamos con default para evitar errores si añadimos juegos nuevos
            store = { ...defaultState, ...parsed, progress: { ...defaultState.progress, ...parsed.progress } };
        } else {
            saveState();
        }
    } catch (e) {
        console.error("Error cargando datos, reiniciando store segura.");
        store = { ...defaultState };
    }
}

function saveState() {
    localStorage.setItem(CONFIG.stateKey, JSON.stringify(store));
    updateUI();
}

function updateUI() {
    // Actualización eficiente del DOM (solo texto)
    document.querySelectorAll('.coin-display').forEach(el => {
        el.textContent = store.coins;
    });
}

// --- API Pública Segura ---

window.GameCenter = {
    /**
     * Intenta reclamar recompensa por nivel.
     * @param {string} gameId - Identificador del juego ('maze', 'wordsearch')
     * @param {number|string} levelId - Nivel completado
     * @param {number} rewardAmount - Cantidad de monedas
     * @returns {boolean} - True si se pagó, False si ya estaba completado (replay)
     */
    completeLevel: (gameId, levelId, rewardAmount) => {
        // 1. Validar si el juego existe en el registro
        if (!store.progress[gameId]) store.progress[gameId] = [];

        // 2. Verificar si ya se pagó este nivel
        if (store.progress[gameId].includes(levelId)) {
            console.log(`Nivel ${levelId} de ${gameId} ya pagado. Modo Replay.`);
            return false; // No pagar
        }

        // 3. Pagar y Registrar
        store.progress[gameId].push(levelId);
        store.coins += rewardAmount;
        saveState();
        
        console.log(`¡Pago primerizo! +${rewardAmount} monedas.`);
        return true; // Pagado
    },

    spendCoins: (amount, itemName) => {
        if (store.coins >= amount) {
            store.coins -= amount;
            store.history.push({ item: itemName, date: new Date().toISOString() });
            saveState();
            return true;
        }
        return false;
    },

    getBalance: () => store.coins
};
