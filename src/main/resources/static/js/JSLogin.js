// Toggle login / registro
const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

const loginFormContainer = document.getElementById('loginFormContainer');
const registerFormContainer = document.getElementById('registerFormContainer');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Tiempo de espera basado en la animación de CSS (aprox. 1.8 segundos)
const ANIMATION_DURATION = 1800; 

// ---------------- Trampa de Foco (Focus Trap) Mejorada ----------------

/**
 * @function getFocusableElementsInContainer
 * Obtiene todos los elementos enfocables (inputs, botones) dentro del contenedor principal
 * que NO están marcados como aria-hidden="true".
 * @returns {Array} Lista de elementos enfocables visibles.
 */
function getFocusableElementsInContainer() {
    const activeForm = container.querySelector('[aria-hidden="false"]');
    if (!activeForm) return [];

    // Selector de elementos que deberían ser enfocables
    const FOCUSABLE_SELECTOR = 'input, button';

    // 1. Obtener los elementos enfocables del formulario activo (inputs, botón submit)
    const formElements = Array.from(activeForm.querySelectorAll(FOCUSABLE_SELECTOR));

    // 2. Obtener el botón de toggle activo (que siempre tiene tabindex="0")
    const togglePanel = container.querySelector('.toggle-panel:not(.toggle-left):not(.toggle-right)');
    let toggleBtn = null;
    if (container.classList.contains('active')) {
        toggleBtn = container.querySelector('.toggle-panel.toggle-right .login-btn');
    } else {
        toggleBtn = container.querySelector('.toggle-panel.toggle-left .register-btn');
    }
    
    // Combinar y devolver los elementos
    const allFocusables = [...formElements, toggleBtn].filter(el => el && !el.disabled);
    
    // Importante: Eliminar duplicados si el botón de toggle está en la lista de formulario
    return [...new Set(allFocusables)];
}

/**
 * @function handleFocusTrap
 * Implementa el ciclo de foco forzado dentro del contenedor activo.
 */
function handleFocusTrap(e) {
    if (e.key !== 'Tab') return;

    // Solo activamos la trampa si el foco está realmente en el contenedor
    if (!container.contains(document.activeElement)) {
        return; 
    }

    const focusableElements = getFocusableElementsInContainer();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) { // Shift + TAB: Mover el foco hacia atrás
        if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
        }
    } else { // TAB: Mover el foco hacia adelante
        if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
        }
    }
}


// ---------------- Control de Interacción (Aria-Hidden) ----------------

/**
 * Controla la accesibilidad y estado oculto del formulario.
 * @param {HTMLElement} formContainer - El elemento .form-box (login o register).
 * @param {boolean} enable - True para habilitar, False para deshabilitar.
 */
function toggleFormActiveState(formContainer, enable) {
    // 1. Control de accesibilidad (para lectores de pantalla y foco)
    formContainer.setAttribute('aria-hidden', enable ? 'false' : 'true');
    
    // 2. Control de tabulación estricto (para navegadores problemáticos)
    const inputsAndButtons = formContainer.querySelectorAll('input, button');
    const tabValue = enable ? '0' : '-1';
    
    inputsAndButtons.forEach(el => {
        el.setAttribute('tabindex', tabValue);
    });
}


// ---------------- Inicialización y Listeners ----------------

document.addEventListener('DOMContentLoaded', () => {
    // Inicialización estricta: Login activo, Register inactivo.
    toggleFormActiveState(loginFormContainer, true);
    toggleFormActiveState(registerFormContainer, false);
    
    // Activar la trampa de foco globalmente
    document.addEventListener('keydown', handleFocusTrap);
});


// ---------------- Manejo del Toggle ----------------

registerBtn.addEventListener('click', () => {
    // 1. Deshabilitar el formulario actual (Login)
    toggleFormActiveState(loginFormContainer, false);

    container.classList.add('active');

    // 2. Esperar a que la animación termine
    setTimeout(() => {
        // 3. Habilitar enfoque del nuevo formulario (Registro)
        toggleFormActiveState(registerFormContainer, true);
        
        // Enfocar el primer campo del nuevo formulario
        registerForm.querySelector('input[name="nombre"]').focus();
    }, ANIMATION_DURATION);
});

loginBtn.addEventListener('click', () => {
    // 1. Deshabilitar el formulario actual (Registro)
    toggleFormActiveState(registerFormContainer, false);
    
    container.classList.remove('active');

    // 2. Esperar a que la animación termine
    setTimeout(() => {
        // 3. Habilitar enfoque del nuevo formulario (Login)
        toggleFormActiveState(loginFormContainer, true);
        
        // Enfocar el primer campo del nuevo formulario
        loginForm.querySelector('input[name="email"]').focus();
    }, ANIMATION_DURATION);
});


// ---------------- Lógica Original de Auth (sin cambios) ----------------
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = registerForm.nombre.value.trim();
    const email = registerForm.email.value.trim();
    const password = registerForm.password.value.trim();

    try {
        const response = await fetch('/gandersync/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password })
        });

        if (response.ok) {
            document.getElementById('registerSuccess').innerText = '¡Registro exitoso! Ya puedes iniciar sesión.';
            document.getElementById('registerError').innerText = '';
            registerForm.reset();
            
            // Forzar el cambio a la vista de Login y controlar el enfoque
            loginBtn.click();
            
        } else {
            const error = await response.json();
            document.getElementById('registerError').innerText = error.error || 'Error en el registro';
            document.getElementById('registerSuccess').innerText = '';
        }
    } catch (err) {
        document.getElementById('registerError').innerText = 'Error en el servidor.';
        document.getElementById('registerSuccess').innerText = '';
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.email.value.trim();
    const password = loginForm.password.value.trim();

    try {
        const response = await fetch('/gandersync/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const user = await response.json();
            document.getElementById('loginSuccess').innerText = `¡Bienvenido, ${user.nombre}! Redirigiendo...`;
            document.getElementById('loginError').innerText = '';
            loginForm.reset();
            
            window.location.href = '/gandersync/inicio';
            
        } else {
            const error = await response.json();
            document.getElementById('loginError').innerText = error.error || 'Credenciales incorrectas';
            document.getElementById('loginSuccess').innerText = '';
        }
    } catch (err) {
        document.getElementById('loginError').innerText = 'Error en el servidor.';
        document.getElementById('loginSuccess').innerText = '';
    }
});