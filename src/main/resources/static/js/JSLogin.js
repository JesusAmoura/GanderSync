// Toggle login / registro
const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

const loginFormContainer = document.getElementById('loginFormContainer');
const registerFormContainer = document.getElementById('registerFormContainer');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Elementos de mensaje
const loginErrorElement = document.getElementById('loginError');
const loginSuccessElement = document.getElementById('loginSuccess');

// Elementos del Modal (se inicializarán después de la inyección)
let modalOverlay;
let modalTitle;
let modalMessage;
let modalConfirmBtn;
let modalCancelBtn;

// Datos temporales para el manejo del login después de la confirmación
let pendingLoginData = null; 

// Tiempo de espera basado en la animación de CSS (aprox. 0.6 segundos en desktop)
const ANIMATION_DURATION = 600; 

// ---------------- VALIDACIONES DE CLIENTE ----------------

function isValidRole(role) {
    // Asumimos que los roles seleccionables son Vendedor o Cliente (el Admin no se registra desde aquí)
    return role === 'Vendedor' || role === 'Cliente';
}

function isValidEmailDomain(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|hotmail|outlook|yahoo)\.(com|es|co|net)$/i;
    return emailRegex.test(email);
}

function isSecurePassword(password) {
    const secureRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}[\]:;|,.<>?])(?=.{8,})/;
    return secureRegex.test(password);
}


// ---------------- UTILIDADES Y ACCESIBILIDAD ----------------

function displayMessage(elementId, message, isError = true) {
    const errorEl = document.getElementById(`${elementId}Error`);
    const successEl = document.getElementById(`${elementId}Success`);
    
    if (isError) {
        errorEl.innerHTML = message;
        successEl.innerText = '';
    } else {
        successEl.innerText = message;
        errorEl.innerText = '';
    }
}

/**
 * Limpia el formulario y sus mensajes de error/éxito.
 */
function clearForm(form) {
    form.reset();
    const formId = form.id.replace('Form', '');
    displayMessage(formId, '', false); 
    displayMessage(formId, '', true);  
}

function getRole(form) {
    const roleSelect = form.querySelector('select[name="role"]');
    return roleSelect ? roleSelect.value : ''; // Devuelve Title Case (ej: Vendedor)
}

function toggleFormActiveState(formContainer, enable) {
    formContainer.setAttribute('aria-hidden', enable ? 'false' : 'true');
    const elementsToControl = formContainer.querySelectorAll('input, button, select, a[href]'); 
    const tabValue = enable ? '0' : '-1';
    
    elementsToControl.forEach(el => {
        // Aseguramos que los select no pierdan el tabindex en el formulario visible
        if (el.tagName === 'SELECT' && formContainer.id.includes('FormContainer')) {
            el.setAttribute('tabindex', '0');
        } else {
            el.setAttribute('tabindex', tabValue);
        }
    });
}

function getFocusableElementsInContainer() {
    const activeForm = container.querySelector('[aria-hidden="false"]');
    if (!activeForm) return [];
    const FOCUSABLE_SELECTOR = 'input:not([type="hidden"]), button, select, a[href]'; 
    const formElements = Array.from(activeForm.querySelectorAll(FOCUSABLE_SELECTOR)).filter(el => el.getAttribute('tabindex') !== '-1');
    
    const visibleToggleBtn = container.classList.contains('active') 
        ? container.querySelector('.toggle-panel.toggle-right .login-btn')
        : container.querySelector('.toggle-panel.toggle-left .register-btn');
    
    const allFocusables = [...formElements, visibleToggleBtn].filter(el => el && !el.disabled);
    return [...new Set(allFocusables)];
}

function handleFocusTrap(e) {
    if (e.key !== 'Tab') return;
    if (!container.contains(document.activeElement)) return; 

    const focusableElements = getFocusableElementsInContainer();
    if (focusableElements.length === 0) return;
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) { 
        if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
        }
    } else { 
        if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
        }
    }
}


// ---------------- LÓGICA DEL BOTÓN DE "OJO" (Ver Contraseña) ----------------

function setupPasswordToggle() {
    // Seleccionar todos los botones de toggle de contraseña
    const toggleBtns = document.querySelectorAll('.password-toggle');
    
    toggleBtns.forEach(toggleBtn => {
        // Encontrar el contenedor más cercano (input-box)
        const inputBox = toggleBtn.closest('.input-box');
        
        // Buscar el input de contraseña por su atributo 'name' dentro de ese contenedor
        const passwordInputBox = inputBox ? inputBox.querySelector('input[name="password"]') : null;

        if (!passwordInputBox || toggleBtn.hasAttribute('data-listener')) {
            return;
        }

        toggleBtn.addEventListener('click', () => {
            // Obtener el tipo actual (text o password) y alternarlo
            const currentType = passwordInputBox.getAttribute('type');
            const newType = currentType === 'password' ? 'text' : 'password';
            
            passwordInputBox.setAttribute('type', newType);

            // Cambiar el ícono (Boxicons)
            const icon = toggleBtn.querySelector('i');
            if (newType === 'text') {
                icon.className = 'bx bxs-show'; // Ojo abierto
                toggleBtn.setAttribute('aria-label', 'Ocultar contraseña');
            } else {
                icon.className = 'bx bxs-low-vision'; // Ojo cerrado
                toggleBtn.setAttribute('aria-label', 'Mostrar contraseña');
            }
        });
        // Marcar el botón para evitar duplicación de listeners
        toggleBtn.setAttribute('data-listener', 'true');
    });
}


// ---------------- MODAL LOGIC ----------------

/**
 * Inyecta el HTML del modal en el body
 */
function injectModalHtml() {
    const modalHtml = `
        <div id="roleConfirmationModal" class="modal-overlay" style="display:none;">
            <div class="modal-content">
                <h2 id="modalTitle"></h2>
                <p id="modalMessage"></p>
                <div class="modal-buttons">
                    <button id="modalConfirmBtn" type="button" class="btn">Continuar</button>
                    <button id="modalCancelBtn" type="button" class="btn btn-secondary">Regresar</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Asignar referencias a los elementos recién creados
    modalOverlay = document.getElementById('roleConfirmationModal');
    modalTitle = document.getElementById('modalTitle');
    modalMessage = document.getElementById('modalMessage');
    modalConfirmBtn = document.getElementById('modalConfirmBtn');
    modalCancelBtn = document.getElementById('modalCancelBtn');

    // Asignar listeners a los botones del modal
    modalConfirmBtn.addEventListener('click', handleModalConfirmation);
    modalCancelBtn.addEventListener('click', handleModalCancellation);
}

/**
 * Muestra el modal con el contenido específico (Mensaje y título solicitados)
 * @param {string} registeredRoleDisplay - Rol registrado, ej: 'Vendedor' (Title Case)
 * @param {string} selectedRoleDisplay - Rol seleccionado, ej: 'CLIENTE' (Title Case)
 */
function showRoleConfirmationModal(registeredRoleDisplay, selectedRoleDisplay) {
    // Título y Mensaje de advertencia solicitado (sin negritas)
    modalTitle.innerText = "🚨 Advertencia de Rol";
    // Usamos innerHTML para permitir que el texto solicitado se muestre en negrita (markdown)
    modalMessage.innerHTML = `
        <p>Estás intentando ingresar como **${selectedRoleDisplay}**.</p>
        <p>Tu Rol original registrado es **${registeredRoleDisplay}**.</p>
        <p>Al continuar, se desactivarán algunas Funciones esenciales para tu Rol original.</p>
    `; 
    
    modalConfirmBtn.textContent = `Continuar`;
    modalCancelBtn.textContent = `Regresar`;
    
    modalOverlay.style.display = 'flex';
    setTimeout(() => modalOverlay.classList.add('show'), 10);
    modalOverlay.focus(); // Enfocar el modal para accesibilidad
}

/**
 * Oculta el modal
 */
function hideRoleConfirmationModal() {
    modalOverlay.classList.remove('show');
    // Esperar a la transición CSS antes de ocultar completamente
    setTimeout(() => modalOverlay.style.display = 'none', 300); 
    pendingLoginData = null; // Limpiar datos pendientes
}

/**
 * Maneja la acción de confirmar (Continuar)
 */
function handleModalConfirmation() {
    if (!pendingLoginData) return hideRoleConfirmationModal();
    
    // selectedRoleBase: Rol Title Case seleccionado (ej: Vendedor)
    // user: Objeto del usuario (contiene email)
    const { user, selectedRoleBase } = pendingLoginData;
    
    hideRoleConfirmationModal();
    
    const userEmail = user.email || ''; 
    
    displayMessage('login', `👋 ¡Bienvenido, ${user.nombre}! Redirigiendo como ${selectedRoleBase}...`, false);
    loginForm.reset();
    // Redirige con el rol en Title-Case y el email
    window.location.href = `/inicio?role=${selectedRoleBase}&email=${userEmail}`; 
}

/**
 * Maneja la acción de cancelar (Regresar)
 */
function handleModalCancellation() {
    if (!pendingLoginData) return hideRoleConfirmationModal();
    
    // regRoleBaseDisplay: Rol Title Case registrado (ej: Cliente)
    const { regRoleBaseDisplay } = pendingLoginData;
    
    hideRoleConfirmationModal();
    displayMessage('login', `❌ Login cancelado. Por favor, ingrese como ${regRoleBaseDisplay}.`);
    
    // Re-seleccionar el rol correcto en el select (Vendedor/Cliente)
    const roleSelect = loginForm.querySelector('select[name="role"]');
    
    if (roleSelect) {
        // Usamos el rol Title Case limpio para reestablecer el select.
        roleSelect.value = regRoleBaseDisplay; 
    }
}


// ---------------- LÓGICA DE AUTH CON API ----------------

/**
 * Normaliza cualquier formato de rol (e.g., 'ROLE_VENDEDOR', 'vendedor') a Title Case (e.g., 'Vendedor').
 * Es CRÍTICA para la consistencia.
 */
function toTitleCaseRole(roleString) {
    if (!roleString) return 'Cliente'; // Default seguro
    // 1. Quitar el prefijo ROLE_ (insensible al caso)
    const rawRole = roleString.replace(/^ROLE_/i, '');
    // 2. Convertir a minúsculas
    const baseRole = rawRole.toLowerCase();
    // 3. Poner la primera letra en mayúscula (Title Case)
    return baseRole.charAt(0).toUpperCase() + baseRole.slice(1);
}


// --- REGISTRO ---
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = registerForm.nombre.value.trim();
    const email = registerForm.email.value.trim();
    const password = registerForm.password.value.trim();
    const selectedRoleTitleCase = getRole(registerForm); // Ej: "Vendedor" (Title Case del select)
    
    if (!isValidRole(selectedRoleTitleCase)) {
        displayMessage('register', '🚨 Por favor, seleccione un Rol válido (Vendedor o Cliente).');
        return;
    }

    if (!isValidEmailDomain(email)) {
        displayMessage('register', '📧 El correo debe ser válido y usar dominios comunes (ej: @gmail.com).');
        return;
    }

    if (!isSecurePassword(password)) {
        displayMessage('register', '🔒 Contraseña débil: Mínimo 8 caracteres, incluir mayúscula, minúscula, número y símbolo.');
        return;
    }

    // CRÍTICO: Formatear el rol para el backend como ROLE_UPPERCASE
    const roleApi = "ROLE_" + selectedRoleTitleCase.toUpperCase(); 
    displayMessage('register', '⏳ Procesando registro...', false);

    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password, role: roleApi })
        });

        if (response.ok) {
            displayMessage('register', '✅ ¡Registro exitoso! Ya puedes iniciar sesión.', false);
            registerForm.reset();
            loginBtn.click();
            
        } else {
            const error = await response.json();
            let errorMessage = error.error || 'Error en el registro. Intente con otro correo.';
            
            if (errorMessage.includes("correo ya está registrado")) {
                errorMessage = "📧 ¡Ya tienes una cuenta! Por favor, inicia sesión con ese correo.";
            }

            displayMessage('register', errorMessage);
        }
    } catch (err) {
        displayMessage('register', '❌ Error de conexión con el servidor. Por favor, inténtelo más tarde.');
    }
});

// --- LOGIN ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Limpiar cualquier mensaje de error anterior
    displayMessage('login', '', true);

    const email = loginForm.email.value.trim();
    const password = loginForm.password.value.trim();
    const selectedRoleTitleCase = getRole(loginForm); // Ej: "Vendedor" (Title Case del select)
    
    // CRÍTICO: El API espera ROLE_UPPERCASE
    const selectedRoleApi = "ROLE_" + selectedRoleTitleCase.toUpperCase(); 

    if (!isValidRole(selectedRoleTitleCase)) {
        displayMessage('login', '🚨 Por favor, seleccione su Rol.');
        return;
    }
    
    if (email.length < 5) {
        displayMessage('login', '📧 Ingrese un correo válido.');
        return;
    }

    displayMessage('login', '⏳ Verificando credenciales...', false);

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // CRÍTICO: Envía el rol esperado por el API (ROLE_UPPERCASE)
            body: JSON.stringify({ email, password, role: selectedRoleApi })
        });

        if (response.ok) {
            const user = await response.json();
            const registeredRole = user.role; // Ej: "Vendedor" o "ROLE_Vendedor" (viene del API)
            
            // --- VERIFICACIÓN DE ROL (ACTIVA EL MODAL) ---
            // Normalizamos el rol registrado a Title Case limpio (ej: Vendedor)
            const registeredRoleTitleCase = toTitleCaseRole(registeredRole);
            
            // Para la comparación usamos una base segura (Uppercase)
            const registeredRoleNormalized = registeredRoleTitleCase.toUpperCase(); 
            const selectedRoleNormalized = selectedRoleTitleCase.toUpperCase(); 

            // Si las bases no coinciden (ej: registrado: Vendedor, seleccionado: Cliente)
            if (registeredRoleNormalized !== selectedRoleNormalized) {
                
                // Guardar datos para la posterior confirmación/cancelación
                pendingLoginData = { 
                    user, 
                    // Usar el rol seleccionado por el usuario para la redirección si confirman
                    selectedRoleBase: selectedRoleTitleCase, 
                    // Usar el rol registrado para mostrar el mensaje de advertencia y reselección
                    regRoleBaseDisplay: registeredRoleTitleCase 
                };

                // Mostrar el modal con los roles Title Case
                showRoleConfirmationModal(registeredRoleTitleCase, selectedRoleTitleCase);
                return; 
            }

            // Si el rol es el mismo: LOGIN EXITOSO
            displayMessage('login', `👋 ¡Bienvenido, ${user.nombre}! Redirigiendo...`, false);
            loginForm.reset();
            
            // Se envía el rol Title-Case y el email para el JS de Productos
            const userEmail = user.email || '';
            window.location.href = `/inicio?role=${selectedRoleTitleCase}&email=${userEmail}`; 
            
        } else {
            const errorData = await response.json();
            let errorMessage = errorData.error || 'Credenciales o Rol incorrectos.';
            
            if (errorMessage.includes("Usuario no registrado")) {
                errorMessage = "🚫 Cuenta no encontrada. Por favor, regístrese primero.";
            } else if (errorMessage.includes("Contraseña inválida") || errorMessage.includes("Credenciales inválidas")) {
                errorMessage = "🔒 Contraseña incorrecta. Intente de nuevo.";
            } else if (errorMessage.includes("Rol seleccionado inválido")) {
                 errorMessage = "El Rol seleccionado no coincide con el registrado.";
            }
            
            displayMessage('login', errorMessage);
        }
    } catch (err) {
        displayMessage('login', '❌ Error de conexión con el servidor. Por favor, inténtelo más tarde.');
    }
});


// ---------------- INICIALIZACIÓN Y TOGGLE DE FORMS ----------------

document.addEventListener('DOMContentLoaded', () => {
    // Inyectar el modal y configurar los botones de "ojo"
    injectModalHtml(); 
    setupPasswordToggle(); 
    
    const isActive = container.classList.contains('active');
    
    toggleFormActiveState(loginFormContainer, !isActive);
    toggleFormActiveState(registerFormContainer, isActive);
    
    // Configurar tabindex inicial de los botones de toggle lateral
    container.querySelector('.register-btn').setAttribute('tabindex', isActive ? '-1' : '0');
    container.querySelector('.login-btn').setAttribute('tabindex', isActive ? '0' : '-1');
    
    document.addEventListener('keydown', handleFocusTrap);
});

registerBtn.addEventListener('click', () => {
    clearForm(loginForm); 
    toggleFormActiveState(loginFormContainer, false);
    
    loginBtn.setAttribute('tabindex', '0'); 
    registerBtn.setAttribute('tabindex', '-1'); 
    
    container.classList.add('active');
    
    setTimeout(() => {
        toggleFormActiveState(registerFormContainer, true);
        const firstField = registerForm.querySelector('input[name="nombre"]');
        if (firstField) firstField.focus();
    }, ANIMATION_DURATION);
});

loginBtn.addEventListener('click', () => {
    clearForm(registerForm); 
    toggleFormActiveState(registerFormContainer, false);
    
    registerBtn.setAttribute('tabindex', '0'); 
    loginBtn.setAttribute('tabindex', '-1'); 
    
    container.classList.remove('active');
    
    setTimeout(() => {
        toggleFormActiveState(loginFormContainer, true);
        const firstField = loginForm.querySelector('input[name="email"]');
        if (firstField) firstField.focus();
    }, ANIMATION_DURATION);
});