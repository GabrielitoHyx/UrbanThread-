// script.js - Lógica Frontend para Urban Threads

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cuando la página carga, actualizamos el número del carrito
    actualizarContadorVisual();

    // 2. Buscamos el botón de añadir al carrito (si existe en esta página)
    const botonComprar = document.getElementById('btn-agregar-carrito');
    
    if (botonComprar) {
        botonComprar.addEventListener('click', (e) => {
            e.preventDefault(); // Evita que la página salte arriba
            agregarAlCarrito();
        });
    }
});

function actualizarContadorVisual() {
    // Buscamos si hay algo guardado en la memoria del navegador
    let cantidad = localStorage.getItem('urbanCartCount');
    
    // Si no hay nada, es 0
    if (!cantidad) {
        cantidad = 0;
    }

    // Buscamos la bolita roja en el HTML y le ponemos el número
    const contadorElemento = document.querySelector('.cart-count');
    if (contadorElemento) {
        contadorElemento.textContent = cantidad;
        
        // Opcional: Ocultar si es 0
        if (cantidad == 0) {
            contadorElemento.style.display = 'none';
        } else {
            contadorElemento.style.display = 'flex';
        }
    }
}

function agregarAlCarrito() {
    // 1. Obtener cantidad actual
    let cantidadActual = parseInt(localStorage.getItem('urbanCartCount') || 0);
    
    // 2. Sumar 1
    let nuevaCantidad = cantidadActual + 1;
    
    // 3. Guardar en memoria
    localStorage.setItem('urbanCartCount', nuevaCantidad);
    
    // 4. Actualizar la vista
    actualizarContadorVisual();
    
    // 5. Feedback al usuario (puedes cambiar esto por algo más bonito luego)
    alert("¡Producto añadido al carrito! 🔥");
}

/* --- Función extra para limpiar el carrito (útil para pruebas) --- */
function vaciarCarrito() {
    localStorage.setItem('urbanCartCount', 0);
    actualizarContadorVisual();
    alert("Carrito vaciado.");
}
/* --- VALIDACIÓN DE LOGIN Y SESIÓN --- */

// Esperamos a que el documento cargue (si ya tienes un DOMContentLoaded arriba, puedes meter esto dentro)
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. VERIFICAR SI YA HAY SESIÓN INICIADA
    checkSession();

    // 2. CONTROL DEL FORMULARIO DE LOGIN
    const loginForm = document.getElementById('form-login');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Detiene el recargo de la página
            validarLogin();
        });
    }
});

function validarLogin() {
    // Obtenemos los valores
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    // Elementos para mostrar errores
    const errorEmail = document.getElementById('error-email');
    const errorPass = document.getElementById('error-password');
    
    // Limpiamos errores previos
    errorEmail.textContent = '';
    errorPass.textContent = '';
    let esValido = true;

    // --- REGLA 1: Validar Email (Formato simple) ---
    // Esta expresión regular verifica que tenga texto + @ + texto + . + texto
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
        errorEmail.textContent = "El email es obligatorio, bro.";
        esValido = false;
    } else if (!emailRegex.test(email)) {
        errorEmail.textContent = "Ese correo no se ve real.";
        esValido = false;
    }

    // --- REGLA 2: Validar Contraseña ---
    if (password.length < 6) {
        errorPass.textContent = "La contraseña es muy corta (mín. 6).";
        esValido = false;
    }

    // --- SI TODO ESTÁ BIEN ---
    if (esValido) {
        // Simulación de Backend:
        alert("¡Login Exitoso! Bienvenido a Urban Threads.");
        
        // Guardamos la sesión en el navegador
        localStorage.setItem('urbanUserSession', email);
        
        // Redirigimos al Home o actualizamos la vista
        window.location.href = "index.html"; 
    }
}

function checkSession() {
    // Buscamos si existe el usuario en memoria
    const usuario = localStorage.getItem('urbanUserSession');
    
    if (usuario) {
        console.log("Usuario logueado:", usuario);
        
        // Buscamos el ícono de usuario en el header para cambiarlo
        // Nota: Asegúrate de que tu ícono de usuario tenga una clase o forma de identificarlo
        // Aquí asumimos que es el primer enlace dentro de .user-actions
        const userIconLink = document.querySelector('.user-actions a[href*="Micuenta"]');
        
        if (userIconLink) {
            // Cambiamos el ícono por un saludo o un check verde
            userIconLink.innerHTML = '<i class="fa-solid fa-user-check" style="color: green;"></i>';
            userIconLink.title = "Hola, " + usuario;
        }
    }
}

/* --- FUNCIÓN EXTRA: CERRAR SESIÓN (Logout) --- */
// Puedes llamar a esta función desde la consola o crear un botón para probarla
function logout() {
    localStorage.removeItem('urbanUserSession');
    alert("Sesión cerrada.");
    window.location.reload();
}