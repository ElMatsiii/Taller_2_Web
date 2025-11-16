// ============================================
// CONFIGURACIÓN DE APIs
// ============================================

const API_CONFIG = {
    recetas: 'http://localhost:3002/api',
    trainers: 'http://localhost:3000/trainers',
    // Agregar aquí la URL de FastAPI cuando esté lista
    // fastapi: 'http://localhost:8000/api'
};

// ============================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ============================================

let currentTab = 'recetas';
let recetas = [];
let trainers = [];
let searchTimeout = null;

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

function showError(message) {
    const errorAlert = document.getElementById('error-alert');
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorAlert.classList.remove('hidden');
    
    // Actualizar iconos
    lucide.createIcons();
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    const errorAlert = document.getElementById('error-alert');
    errorAlert.classList.add('hidden');
}

function showLoading() {
    document.getElementById('loading-spinner').classList.remove('hidden');
    lucide.createIcons();
}

function hideLoading() {
    document.getElementById('loading-spinner').classList.add('hidden');
}

function toggleMobileMenu() {
    const mobileNav = document.getElementById('mobile-nav');
    const menuBtn = document.getElementById('mobile-menu-btn');
    
    mobileNav.classList.toggle('hidden');
    
    // Actualizar iconos
    lucide.createIcons();
}

// ============================================
// FUNCIONES DE NAVEGACIÓN
// ============================================

function switchTab(tabName) {
    currentTab = tabName;
    hideError();
    
    // Ocultar todas las vistas
    document.getElementById('recetas-view').classList.add('hidden');
    document.getElementById('trainers-view').classList.add('hidden');
    
    // Mostrar la vista seleccionada
    if (tabName === 'recetas') {
        document.getElementById('recetas-view').classList.remove('hidden');
        fetchRecetas();
    } else if (tabName === 'trainers') {
        document.getElementById('trainers-view').classList.remove('hidden');
        fetchTrainers();
    }
    
    // Actualizar estilos de tabs (desktop)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-indigo-700');
        btn.classList.add('hover:bg-indigo-500');
    });
    document.getElementById(`tab-${tabName}`).classList.add('bg-indigo-700');
    document.getElementById(`tab-${tabName}`).classList.remove('hover:bg-indigo-500');
    
    // Actualizar estilos de tabs (mobile)
    document.querySelectorAll('.tab-btn-mobile').forEach(btn => {
        btn.classList.remove('bg-indigo-700');
        btn.classList.add('hover:bg-indigo-500');
    });
}

// ============================================
// FUNCIONES PARA API DE RECETAS (Express)
// ============================================

async function fetchRecetas() {
    showLoading();
    hideError();
    
    try {
        const searchTerm = document.getElementById('search-input').value;
        const url = searchTerm 
            ? `${API_CONFIG.recetas}/recetas/search?s=${searchTerm}`
            : `${API_CONFIG.recetas}/recetas`;
        
        const response = await fetch(url);
        const data = await response.json();
        recetas = data.meals || [];
        
        renderRecetas();
    } catch (error) {
        showError('Error al cargar recetas. Verifica que la API Express esté corriendo en el puerto 3002.');
        console.error('Error:', error);
    } finally {
        hideLoading();
    }
}

function renderRecetas() {
    const grid = document.getElementById('recetas-grid');
    const noResults = document.getElementById('no-recetas');
    
    grid.innerHTML = '';
    
    if (recetas.length === 0) {
        grid.classList.add('hidden');
        noResults.classList.remove('hidden');
        return;
    }
    
    grid.classList.remove('hidden');
    noResults.classList.add('hidden');
    
    recetas.forEach(receta => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 transform';
        card.onclick = () => fetchRecetaDetalle(receta.idMeal);
        
        card.innerHTML = `
            <img 
                src="${receta.strMealThumb}" 
                alt="${receta.strMeal}"
                class="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
            >
            <div class="p-4">
                <h3 class="font-semibold text-lg mb-2 text-gray-800">${receta.strMeal}</h3>
                <div class="flex gap-2 flex-wrap">
                    ${receta.strCategory ? `
                        <span class="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                            ${receta.strCategory}
                        </span>
                    ` : ''}
                    ${receta.strArea ? `
                        <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                            ${receta.strArea}
                        </span>
                    ` : ''}
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

async function fetchRecetaDetalle(id) {
    showLoading();
    hideError();
    
    try {
        const response = await fetch(`${API_CONFIG.recetas}/recetas/${id}`);
        const data = await response.json();
        
        if (data.meals && data.meals[0]) {
            showRecetaModal(data.meals[0]);
        }
    } catch (error) {
        showError('Error al cargar detalle de receta');
        console.error('Error:', error);
    } finally {
        hideLoading();
    }
}

function showRecetaModal(receta) {
    const modal = document.getElementById('receta-modal');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');
    
    title.textContent = receta.strMeal;
    
    // Construir lista de ingredientes
    let ingredientes = '';
    for (let i = 1; i <= 20; i++) {
        const ingredient = receta[`strIngredient${i}`];
        const measure = receta[`strMeasure${i}`];
        
        if (ingredient && ingredient.trim()) {
            ingredientes += `<li class="text-gray-700 py-1">• ${measure} ${ingredient}</li>`;
        }
    }
    
    content.innerHTML = `
        <img 
            src="${receta.strMealThumb}" 
            alt="${receta.strMeal}"
            class="w-full h-64 object-cover rounded-lg shadow-md"
        >
        
        <div class="flex gap-2 flex-wrap">
            <span class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                ${receta.strCategory}
            </span>
            <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                ${receta.strArea}
            </span>
        </div>

        <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="font-semibold text-lg mb-3 text-gray-800">Ingredientes:</h3>
            <ul class="space-y-1">
                ${ingredientes}
            </ul>
        </div>

        <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="font-semibold text-lg mb-3 text-gray-800">Instrucciones:</h3>
            <p class="text-gray-700 whitespace-pre-line leading-relaxed">${receta.strInstructions}</p>
        </div>
    `;
    
    modal.classList.remove('hidden');
    
    // Reinicializar iconos
    lucide.createIcons();
}

function closeRecetaModal() {
    const modal = document.getElementById('receta-modal');
    modal.classList.add('hidden');
}

// ============================================
// FUNCIONES PARA API DE TRAINERS (NestJS)
// ============================================

async function fetchTrainers() {
    showLoading();
    hideError();
    
    try {
        const response = await fetch(API_CONFIG.trainers);
        trainers = await response.json();
        
        renderTrainers();
    } catch (error) {
        showError('Error al cargar entrenadores. Verifica que la API NestJS esté corriendo en el puerto 3000.');
        console.error('Error:', error);
    } finally {
        hideLoading();
    }
}

function renderTrainers() {
    const grid = document.getElementById('trainers-grid');
    const noResults = document.getElementById('no-trainers');
    
    grid.innerHTML = '';
    
    if (trainers.length === 0) {
        grid.classList.add('hidden');
        noResults.classList.remove('hidden');
        return;
    }
    
    grid.classList.remove('hidden');
    noResults.classList.add('hidden');
    
    trainers.forEach(trainer => {
        const card = document.createElement('div');
        card.className = 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 transform';
        
        let teamHTML = '';
        if (trainer.team && trainer.team.length > 0) {
            teamHTML = `
                <div class="mt-4">
                    <p class="text-sm font-medium text-gray-600 mb-2">Equipo:</p>
                    <div class="flex flex-wrap gap-2">
                        ${trainer.team.map(pokemon => `
                            <span class="px-3 py-1 bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-900 rounded-full text-sm font-semibold capitalize shadow-sm">
                                ${pokemon}
                            </span>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <h3 class="font-semibold text-lg text-gray-800">${trainer.name}</h3>
                <button
                    onclick="deleteTrainer('${trainer.id}')"
                    class="text-red-500 hover:text-red-700 transition-colors duration-200 focus:outline-none p-1 rounded hover:bg-red-50"
                >
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            ${teamHTML}
        `;
        
        grid.appendChild(card);
    });
    
    // Reinicializar iconos
    lucide.createIcons();
}

async function createTrainer() {
    hideError();
    
    const name = document.getElementById('trainer-name').value.trim();
    const teamInput = document.getElementById('trainer-team').value.trim();
    
    if (!name) {
        showError('El nombre del entrenador es requerido');
        return;
    }
    
    if (name.length < 3) {
        showError('El nombre debe tener al menos 3 caracteres');
        return;
    }
    
    const team = teamInput ? teamInput.split(',').map(p => p.trim()).filter(p => p) : [];
    
    try {
        const response = await fetch(API_CONFIG.trainers, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, team })
        });
        
        if (response.ok) {
            // Limpiar formulario
            document.getElementById('trainer-name').value = '';
            document.getElementById('trainer-team').value = '';
            
            // Recargar lista
            fetchTrainers();
        } else {
            const errorData = await response.json();
            showError(errorData.message || 'Error al crear entrenador');
        }
    } catch (error) {
        showError('Error al crear entrenador');
        console.error('Error:', error);
    }
}

async function deleteTrainer(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este entrenador?')) {
        return;
    }
    
    hideError();
    
    try {
        const response = await fetch(`${API_CONFIG.trainers}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            fetchTrainers();
        } else {
            showError('Error al eliminar entrenador');
        }
    } catch (error) {
        showError('Error al eliminar entrenador');
        console.error('Error:', error);
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar iconos de Lucide
    lucide.createIcons();
    
    // Cargar recetas al inicio
    fetchRecetas();
    
    // Search input con debounce
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            fetchRecetas();
        }, 500);
    });
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    
    // Cerrar modal al hacer clic fuera
    const modal = document.getElementById('receta-modal');
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeRecetaModal();
        }
    });
    
    // Tecla ESC para cerrar modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeRecetaModal();
        }
    });
    
    // Enter en inputs de trainer
    document.getElementById('trainer-name').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            createTrainer();
        }
    });
    
    document.getElementById('trainer-team').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            createTrainer();
        }
    });
});

// ============================================
// CORDOVA COMPATIBILITY
// ============================================

// Esperar a que Cordova esté listo (si se ejecuta en Cordova)
document.addEventListener('deviceready', function() {
    console.log('Cordova está listo');
    
    // Aquí puedes agregar funcionalidades específicas de Cordova
    // como manejo del botón de retroceso de Android
    
    if (typeof navigator.app !== 'undefined') {
        navigator.app.overrideButton('backbutton', true);
        document.addEventListener('backbutton', function(e) {
            e.preventDefault();
            
            // Si hay modal abierto, cerrarlo
            const modal = document.getElementById('receta-modal');
            if (!modal.classList.contains('hidden')) {
                closeRecetaModal();
                return;
            }
            
            // Si estamos en trainers, volver a recetas
            if (currentTab === 'trainers') {
                switchTab('recetas');
                return;
            }
            
            // Si estamos en recetas, salir de la app
            navigator.app.exitApp();
        }, false);
    }
}, false);

// ============================================
// MANEJO DE ERRORES GLOBALES
// ============================================

window.addEventListener('error', function(e) {
    console.error('Error global:', e.error);
    showError('Ha ocurrido un error inesperado');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Promise rechazada:', e.reason);
    showError('Error de conexión con el servidor');
});