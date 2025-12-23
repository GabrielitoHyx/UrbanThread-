/* ==========================================================================
   URBAN THREADS - LÓGICA FRONTEND MAESTRA
   Incluye: Carrito, Autenticacion, Admin, Wishlist, Reseñas, Zoom y Datos Dinámicos
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. SISTEMA GLOBAL (EJECUTAR EN TODAS LAS PÁGINAS) ---
    actualizarContadorVisual();
    checkSession();     // Verificar si hay usuario logueado
    initGlobalCart();   // Eventos del carrito (abrir/cerrar)
    injectDynamicProducts(); // Inyectar productos creados por el Admin en la tienda

    // --- 2. LÓGICA DE PÁGINA DE DETALLE DE PRODUCTO ---
    const mainImage = document.getElementById('main-image');
    if (mainImage) {
        cargarDatosDelProducto();     // Leer URL (?name=...)
        initProductDetailLogic();     // Zoom, Tallas, Añadir al Carrito
        initReviewsSystem();          // Sistema de Reseñas y Estrellas
        checkWishlistStatus();        // Verificar si ya está en favoritos
    }

    // --- 3. LÓGICA DE PÁGINA DE SERVICIOS (LOGIN, REGISTRO, WISHLIST) ---
    const wishlistContainer = document.getElementById('wishlist-container');
    if (wishlistContainer) {
        renderWishlistPage();
    }
    
    const loginForm = document.getElementById('form-login');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            validarLogin();
        });
    }

    const registerForm = document.getElementById('form-register');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            procesarRegistro();
        });
    }

    // --- 4. LÓGICA DE PANEL ADMINISTRATIVO ---
    const adminTable = document.getElementById('admin-products-list');
    if (adminTable) {
        renderAdminProducts();
        renderAdminOrders();
    }
});

/* =========================================
   A. GESTIÓN DE PRODUCTO (URL, ZOOM, TALLAS)
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
        // Actualizar también la imagen del modal
        const modalImg = document.getElementById('img-in-modal');
        if(modalImg) modalImg.src = img;
    }
}

function initProductDetailLogic() {
    // 1. Selección de Talla
    const sizeBtns = document.querySelectorAll('.size-btn');
    let selectedSize = null;

    sizeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            sizeBtns.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            selectedSize = this.getAttribute('data-size');
        });
    });

    // 2. Zoom de Imagen 
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('img-in-modal');
    const mainImg = document.getElementById('main-image');
    const closeModal = document.querySelector('.close-modal');

    if (mainImg && modal) {
        mainImg.addEventListener('click', () => {
            modal.style.display = "block";
            modalImg.src = mainImg.src;
        });
        
        if(closeModal) closeModal.addEventListener('click', () => modal.style.display = "none");
        
        window.addEventListener('click', (e) => {
            if (e.target == modal) modal.style.display = "none";
        });
    }

    // 3. Añadir al Carrito
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            if (!selectedSize) {
                alert(" POR FAVOR SELECCIONA UNA TALLA.");
                return;
            }

            const item = {
                id: Date.now(),
                name: document.getElementById('product-title').innerText,
                price: parseFloat(document.getElementById('product-price').innerText.replace('$','')),
                size: selectedSize,
                image: document.getElementById('main-image').src
            };
            agregarItemAlCarrito(item);
        });
    }

    // 4. Botón de Wishlist (Corazón)
    const wishBtn = document.getElementById('wishlist-btn');
    if (wishBtn) {
        wishBtn.addEventListener('click', toggleWishlist);
    }
}

/* =========================================
   B. SISTEMA DE CARRITO 
   ========================================= */

function initGlobalCart() {
    // Detectar clic en el ícono del header
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

    // Eventos para cerrar el carrito
    document.addEventListener('click', (e) => {
        if (e.target.id === 'close-cart' || e.target.classList.contains('close-cart-btn') || e.target.id === 'cart-overlay') {
            toggleCart(false);
        }
    });
}

function getCart() { return JSON.parse(localStorage.getItem('urbanCartItems')) || []; }

function saveCart(cart) { 
    localStorage.setItem('urbanCartItems', JSON.stringify(cart)); 
    actualizarContadorVisual(); 
}

function agregarItemAlCarrito(item) { 
    const cart = getCart(); 
    cart.push(item); 
    saveCart(cart); 
    renderCartSideBar(); 
    toggleCart(true); 
}

function eliminarItemDelCarrito(id) { 
    let cart = getCart(); 
    cart = cart.filter(item => item.id !== id); 
    saveCart(cart); 
    renderCartSideBar(); 
}

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
    if(!sb) return; // Si no existe el HTML en esta página
    
    if(open) { 
        sb.classList.add('open'); 
        ov.classList.add('active'); 
        renderCartSideBar(); 
    } else { 
        sb.classList.remove('open'); 
        ov.classList.remove('active'); 
    }
}

function renderCartSideBar() {
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total');
    if (!container) return;

    const cart = getCart();
    container.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; margin-top:20px;">Tu carrito está vacío.</p>';
    } else {
        cart.forEach(item => {
            total += item.price;
            container.innerHTML += `
                <div class="cart-item">
                    <div style="display:flex; gap:10px;">
                        <img src="${item.image}" style="width:50px; height:50px; object-fit:cover; border:1px solid #000;">
                        <div>
                            <strong>${item.name}</strong><br>
                            <small>Talla: ${item.size}</small>
                        </div>
                    </div>
                    <div>
                        <span>$${item.price.toFixed(2)}</span>
                        <span onclick="eliminarItemDelCarrito(${item.id})" style="color:red; cursor:pointer; margin-left:10px; font-weight:bold;">&times;</span>
                    </div>
                </div>`;
        });
    }
    if(totalEl) totalEl.innerText = '$' + total.toFixed(2);
}

/* =========================================
   C. SISTEMA DE RESEÑAS
   ========================================= */

function initReviewsSystem() {
    const stars = document.querySelectorAll('.star');
    const submitBtn = document.getElementById('submit-review');
    const reviewList = document.getElementById('reviews-list');
    const productName = document.getElementById('product-title').innerText;
    let currentRating = 0;

    // Click en estrellas
    stars.forEach(star => {
        star.addEventListener('click', () => {
            currentRating = star.getAttribute('data-value');
            updateStarsVisual(currentRating);
        });
    });

    function updateStarsVisual(rating) {
        stars.forEach(s => {
            s.classList.remove('active', 'fa-solid', 'fa-regular');
            if (s.getAttribute('data-value') <= rating) {
                s.classList.add('active', 'fa-solid'); 
            } else {
                s.classList.add('fa-regular'); 
            }
        });
    }

    loadReviews(); // Cargar al inicio

    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const text = document.getElementById('review-text').value;
            if (currentRating === 0) { alert("¡Califícanos con estrellas!"); return; }
            if (text.length < 5) { alert("Escribe un poco más..."); return; }

            const newReview = {
                product: productName,
                rating: currentRating,
                text: text,
                user: localStorage.getItem('urbanUserSession') || "Anónimo",
                date: new Date().toLocaleDateString()
            };

            let reviews = JSON.parse(localStorage.getItem('urbanReviews')) || [];
            reviews.push(newReview);
            localStorage.setItem('urbanReviews', JSON.stringify(reviews));

            document.getElementById('review-text').value = '';
            currentRating = 0;
            updateStarsVisual(0);
            loadReviews();
        });
    }

    function loadReviews() {
        let reviews = JSON.parse(localStorage.getItem('urbanReviews')) || [];
        const productReviews = reviews.filter(r => r.product === productName);
        
        if (!reviewList) return;
        reviewList.innerHTML = '';
        
        if (productReviews.length === 0) {
            reviewList.innerHTML = '<p style="color:#777;">Sé el primero en opinar sobre este drop.</p>';
            return;
        }

        productReviews.reverse().forEach(r => {
            let starsHTML = '';
            for(let i=0; i<5; i++) {
                starsHTML += i < r.rating ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
            }
            reviewList.innerHTML += `
                <div class="review-item">
                    <div class="review-header">
                        <span class="review-stars">${starsHTML}</span>
                        <small>${r.date} - ${r.user}</small>
                    </div>
                    <p>${r.text}</p>
                </div>
            `;
        });
    }
}

/* =========================================
   D. SISTEMA DE WISHLIST 
   ========================================= */

function toggleWishlist() {
    const productName = document.getElementById('product-title').innerText;
    const productPrice = document.getElementById('product-price').innerText.replace('$','');
    const productImg = document.getElementById('main-image').src;
    
    const item = { name: productName, price: productPrice, img: productImg };
    let wishlist = JSON.parse(localStorage.getItem('urbanWishlist')) || [];
    const index = wishlist.findIndex(i => i.name === productName);
    
    const btn = document.getElementById('wishlist-btn');
    const icon = document.getElementById('wishlist-icon');

    if (index > -1) {
        wishlist.splice(index, 1); // Borrar
        if(btn) btn.classList.remove('wishlist-btn-active');
        if(icon) { icon.classList.remove('fa-solid'); icon.classList.add('fa-regular'); }
        alert("Eliminado de Lista de Deseos");
    } else {
        wishlist.push(item); // Agregar
        if(btn) btn.classList.add('wishlist-btn-active');
        if(icon) { icon.classList.remove('fa-regular'); icon.classList.add('fa-solid'); }
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

    if (!container) return;

    if (wishlist.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Tu lista está vacía.</p>';
        return;
    }

    container.innerHTML = '';
    wishlist.forEach(item => {
        const link = `producto-detalle.html?name=${encodeURIComponent(item.name)}&price=${item.price}&img=${item.img}`;
        container.innerHTML += `
            <article>
                <img src="${item.img}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p>$${item.price}</p>
                <a href="${link}" class="btn" style="width:100%; text-align:center;">COMPRAR AHORA</a>
                <button onclick="removeFromWishlist('${item.name}')" style="margin-top:5px; width:100%; background:transparent; border:none; color:red; cursor:pointer; text-decoration:underline;">Eliminar</button>
            </article>
        `;
    });
}

// Global para poder llamarla desde el HTML
window.removeFromWishlist = function(name) {
    let wishlist = JSON.parse(localStorage.getItem('urbanWishlist')) || [];
    wishlist = wishlist.filter(i => i.name !== name);
    localStorage.setItem('urbanWishlist', JSON.stringify(wishlist));
    renderWishlistPage();
};

/* =========================================
   E. AUTENTICACIÓN (LOGIN, REGISTRO, SESIÓN)
   ========================================= */

function validarLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorEmail = document.getElementById('error-email');
    const errorPass = document.getElementById('error-password');
    
    // Limpiar errores
    if(errorEmail) errorEmail.innerText = "";
    if(errorPass) errorPass.innerText = "";

    // --- ACCESO ADMINISTRADOR ---
    if (email === "admin@urban.com" && password === "admin123") {
        alert("🔒 Accediendo a Panel de Control...");
        localStorage.setItem('urbanUserSession', 'Administrador');
        localStorage.setItem('urbanUserRole', 'admin');
        window.location.href = "admin.html";
        return;
    }

    // --- ACCESO CLIENTE ---
    // Validación 
    if (!email || !email.includes('@')) {
        if(errorEmail) errorEmail.textContent = "Email inválido.";
        return;
    }
    if (password.length < 6) {
        if(errorPass) errorPass.textContent = "Contraseña muy corta.";
        return;
    }

    // Login Exitoso
    alert("¡Bienvenido de nuevo!");
    localStorage.setItem('urbanUserSession', email.split('@')[0]); // Usar parte del mail como nombre
    localStorage.setItem('urbanUserRole', 'client');
    window.location.href = "index.html";
}

function procesarRegistro() {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-password').value.trim();
    const confirm = document.getElementById('reg-confirm').value.trim();
    const errPass = document.getElementById('error-reg-pass');

    if(errPass) errPass.innerText = "";

    if (pass.length < 6) {
        if(errPass) errPass.textContent = "Mínimo 6 caracteres.";
        return;
    }
    if (pass !== confirm) {
        if(errPass) errPass.textContent = "Las contraseñas no coinciden.";
        return;
    }

    // Registro exitoso
    localStorage.setItem('urbanUserSession', name);
    localStorage.setItem('urbanUserRole', 'client');
    alert(`¡Cuenta creada! Bienvenido al barrio, ${name}.`);
    window.location.href = "index.html";
}

function checkSession() {
    const usuario = localStorage.getItem('urbanUserSession');
    const userIconLink = document.querySelector('.user-actions a[href*="Micuenta"]');
    
    if (usuario && userIconLink) {
        userIconLink.innerHTML = '<i class="fa-solid fa-user-check" style="color: #2ecc71;"></i>';
        userIconLink.title = `Hola, ${usuario} (Click para salir)`;
        
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
    localStorage.removeItem('urbanUserRole');
    window.location.href = "index.html";
}

/* =========================================
   F. PANEL ADMINISTRATIVO 
   ========================================= */

// Agregar Producto desde Admin
window.adminAddProduct = function() {
    const name = document.getElementById('new-prod-name').value;
    const price = document.getElementById('new-prod-price').value;
    const cat = document.getElementById('new-prod-category').value;
    const img = document.getElementById('new-prod-img').value || 'https://placehold.co/300x300';

    if(!name || !price) { 
        alert("Completa los campos requeridos"); return; 

    }

    const newProd = {
        id: Date.now(),
        name: name,
        price: parseFloat(price),
        category: cat,
        img: img,
        stock: 50
    };

    let products = JSON.parse(localStorage.getItem('urbanProductsDB')) || [];
    products.push(newProd);
    localStorage.setItem('urbanProductsDB', JSON.stringify(products));
    
    alert("✅ Producto agregado");
    renderAdminProducts();
    
    document.getElementById('new-prod-name').value = '';
    document.getElementById('new-prod-price').value = '';
};

// Renderizar Tabla de Productos Admin
window.renderAdminProducts = function() {
    const tableBody = document.getElementById('admin-products-list');
    if(!tableBody) return;

    let products = JSON.parse(localStorage.getItem('urbanProductsDB')) || [];
    tableBody.innerHTML = '';

    products.forEach(p => {
        tableBody.innerHTML += `
            <tr>
                <td>${p.id}</td>
                <td><img src="${p.img}" width="50"></td>
                <td>${p.name}</td>
                <td>$${p.price}</td>
                <td>${p.stock}</td>
                <td><button style="color:red; cursor:pointer;" onclick="deleteProduct(${p.id})">Eliminar</button></td>
            </tr>
        `;
    });
};

window.deleteProduct = function(id) {
    if(!confirm("¿Borrar producto?")) return;
    let products = JSON.parse(localStorage.getItem('urbanProductsDB')) || [];
    products = products.filter(p => p.id !== id);
    localStorage.setItem('urbanProductsDB', JSON.stringify(products));
    renderAdminProducts();
};

// Renderizar Tabla de Pedidos Admin
window.renderAdminOrders = function() {
    const tableBody = document.getElementById('admin-orders-list');
    const totalDisplay = document.getElementById('total-sales-amount');
    const pendingDisplay = document.getElementById('pending-orders-count');
    
    if(!tableBody) return;

    let orders = JSON.parse(localStorage.getItem('urbanOrdersDB')) || [
        {id: 101, user: "Diego Trejo", total: 150.00, status: "Enviado"},
        {id: 102, user: "Joshua Rosas", total: 85.00, status: "Procesando"}
    ];

    tableBody.innerHTML = '';
    let totalSales = 0;
    let pendingCount = 0;

    orders.forEach(order => {
        totalSales += order.total;
        if(order.status === "Procesando") pendingCount++;

        tableBody.innerHTML += `
            <tr>
                <td>#${order.id}</td>
                <td>${order.user}</td>
                <td>$${order.total}</td>
                <td style="font-weight:bold; color:${order.status === 'Enviado' ? 'green' : 'orange'}">${order.status}</td>
                <td>
                    <select onchange="updateOrderStatus(${order.id}, this.value)">
                        <option value="">Cambiar...</option>
                        <option value="Procesando">Procesando</option>
                        <option value="Enviado">Enviado</option>
                        <option value="Entregado">Entregado</option>
                    </select>
                </td>
            </tr>
        `;
    });

    if(totalDisplay) totalDisplay.innerText = `$${totalSales.toFixed(2)}`;
    if(pendingDisplay) pendingDisplay.innerText = pendingCount;
};

window.updateOrderStatus = function(id, newStatus) {
    if(!newStatus) return;
    let orders = JSON.parse(localStorage.getItem('urbanOrdersDB')) || [
        {id: 101, user: "Diego Trejo", total: 150.00, status: "Enviado"},
        {id: 102, user: "Joshua Rosas", total: 85.00, status: "Procesando"}
    ];
    
    const index = orders.findIndex(o => o.id === id);
    if(index > -1) {
        orders[index].status = newStatus;
        localStorage.setItem('urbanOrdersDB', JSON.stringify(orders));
        renderAdminOrders();
        alert(`Pedido #${id} actualizado.`);
    }
};

/* =========================================
   G. INYECCIÓN DINÁMICA DE PRODUCTOS (EN TIENDA)
   ========================================= */

function injectDynamicProducts() {
    const products = JSON.parse(localStorage.getItem('urbanProductsDB')) || [];
    
    // Inyectar en Hombres
    const containerMen = document.getElementById('tenis'); // Puedes cambiar el ID destino
    if (containerMen && window.location.href.includes('hombres.html')) {
        products.filter(p => p.category === 'hombre').forEach(p => {
            containerMen.appendChild(createProductCard(p));
        });
    }

    // Inyectar en Mujeres
    const containerWomen = document.getElementById('calzado');
    if (containerWomen && window.location.href.includes('Mujer.html')) {
        products.filter(p => p.category === 'mujer').forEach(p => {
            containerWomen.appendChild(createProductCard(p));
        });
    }
}

function createProductCard(product) {
    const article = document.createElement('article');
    const link = `producto-detalle.html?name=${encodeURIComponent(product.name)}&price=${product.price}&img=${product.img}`;
    
    article.innerHTML = `
        <img src="${product.img}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>Precio: $${product.price}</p>
        <a href="${link}" class="btn">Ver Drop</a>
    `;
    return article;
}