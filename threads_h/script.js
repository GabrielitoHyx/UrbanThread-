document.addEventListener('DOMContentLoaded', () => {
    
    // 1. INICIALIZAR CARRITO
    actualizarContadorVisual();

    // 2. DETECTAR PÁGINA DE DETALLE
    const mainImage = document.getElementById('main-image');
    if (mainImage) {
        cargarDatosDelProducto();     // Leer URL
        initProductDetailLogic();     // Zoom y Tallas
        initReviewsSystem();          // NUEVO: Reseñas
        checkWishlistStatus();        // NUEVO: Ver si ya está en favoritos
    }

    // 3. DETECTAR PÁGINA DE SERVICIOS (LISTA DE DESEOS)
    const wishlistContainer = document.getElementById('wishlist-container');
    if (wishlistContainer) {
        renderWishlistPage();
    }

    // 4. HEADER: ABRIR CARRITO
    const headerCartIcon = document.querySelector('.fa-cart-shopping');
    if (headerCartIcon) {
        const linkCart = headerCartIcon.closest('a');
        if (linkCart) {
            linkCart.addEventListener('click', (e) => {
                e.preventDefault();
                toggleCart(true);
            });
        }
    }
});

/* =========================================
   LÓGICA: CARGAR DATOS DESDE URL
   ========================================= */
function cargarDatosDelProducto() {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    const price = params.get('price');
    const img = params.get('img');

    if (name) document.getElementById('product-title').innerText = name;
    if (price) document.getElementById('product-price').innerText = `$${price}`;
    if (img) {
        document.getElementById('main-image').src = img;
        const modalImg = document.getElementById('img-in-modal');
        if(modalImg) modalImg.src = img;
    }
}

/* =========================================
   LÓGICA DE PRODUCTO (ZOOM, TALLAS, CARRITO)
   ========================================= */
function initProductDetailLogic() {
    // A. SELECCIÓN DE TALLA
    const sizeBtns = document.querySelectorAll('.size-btn');
    let selectedSize = null;

    sizeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            sizeBtns.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            selectedSize = this.getAttribute('data-size');
        });
    });

    // B. ZOOM (MODAL)
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('img-in-modal');
    const mainImg = document.getElementById('main-image');
    
    if (mainImg && modal) {
        mainImg.addEventListener('click', () => {
            modal.style.display = "block";
            modalImg.src = mainImg.src;
        });
        document.querySelector('.close-modal')?.addEventListener('click', () => modal.style.display = "none");
        window.addEventListener('click', (e) => { if (e.target == modal) modal.style.display = "none"; });
    }

    // C. AÑADIR AL CARRITO
    document.getElementById('add-to-cart-btn')?.addEventListener('click', () => {
        if (!selectedSize) { alert("⚠️ Selecciona una talla primero."); return; }
        
        const item = {
            id: Date.now(),
            name: document.getElementById('product-title').innerText,
            price: parseFloat(document.getElementById('product-price').innerText.replace('$','')),
            size: selectedSize,
            image: document.getElementById('main-image').src
        };
        agregarItem(item);
    });

    // D. BOTÓN DE WISHLIST (CORAZÓN)
    document.getElementById('wishlist-btn')?.addEventListener('click', toggleWishlist);
}

/* =========================================
   NUEVO: SISTEMA DE RESEÑAS
   ========================================= */
function initReviewsSystem() {
    const stars = document.querySelectorAll('.star');
    const submitBtn = document.getElementById('submit-review');
    const reviewList = document.getElementById('reviews-list');
    const productName = document.getElementById('product-title').innerText; // Clave para guardar
    let currentRating = 0;

    // 1. Interacción con Estrellas
    stars.forEach(star => {
        star.addEventListener('click', () => {
            currentRating = star.getAttribute('data-value');
            updateStars(currentRating);
        });
    });

    function updateStars(rating) {
        stars.forEach(s => {
            s.classList.remove('active', 'fa-solid', 'fa-regular');
            if (s.getAttribute('data-value') <= rating) {
                s.classList.add('active', 'fa-solid'); // Estrella llena
            } else {
                s.classList.add('fa-regular'); // Estrella vacía
            }
        });
    }

    // 2. Cargar reseñas guardadas
    loadReviews();

    // 3. Publicar reseña
    submitBtn.addEventListener('click', () => {
        const text = document.getElementById('review-text').value;
        if (currentRating === 0) { alert("¡Califícanos con estrellas!"); return; }
        if (text.length < 5) { alert("Escribe un poco más..."); return; }

        const newReview = {
            product: productName,
            rating: currentRating,
            text: text,
            date: new Date().toLocaleDateString()
        };

        // Guardar en LocalStorage
        let reviews = JSON.parse(localStorage.getItem('urbanReviews')) || [];
        reviews.push(newReview);
        localStorage.setItem('urbanReviews', JSON.stringify(reviews));

        // Limpiar y recargar
        document.getElementById('review-text').value = '';
        currentRating = 0;
        updateStars(0);
        loadReviews();
    });

    function loadReviews() {
        let reviews = JSON.parse(localStorage.getItem('urbanReviews')) || [];
        // Filtrar solo las de ESTE producto
        const productReviews = reviews.filter(r => r.product === productName);
        
        reviewList.innerHTML = '';
        if (productReviews.length === 0) {
            reviewList.innerHTML = '<p style="color:#777;">Sé el primero en opinar sobre este drop.</p>';
            return;
        }

        productReviews.reverse().forEach(r => {
            // Generar estrellitas visuales
            let starsHTML = '';
            for(let i=0; i<5; i++) {
                starsHTML += i < r.rating ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
            }

            const html = `
                <div class="review-item">
                    <div class="review-header">
                        <span class="review-stars">${starsHTML}</span>
                        <small>${r.date}</small>
                    </div>
                    <p>${r.text}</p>
                </div>
            `;
            reviewList.innerHTML += html;
        });
    }
}

/* =========================================
   NUEVO: SISTEMA WISHLIST (LISTA DE DESEOS)
   ========================================= */
function toggleWishlist() {
    const productName = document.getElementById('product-title').innerText;
    const productPrice = document.getElementById('product-price').innerText.replace('$','');
    const productImg = document.getElementById('main-image').src;
    
    // Objeto a guardar
    const item = { name: productName, price: productPrice, img: productImg };

    let wishlist = JSON.parse(localStorage.getItem('urbanWishlist')) || [];
    
    // Verificar si ya existe (por nombre)
    const index = wishlist.findIndex(i => i.name === productName);
    
    const btn = document.getElementById('wishlist-btn');
    const icon = document.getElementById('wishlist-icon');

    if (index > -1) {
        // YA EXISTE -> BORRAR
        wishlist.splice(index, 1);
        btn.classList.remove('wishlist-btn-active');
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
        alert("Eliminado de Lista de Deseos");
    } else {
        // NO EXISTE -> AGREGAR
        wishlist.push(item);
        btn.classList.add('wishlist-btn-active');
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
        alert("❤️ Guardado en Lista de Deseos");
    }

    localStorage.setItem('urbanWishlist', JSON.stringify(wishlist));
}

function checkWishlistStatus() {
    const productName = document.getElementById('product-title').innerText;
    let wishlist = JSON.parse(localStorage.getItem('urbanWishlist')) || [];
    
    const exists = wishlist.some(i => i.name === productName);
    const btn = document.getElementById('wishlist-btn');
    const icon = document.getElementById('wishlist-icon');

    if (exists && btn) {
        btn.classList.add('wishlist-btn-active');
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
    }
}

function renderWishlistPage() {
    const container = document.getElementById('wishlist-container');
    let wishlist = JSON.parse(localStorage.getItem('urbanWishlist')) || [];

    if (wishlist.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Tu lista está vacía.</p>';
        return;
    }

    container.innerHTML = '';
    wishlist.forEach(item => {
        // Reconstruimos el enlace con los parámetros para que al dar click vuelva al producto correcto
        const link = `producto-detalle.html?name=${encodeURIComponent(item.name)}&price=${item.price}&img=${item.img}`;
        
        const html = `
            <article>
                <img src="${item.img}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p>$${item.price}</p>
                <a href="${link}" class="btn" style="width:100%; text-align:center;">COMPRAR AHORA</a>
                <button onclick="removeFromWishlist('${item.name}')" style="margin-top:5px; width:100%; background:transparent; border:none; color:red; cursor:pointer; text-decoration:underline;">Eliminar</button>
            </article>
        `;
        container.innerHTML += html;
    });
}

// Función auxiliar global para borrar desde la página de Servicios
window.removeFromWishlist = function(name) {
    let wishlist = JSON.parse(localStorage.getItem('urbanWishlist')) || [];
    wishlist = wishlist.filter(i => i.name !== name);
    localStorage.setItem('urbanWishlist', JSON.stringify(wishlist));
    renderWishlistPage(); // Repintar
};

/* =========================================
   GESTIÓN DEL CARRITO DE COMPRAS
   ========================================= */
function getCart() { return JSON.parse(localStorage.getItem('urbanCartItems')) || []; }
function saveCart(cart) { localStorage.setItem('urbanCartItems', JSON.stringify(cart)); actualizarContadorVisual(); }
function agregarItem(item) { const cart = getCart(); cart.push(item); saveCart(cart); renderCartSideBar(); toggleCart(true); }
function eliminarItem(id) { let cart = getCart(); cart = cart.filter(item => item.id !== id); saveCart(cart); renderCartSideBar(); }

function actualizarContadorVisual() {
    const count = getCart().length;
    document.querySelectorAll('.cart-count').forEach(b => {
        b.textContent = count;
        b.style.display = count === 0 ? 'none' : 'flex';
    });
}

function toggleCart(open) {
    const sb = document.getElementById('cart-sidebar');
    const ov = document.getElementById('cart-overlay');
    if(!sb) return;
    if(open) { sb.classList.add('open'); ov.classList.add('active'); renderCartSideBar(); }
    else { sb.classList.remove('open'); ov.classList.remove('active'); }
}

document.addEventListener('click', (e) => {
    if (e.target.id === 'close-cart' || e.target.classList.contains('close-cart-btn') || e.target.id === 'cart-overlay') toggleCart(false);
});

function renderCartSideBar() {
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total');
    if (!container) return;
    const cart = getCart();
    container.innerHTML = '';
    let total = 0;
    if (cart.length === 0) container.innerHTML = '<p style="text-align:center; margin-top:20px;">Tu carrito está vacío.</p>';
    else {
        cart.forEach(item => {
            total += item.price;
            container.innerHTML += `
                <div class="cart-item">
                    <div style="display:flex; gap:10px;">
                        <img src="${item.image}" style="width:50px; height:50px; object-fit:cover; border:1px solid #000;">
                        <div><strong>${item.name}</strong><br><small>${item.size}</small></div>
                    </div>
                    <div>$${item.price.toFixed(2)} <span onclick="eliminarItem(${item.id})" style="color:red;cursor:pointer;margin-left:5px;">&times;</span></div>
                </div>`;
        });
    }
    if(totalEl) totalEl.innerText = '$' + total.toFixed(2);
}
/* =========================================
   LÓGICA DE REGISTRO (NUEVO)
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    
    const registerForm = document.getElementById('form-register');

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Evitar recarga
            procesarRegistro();
        });
    }
});

function procesarRegistro() {
    // 1. Obtener valores
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-password').value.trim();
    const confirm = document.getElementById('reg-confirm').value.trim();

    // 2. Elementos de error
    const errName = document.getElementById('error-reg-name');
    const errEmail = document.getElementById('error-reg-email');
    const errPass = document.getElementById('error-reg-pass');

    // Limpiar errores previos
    errName.textContent = '';
    errEmail.textContent = '';
    errPass.textContent = '';

    let isValid = true;

    // 3. Validaciones
    if (name.length < 3) {
        errName.textContent = "El nombre es muy corto, bro.";
        isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errEmail.textContent = "Ingresa un email válido.";
        isValid = false;
    }

    if (pass.length < 6) {
        errPass.textContent = "La contraseña debe tener al menos 6 caracteres.";
        isValid = false;
    } else if (pass !== confirm) {
        errPass.textContent = "Las contraseñas no coinciden.";
        isValid = false;
    }

    // 4. Si todo es válido -> REGISTRAR
    if (isValid) {
        // Simular guardado en base de datos (LocalStorage)
        // Guardamos el usuario activo en la sesión
        localStorage.setItem('urbanUserSession', name); // Guardamos el nombre en lugar del email para saludarlo mejor

        alert(`¡Bienvenido al barrio, ${name}! Tu cuenta ha sido creada.`);
        
        // Redirigir al inicio o recargar para ver el cambio en el header
        window.location.href = "index.html";
    }
}
function checkSession() {
    // Buscamos si existe el usuario en memoria
    const usuario = localStorage.getItem('urbanUserSession');
    
    // Icono del usuario en el header
    const userIconLink = document.querySelector('.user-actions a[href*="Micuenta"]');
    
    if (usuario && userIconLink) {
        // Si hay usuario, cambiamos el ícono a uno verde o con check
        // Y cambiamos el link para que sea un "Logout" si quiere salir
        userIconLink.innerHTML = '<i class="fa-solid fa-user-check" style="color: #2ecc71;"></i>';
        userIconLink.title = `Hola, ${usuario} (Click para salir)`;
        
        // Al hacer click, cerrar sesión
        userIconLink.href = "#"; // Evitar ir a servicios.html
        userIconLink.onclick = (e) => {
            e.preventDefault();
            if(confirm(`¿Cerrar sesión de ${usuario}?`)) {
                logout();
            }
        };
    }
}

function logout() {
    localStorage.removeItem('urbanUserSession');
    alert("Sesión cerrada. Nos vemos en las calles.");
    window.location.reload();
}