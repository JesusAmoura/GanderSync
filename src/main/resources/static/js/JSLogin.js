// [JSLogin.js] CÓDIGO LIMPIO SIN LÓGICA DE OAUTH2 SOCIAL

// Toggle login / registro
const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

const loginFormContainer = document.getElementById('loginFormContainer');
const registerFormContainer = document.getElementById('registerFormContainer');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
// Elementos de mensaje de Login/Registro
const loginErrorElement = document.getElementById('loginError');
const loginSuccessElement = document.getElementById('loginSuccess');
const registerErrorElement = document.getElementById('registerError');
const registerSuccessElement = document.getElementById('registerSuccess');

// Elementos del Modal de ROL
let modalOverlay;
let modalTitle;
let modalMessage;
let modalConfirmBtn;
let modalCancelBtn;
// Datos temporales para el manejo del login después de la confirmación de ROL
let pendingLoginData = null;
// Tiempo de espera basado en la animación de CSS (aprox. 0.6 segundos en desktop)
const ANIMATION_DURATION = 600;
// ---------------- VALIDACIONES DE CLIENTE ----------------

function isValidRole(role) {
    // Asumimos que los roles seleccionables son Vendedor o Cliente (el Admin no se registra desde aquí)
    return role === 'Vendedor' ||
role === 'Cliente';
}

function isValidEmailDomain(email) {
    // Permite cualquier dominio válido para email, no solo los comunes, pero requiere estructura válida
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
return emailRegex.test(email);
}

function isSecurePassword(password) {
    // Mínimo 8 caracteres, mayúscula, minúscula, número y símbolo
    const secureRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}[\]:;|,.<>?])(?=.{8,})/;
return secureRegex.test(password);
}


// ---------------- UTILIDADES Y ACCESIBILIDAD ----------------

function displayMessage(elementId, message, isError = true) {
    const errorEl = document.getElementById(`${elementId}Error`);
const successEl = document.getElementById(`${elementId}Success`);
    
    if (isError) {
        if(errorEl) errorEl.innerHTML = message;
if(successEl) successEl.innerText = '';
    } else {
        if(successEl) successEl.innerText = message;
if(errorEl) errorEl.innerText = '';
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
    return roleSelect ? roleSelect.value : '';
// Devuelve Title Case (ej: Vendedor)
}

function toggleFormActiveState(formContainer, enable) {
    formContainer.setAttribute('aria-hidden', enable ? 'false' : 'true');
const elementsToControl = formContainer.querySelectorAll('input, button, select, a[href]'); 
    const tabValue = enable ? '0' : '-1';
elementsToControl.forEach(el => {
        // Excluir los botones de toggle de contraseña del control de tabindex general
        if (el.classList.contains('password-toggle')) {
            el.setAttribute('tabindex', enable ? '0' : '-1');
        } else if (el.tagName === 'SELECT' && formContainer.id.includes('FormContainer')) {
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
        ?
container.querySelector('.toggle-panel.toggle-right .login-btn')
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

/**
 * Muestra u oculta la contraseña en el campo de input.
 */
function setupPasswordToggle() {
    // Seleccionar todos los botones de toggle de contraseña
    const toggleBtns = document.querySelectorAll('.password-toggle');
toggleBtns.forEach(toggleBtn => {
        // Marcar el botón para evitar duplicación de listeners
        if (toggleBtn.hasAttribute('data-listener')) return;

        toggleBtn.addEventListener('click', () => {
            // 1. Buscar el contenedor más cercano (.input-box o .recovery-input-group)
            const container = toggleBtn.closest('.input-box, .recovery-input-group');
            
            
// 2. Buscar el input de tipo password (o text si ya fue cambiado)
// CORRECCIÓN: Uso de selector más específico para evitar seleccionar un input incorrecto.
// Busca el input que contenga 'password' en el atributo 'name' (p.ej., name="password", name="newPassword").
            const passwordInputBox = container.querySelector('input[name*="password"]');
            
            if (!passwordInputBox) {
console.error("Input de contraseña no encontrado para el toggle.");
              
return;
            }
            
            // Obtener el tipo actual (text o password) y alternarlo
            const currentType = passwordInputBox.getAttribute('type');
const newType = currentType === 'password' ? 'text' : 'password';
            
            passwordInputBox.setAttribute('type', newType);
// Cambiar el ícono (Boxicons)
            const icon = toggleBtn.querySelector('i');
if (newType === 'text') {
                icon.className = 'bx bxs-show';
// Ojo abierto
                toggleBtn.setAttribute('aria-label', 'Ocultar contraseña');
} else {
                icon.className = 'bx bxs-low-vision';
// Ojo cerrado
                toggleBtn.setAttribute('aria-label', 'Mostrar contraseña');
}
        });
        toggleBtn.setAttribute('data-listener', 'true');
    });
}


// ---------------- MODAL LÓGICA DE CONFIRMACIÓN DE ROL ----------------

/**
 * Inyecta el HTML del modal de ROL en el body (Si no existe, se usa el del HTML)
 */
function injectModalHtml() {
    // Se asume que el HTML ya contiene el modal para simplificar
    modalOverlay = document.getElementById('roleConfirmationModal');
if (!modalOverlay) return; // Si no existe, no hacemos nada.
    
    modalTitle = document.getElementById('modalTitle');
    modalMessage = document.getElementById('modalMessage');
    modalConfirmBtn = document.getElementById('modalConfirmBtn');
modalCancelBtn = document.getElementById('modalCancelBtn');

    // Asignar listeners
    if (modalConfirmBtn) modalConfirmBtn.addEventListener('click', handleModalConfirmation);
    if (modalCancelBtn) modalCancelBtn.addEventListener('click', handleModalCancellation);
}

/**
 * Muestra el modal con el contenido específico (Mensaje y título solicitados)
 * @param {string} registeredRoleDisplay - Rol registrado, ej: 'Vendedor' (Title Case)
 * @param {string} selectedRoleDisplay - Rol seleccionado, ej: 'CLIENTE' (Title Case)
 */
function showRoleConfirmationModal(registeredRoleDisplay, selectedRoleDisplay) {
    if (!modalOverlay) return;
// Título y Mensaje de advertencia solicitado (sin negritas)
    modalTitle.innerText = "🚨 Advertencia de Rol";
// Usamos innerHTML para permitir que el texto solicitado se muestre en negrita
    modalMessage.innerHTML = `
        <p>Estás intentando ingresar como <b>${selectedRoleDisplay}</b>.</p>
        <p>Tu Rol original registrado es <b>${registeredRoleDisplay}</b>.</p>
        <p>Al continuar, se desactivarán algunas Funciones esenciales para tu Rol original.</p>
    `;
modalConfirmBtn.textContent = `Continuar`;
    modalCancelBtn.textContent = `Regresar`;
    
    modalOverlay.classList.add('show');
    // Forzar foco en el modal (o un elemento dentro) para accesibilidad
    setTimeout(() => {
        modalOverlay.focus(); 
        if(modalConfirmBtn) modalConfirmBtn.focus();
    }, 300);
}

/**
 * Oculta el modal de ROL
 */
function hideRoleConfirmationModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('show');
// Esperar a la transición CSS antes de limpiar y devolver el foco al formulario de login
    setTimeout(() => {
        pendingLoginData = null; // Limpiar datos pendientes
        loginForm.email.focus();
    }, 300);
}

/**
 * Maneja la acción de confirmar (Continuar) para el modal de ROL
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
 * Maneja la acción de cancelar (Regresar) para el modal de ROL
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


// ---------------- LÓGICA DE RECUPERACIÓN DE CONTRASEÑA (CONEXIÓN API REAL) ----------------

// Referencias del nuevo modal de recuperación
const recoveryModal = document.getElementById('passwordRecoveryModal');
const viewsWrapper = document.querySelector('.recovery-views-wrapper');
const recoveryEmailInput = document.getElementById('recoveryEmail');

// Elementos de Error (NECESARIOS PARA LA ANIMACIÓN)
const emailErrorElement = document.getElementById('emailError');
const codeErrorElement = document.getElementById('codeError');
const passwordErrorElement = document.getElementById('passwordError'); // Elemento de error para el Paso 3


// Campos de código individual (Telegram style)
const codeInputs = document.querySelectorAll('.code-input');
const newPasswordInput = document.getElementById('newPassword');
const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
const forgotPasswordLink = document.querySelector('.forgot-link a');
// Enlace de "Olvidaste tu contraseña"

// Botones por paso (Actualizados a los IDs del HTML)
const recoverySendCodeBtn = document.getElementById('recoverySendCodeBtn');
const verifyCodeBtn = document.getElementById('recoveryVerifyCodeBtn'); // Corregido ID
const changePasswordBtn = document.getElementById('changePasswordBtn');
const recoveryBackBtn = document.getElementById('recoveryBackBtn');
const recoveryCancelBtn = document.getElementById('recoveryCancelBtn');
const finalCancelBtn = document.getElementById('finalCancelBtn');

// Variables de estado
let currentStep = 1;
// 1: Email, 2: Code, 3: New Password
let userEmailForRecovery = '';
// ---------------- FUNCIONES DE UTILIDAD PARA EL ALERT ANIMADO (5 SEGUNDOS) ----------------

/**
 * Muestra el mensaje de alerta con animación (expansión) y establece el temporizador de 5 segundos.
 * @param {HTMLElement} element El elemento <p> del alert.
 * @param {string} message El mensaje de error a mostrar.
 */
function showAlert(element, message) {
    if (!element) return;
// 1. Limpiar cualquier timeout anterior para este elemento
    const existingTimeout = element.getAttribute('data-timeout-id');
if (existingTimeout) {
        clearTimeout(parseInt(existingTimeout));
}
    
    element.textContent = message;
// Forzar un reflow antes de añadir la clase para asegurar que la transición se aplique
    void element.offsetWidth;
element.classList.add('show-alert');

    // 2. Establecer el nuevo timeout (5000ms = 5 segundos) y guardar el ID
    const newTimeoutId = setTimeout(() => {
        hideAlert(element);
    }, 5000);
element.setAttribute('data-timeout-id', newTimeoutId);
}

/**
 * Oculta el mensaje de alerta con animación (colapso).
 * @param {HTMLElement} element El elemento <p> del alert.
 */
function hideAlert(element) {
    if (!element) return;
// 1. Limpiar el timeout asociado al elemento si se oculta manualmente o por el timeout
    const existingTimeout = element.getAttribute('data-timeout-id');
if (existingTimeout) {
        clearTimeout(parseInt(existingTimeout));
        element.removeAttribute('data-timeout-id');
}
    
    element.classList.remove('show-alert');
// Limpiar el texto después de que termine la animación de colapso
    // El CSS anterior fijó la duración de la transición a 0.3s (300ms)
    setTimeout(() => {
        element.textContent = '';
    }, 300);
}


/**
 * Transiciona el modal al paso deseado y actualiza la visibilidad de los botones.
 * @param {number} step - El número del paso (1, 2 o 3).
 */
function goToRecoveryStep(step) {
    currentStep = step;
    
    // Calcula el porcentaje de desplazamiento horizontal
    const transformPercentage = (step - 1) * 33.333;
if(viewsWrapper) viewsWrapper.style.transform = `translateX(-${transformPercentage}%)`;

    // Limpia todas las alertas al cambiar de paso
    hideAlert(emailErrorElement);
    hideAlert(codeErrorElement);
    hideAlert(passwordErrorElement);
// Foco en el campo correcto
    setTimeout(() => {
        if (step === 1 && recoveryEmailInput) recoveryEmailInput.focus();
        if (step === 2 && codeInputs[0]) codeInputs[0].focus(); 
        if (step === 3 && newPasswordInput) newPasswordInput.focus();
        
        setupPasswordToggle();
    }, 500);
// Dar tiempo a la animación
}


/**
 * Muestra el modal de recuperación
 */
function showRecoveryModal() {
    if (!recoveryModal) return;
recoveryModal.classList.add('show');
    // Reiniciar al primer paso al abrir
    goToRecoveryStep(1);
}

/**
 * Oculta el modal de recuperación
 */
function hideRecoveryModal() {
    if (!recoveryModal) return;
    recoveryModal.classList.remove('show');
// Esperar a la transición CSS
    setTimeout(() => {
        recoveryModal.style.display = 'none';
        // Limpiar inputs al cerrar
        recoveryEmailInput.value = '';
        codeInputs.forEach(input => input.value = ''); 
        newPasswordInput.value = '';
        confirmNewPasswordInput.value = '';
        userEmailForRecovery = '';
        currentStep = 1; // Resetear paso
 
 
        // Devolver foco al formulario principal
        loginForm.email.focus();
    }, 300);
}


/**
 * Consolidación y manejo de los campos de código individuales (Telegram style).
 */
function setupCodeInputHandler() {
    codeInputs.forEach((input, index) => {
        // Enfoque automático al siguiente campo
        input.addEventListener('input', (e) => {
            // Limitar a un solo dígito y asegurar que solo se pasa al siguiente si no está vacío
            if (e.data && input.value.length === 1) {
              
      
           if (index === codeInputs.length - 1) {
                    handleCodeVerification();
                } else {
                    codeInputs[index + 1].focus();
             
    }
      
     }
        });

        // Manejo de retroceso (backspace)
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && input.value === '' && index > 0) {
                codeInputs[index - 1].focus();
            
 }
        
 
});
 
    });
}


// ---------------- CONEXIÓN REAL CON SPRING BOOT API ----------------

/**
 * Llama al endpoint de Spring Boot para enviar el código.
 * POST /api/password/send-code
 */
async function apiSendRecoveryCode(email) {
    console.log(`[API REAL] Solicitando código para: ${email}`);
const response = await fetch('/api/password/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
if (response.ok) {
        // La API devuelve 200 OK incluso si el email no existe, por seguridad.
return true; 
    } else {
        const errorData = await response.json();
// Si el controlador devuelve 500 por error SMTP, el mensaje estará en el body.
throw new Error(errorData.error || errorData.message || "Error de red o configuración de servidor.");
}
}

/**
 * Llama al endpoint de Spring Boot para verificar el código.
 * POST /api/password/verify-code
 */
async function apiVerifyCode(email, code) {
    console.log(`[API REAL] Verificando código ${code} para: ${email}`);
const response = await fetch('/api/password/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
    });
if (response.ok) {
        return true;
} else {
        const errorData = await response.json();
// El controlador devuelve 400 Bad Request si es inválido o expirado.
throw new Error(errorData.error || errorData.message || "Código inválido o expirado. Intente de nuevo.");
}
}

/**
 * Llama al endpoint de Spring Boot para cambiar la contraseña.
 * POST /api/password/reset
 */
async function apiChangePassword(email, newPassword, code) {
    console.log(`[API REAL] Cambiando contraseña para ${email}`);
const response = await fetch('/api/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }) // Envía los 3 campos
    });
if (response.ok) {
        return true;
} else {
        const errorData = await response.json();
// 400 (código inválido/expirado) o 500 (error de guardado en DB)
        throw new Error(errorData.error || errorData.message || "Error al cambiar la contraseña. Verifique los datos.");
}
}


// ---------------- MANEJADORES DEL FLUJO DE RECUPERACIÓN ----------------

/**
 * Maneja el clic en "Enviar Código" del Paso 1 (Email)
 */
async function handleEmailNext() {
    const email = recoveryEmailInput.value.trim();
// 1. Ocultar el alert animado ANTES de la validación
    hideAlert(emailErrorElement);
if (email === "") {
        showAlert(emailErrorElement, "El correo electrónico es obligatorio.");
        recoveryEmailInput.focus();
        return;
}
    
    if (!isValidEmailDomain(email)) {
        showAlert(emailErrorElement, 'Por favor, ingresa un correo electrónico válido (ej: usuario@dominio.com).');
recoveryEmailInput.focus();
        return;
    }
    
    // Deshabilitar botón para evitar doble clic y mostrar estado
    if (recoverySendCodeBtn) {
        recoverySendCodeBtn.disabled = true;
recoverySendCodeBtn.textContent = 'Enviando...';
    }

    userEmailForRecovery = email;
try {
        // Llama a la API de Backend REAL
        await apiSendRecoveryCode(email);
// Transición exitosa al Paso 2
        codeInputs.forEach(input => input.value = '');
        goToRecoveryStep(2);
} catch (error) {
        // Mostrar error animado de la API (ej: error SMTP en servidor)
        showAlert(emailErrorElement, error.message || 'Error de conexión. Verifique su correo e intente de nuevo.');
userEmailForRecovery = '';
    } finally {
        if (recoverySendCodeBtn) {
            recoverySendCodeBtn.disabled = false;
recoverySendCodeBtn.textContent = 'Enviar Código';
        }
    }
}

/**
 * Maneja el clic en "Verificar" del Paso 2 (Código)
 */
async function handleCodeVerification() {
    // Consolidar el código
    const code = Array.from(codeInputs).map(i => i.value).join('');
hideAlert(codeErrorElement); // Limpiar alerta previa

    if (code.length !== 6) {
        showAlert(codeErrorElement, 'El código de verificación debe ser de 6 dígitos.');
codeInputs[0].focus();
        return;
    }
    
    // Deshabilitar botón
    if (verifyCodeBtn) {
        verifyCodeBtn.disabled = true;
verifyCodeBtn.textContent = 'Verificando...';
    }

    try {
        // Llama a la API de Backend REAL para verificar el código
        await apiVerifyCode(userEmailForRecovery, code);
// El código fue validado por el backend: Transición exitosa al Paso 3
        newPasswordInput.value = '';
confirmNewPasswordInput.value = '';
        goToRecoveryStep(3);

    } catch (error) {
        // El backend indica que el código es inválido o expiró
        showAlert(codeErrorElement, error.message || 'El código ingresado es incorrecto o ha expirado. Por favor, intente de nuevo.');
codeInputs[0].focus();
    } finally {
        if (verifyCodeBtn) {
            verifyCodeBtn.disabled = false;
verifyCodeBtn.textContent = 'Verificar';
        }
    }
}

/**
 * Maneja el clic en "Cambiar Contraseña" del Paso 3 (Nueva Contraseña)
 */
async function handleChangePassword() {
    const password = newPasswordInput.value.trim();
const confirmPassword = confirmNewPasswordInput.value.trim();
    
    // Limpieza temporal de mensajes de error de login para el feedback de la API
    displayMessage('login', '', true);
hideAlert(passwordErrorElement); // Limpiar alerta previa
    
    if (password !== confirmPassword) {
        showAlert(passwordErrorElement, 'Las contraseñas no coinciden.');
newPasswordInput.focus();
        return;
    }

    if (!isSecurePassword(password)) {
        showAlert(passwordErrorElement, 'La nueva contraseña no es segura. Debe tener al menos 8 caracteres, mayúscula, minúscula, número y símbolo.');
newPasswordInput.focus();
        return;
    }

    // Deshabilitar botón
    if (changePasswordBtn) {
        changePasswordBtn.disabled = true;
changePasswordBtn.textContent = 'Guardando...';
    }
    
    // Consolidar el código del Paso 2 (aunque ya se validó, se necesita para el endpoint /reset)
    const code = Array.from(codeInputs).map(i => i.value).join('');
try {
        // Llama a la API para cambiar la contraseña
        await apiChangePassword(userEmailForRecovery, password, code);
// Éxito
        hideRecoveryModal();
displayMessage('login', '🎉 Contraseña cambiada con éxito. Ya puedes iniciar sesión.', false);
} catch (error) {
        showAlert(passwordErrorElement, `Error al cambiar la contraseña: ${error.message}`);
} finally {
        if (changePasswordBtn) {
            changePasswordBtn.disabled = false;
changePasswordBtn.textContent = 'Cambiar Contraseña';
        }
    }
}

// ---------------- ASIGNACIÓN DE LISTENERS (RECUPERACIÓN, ENTER Y SOCIAL) ----------------

// 1. Mostrar Modal al hacer clic en el enlace
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        showRecoveryModal();
    });
}

// 2. Botones de Navegación y Acción (Recuperación)
if (recoverySendCodeBtn) recoverySendCodeBtn.addEventListener('click', handleEmailNext);
if (verifyCodeBtn) verifyCodeBtn.addEventListener('click', handleCodeVerification);
if (changePasswordBtn) changePasswordBtn.addEventListener('click', handleChangePassword);
// 3. Botones de Cancelar y Atrás
if (recoveryCancelBtn) recoveryCancelBtn.addEventListener('click', hideRecoveryModal);
if (finalCancelBtn) finalCancelBtn.addEventListener('click', hideRecoveryModal);
if (recoveryBackBtn) {
    recoveryBackBtn.addEventListener('click', () => {
        if (currentStep === 3) {
            goToRecoveryStep(2);
        } else if (currentStep === 2) {
            goToRecoveryStep(1);
        }
    });
}

// 4. Implementación de ENTER para los pasos del modal
if (recoveryEmailInput) {
    recoveryEmailInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleEmailNext();
        }
    });
}
// El manejo del código se realiza con setupCodeInputHandler
if (confirmNewPasswordInput) {
    confirmNewPasswordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleChangePassword();
        }
    });
}


// ---------------- LÓGICA DE AUTH CON API (existente) ----------------

/**
 * Normaliza cualquier formato de rol (e.g., 'ROLE_VENDEDOR', 'vendedor') a Title Case (e.g., 'Vendedor').
 * Es CRÍTICA para la consistencia.
 */
function toTitleCaseRole(roleString) {
    if (!roleString) return 'Cliente';
// Default seguro
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
    
    displayMessage('register', '📧 El correo debe ser válido y tener una estructura correcta.');
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
            // Simular clic en el botón de login para cambiar a la vista de login
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
            
headers: 
{ 'Content-Type': 'application/json' },
            // CRÍTICO: Envía el rol esperado por el API (ROLE_UPPERCASE)
            body: JSON.stringify({ email, password, role: selectedRoleApi })
        });
if (response.ok) {
            const user = await response.json();
const registeredRole = user.role; // Ej: "Vendedor" o "ROLE_Vendedor" (viene del API)
            
            // --- VERIFICACIÓN DE ROL (ACTIVA EL MODAL) ---
            // Normalizamos el rol registrado a Title Case limpio (ej: Vendedor)
            const registeredRoleTitleCase = toTitleCaseRole(registeredRole);
// ************ INICIO MODIFICACIÓN PARA ROL ADMIN ************
            // Si el rol registrado es Admin, se omite la verificación de rol y se loguea directamente.
if (registeredRoleTitleCase === 'Admin') {
                displayMessage('login', `👋 ¡Bienvenido, ${user.nombre} (Administrador)! Redirigiendo...`, false);
loginForm.reset();
                const userEmail = user.email || '';
                // Redirigir con el rol 'Admin' (Title Case)
                // ¡CORRECCIÓN! Redirige a /admin en lugar de /inicio
                window.location.href = `/admin?role=${registeredRoleTitleCase}&email=${userEmail}`;
return; // Detener la ejecución
            }
            // ************ FIN MODIFICACIÓN PARA ROL ADMIN ************

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
            const userEmail = user.email ||
'';
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
    // Inicializar el modal de confirmación de rol
    injectModalHtml(); 
    // Configurar los campos de código tipo Telegram para el modal de recuperación
    setupCodeInputHandler();
    // Configurar el toggle de contraseña (Ojo) para todos los campos
    setupPasswordToggle(); 
    
    const isActive = container.classList.contains('active');
    
    toggleFormActiveState(loginFormContainer, !isActive);
    toggleFormActiveState(registerFormContainer, isActive);
    
    // 
    // Configurar tabindex inicial de los botones de toggle lateral
    container.querySelector('.register-btn').setAttribute('tabindex', isActive ? '-1' : '0');
    container.querySelector('.login-btn').setAttribute('tabindex', isActive ? '0' : '-1');
    
    document.addEventListener('keydown', handleFocusTrap);
    
    // Asegurar que el modal de recuperación inicia en el primer paso al cargar la página
    if (recoveryModal) goToRecoveryStep(1);
});

registerBtn.addEventListener('click', () => {
    clearForm(loginForm); 
    toggleFormActiveState(loginFormContainer, false);
    
    if(loginBtn) loginBtn.setAttribute('tabindex', '0'); 
    if(registerBtn) registerBtn.setAttribute('tabindex', '-1'); 
    
    if(container) container.classList.add('active');
    
    setTimeout(() => {
        toggleFormActiveState(registerFormContainer, true);
        const firstField = registerForm.querySelector('input[name="nombre"]');
        if (firstField) firstField.focus();
    }, ANIMATION_DURATION);
});
loginBtn.addEventListener('click', () => {
    clearForm(registerForm); 
    toggleFormActiveState(registerFormContainer, false);
    
    if(registerBtn) registerBtn.setAttribute('tabindex', '0'); 
    if(loginBtn) loginBtn.setAttribute('tabindex', '-1'); 
    
    if(container) container.classList.remove('active');
    
    setTimeout(() => {
        toggleFormActiveState(loginFormContainer, true);
        const firstField = loginForm.querySelector('input[name="email"]');
        if (firstField) firstField.focus();
    }, ANIMATION_DURATION);
});