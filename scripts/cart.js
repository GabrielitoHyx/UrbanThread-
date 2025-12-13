// Simple cart using localStorage
function getCart(){
  try{return JSON.parse(localStorage.getItem('ut_cart')||'[]')}catch(e){return []}
}
function saveCart(cart){localStorage.setItem('ut_cart', JSON.stringify(cart))}
function addToCart(item){
  const cart = getCart() || [];
  item.qty = Math.max(1, parseInt(item.qty||1, 10) || 1);
  item.price = isNaN(parseFloat(item.price)) ? 0 : parseFloat(item.price);
  // If same product + size exists, increment qty instead of duplicating
  const existing = cart.find(i => i.id === item.id && i.size === item.size);
  if(existing){
    existing.qty = (parseInt(existing.qty,10)||0) + item.qty;
  } else {
    cart.push(item);
  }
  saveCart(cart);
  showToast('Añadido al carrito: '+item.name+' ('+item.size+' x'+item.qty+')');
  updateCartCount();
  renderMiniCart();
}
function showToast(msg){
  let t=document.getElementById('ut-toast');
  if(!t){t=document.createElement('div');t.id='ut-toast';document.body.appendChild(t);Object.assign(t.style,{position:'fixed',right:'20px',bottom:'20px',background:'#071018',color:'#fff',padding:'12px 16px',borderRadius:'8px',boxShadow:'0 8px 24px rgba(0,0,0,.3)',zIndex:9999})}
  t.textContent=msg; t.style.opacity=1; clearTimeout(t._hide); t._hide=setTimeout(()=>{t.style.opacity=0;},2500);
}

// Favorites API
function getFavs(){ try{return JSON.parse(localStorage.getItem('ut_favs')||'[]')}catch(e){return []} }
function saveFavs(f){ localStorage.setItem('ut_favs', JSON.stringify(f||[])); }
function isFav(id){ return getFavs().some(i=>i.id===id); }
function toggleFav(item){ const f=getFavs(); const idx=f.findIndex(i=>i.id===item.id); if(idx>=0){ f.splice(idx,1); saveFavs(f); showToast('Eliminado de favoritos'); } else { f.push(item); saveFavs(f); showToast('Añadido a favoritos'); }
  updateFavUI(item.id);
}
function getFavsCount(){ return getFavs().length }

// Utility to handle forms on product pages
document.addEventListener('submit', function(e){
  if(e.target && e.target.classList && e.target.classList.contains('product-form')){
    e.preventDefault();
    const form=new FormData(e.target);
    const item={
      id:form.get('id'),
      name:form.get('name'),
      price:parseFloat(form.get('price')),
      size:form.get('size'),
      qty:parseInt(form.get('qty')||1,10),
      image:form.get('image')
    };
    addToCart(item);
    // open mini-cart for instant feedback
    toggleMiniCart(true);
  }
});

// Mini-cart render
function renderMiniCart(){ let mc=document.getElementById('ut-mini-cart'); if(!mc){ mc=document.createElement('div'); mc.id='ut-mini-cart'; mc.innerHTML = '<div class="mc-header">Carrito <span id="mc-count"></span></div><div class="mc-list"></div><div class="mc-footer"><a href="../cart.html" class="btn">Ver Carrito</a><button id="mc-clear" class="btn">Vaciar</button></div>'; document.body.appendChild(mc); document.getElementById('mc-clear').addEventListener('click', ()=>{ clearCart(); renderMiniCart(); }); }
  const list = mc.querySelector('.mc-list'); const cart = getCart(); if(!cart.length){ list.innerHTML = '<p style="padding:8px">Tu carrito está vacío.</p>'; document.getElementById('mc-count').textContent=''; return }
  let html=''; let total=0; cart.forEach((it,idx)=>{ const line=(parseFloat(it.price)||0)*(parseInt(it.qty,10)||0); total+=line; html += `<div style="display:flex;gap:10px;align-items:center;padding:8px 6px;border-bottom:1px solid #f1f1f1"><img src="${it.image}" style="width:56px;height:56px;object-fit:cover;border-radius:8px"><div style="flex:1"><strong>${it.name}</strong><div style="color:#6b7280">${it.size} • $${it.price} x ${it.qty}</div></div><div><button data-idx="${idx}" class="ut-remove" style="background:#eee;border:0;padding:.4rem .6rem;border-radius:8px">Eliminar</button></div></div>`; });
  html += `<div style="padding:8px"><strong>Total: $${total.toFixed(2)}</strong></div>`; list.innerHTML = html; document.querySelectorAll('#ut-mini-cart .ut-remove').forEach(b=>b.addEventListener('click', ()=>{ removeFromCart(parseInt(b.dataset.idx,10)); renderMiniCart(); updateCartCount(); })); document.getElementById('mc-count').textContent = ' ('+cart.length+')'; }

function toggleMiniCart(open){ const mc=document.getElementById('ut-mini-cart'); if(!mc){ renderMiniCart(); }
  if(typeof open === 'boolean'){ if(open) mc.classList.add('open'); else mc.classList.remove('open'); } else { mc.classList.toggle('open'); }
}

function updateCartCount(){ const c = getCart(); const badge = document.querySelector('.cart-badge'); if(badge){ badge.textContent = c.length } }

function updateFavUI(id){ // update any visible favorite buttons
  if(typeof id === 'undefined'){
    const favs = getFavs().map(f=>f.id);
    document.querySelectorAll('[data-fav-id]').forEach(el=>{ if(favs.includes(el.dataset.favId)){ el.classList.add('active'); el.setAttribute('aria-pressed','true'); el.setAttribute('title','Quitar de favoritos'); } else { el.classList.remove('active'); el.setAttribute('aria-pressed','false'); el.setAttribute('title','Añadir a favoritos'); } });
  } else {
    document.querySelectorAll('[data-fav-id="'+id+'"]').forEach(el=>{ if(isFav(id)){ el.classList.add('active'); el.setAttribute('aria-pressed','true'); el.setAttribute('title','Quitar de favoritos'); } else { el.classList.remove('active'); el.setAttribute('aria-pressed','false'); el.setAttribute('title','Añadir a favoritos'); } });
  }
  const fb = document.querySelector('.fav-count'); if(fb) fb.textContent = getFavsCount(); }

// init UI elements
window.addEventListener('load', ()=>{ renderMiniCart(); updateCartCount(); updateFavUI(); // bind click handlers for fav toggles
  document.body.addEventListener('click', (e)=>{
    const t = e.target.closest && e.target.closest('.ut-fav'); if(t){ const id = t.dataset.favId; const item = { id: id, name: t.dataset.favName || t.dataset.name || id, image: t.dataset.favImage || t.dataset.image || '' }; toggleFav(item); e.preventDefault(); }
    const openCart = e.target.closest && e.target.closest('.btn-open-cart'); if(openCart){ const id = openCart.dataset.addId; if(id){ const item = { id: id, name: openCart.dataset.addName||id, price: parseFloat(openCart.dataset.addPrice||0), size: openCart.dataset.addSize||'M', qty: 1, image: openCart.dataset.addImage||'' }; addToCart(item); renderMiniCart(); updateCartCount(); toggleMiniCart(true); } else { toggleMiniCart(); } e.preventDefault(); }
  });
});

// expose favorites API
window.utFavs = { getFavs, saveFavs, isFav, toggleFav, getFavsCount };



// Cart UI helpers for a simple cart view page
function renderCart(containerSelector){
  const container = document.querySelector(containerSelector);
  if(!container) return;
  const cart = getCart();
  if(!cart.length){ container.innerHTML = '<p>Tu carrito está vacío.</p>'; return }
  let html = '<ul style="list-style:none;padding:0;margin:0">';
  let total = 0;
  cart.forEach((it, idx)=>{
    const line = (parseFloat(it.price)||0) * (parseInt(it.qty,10)||0);
    total += line;
    html += `<li style="display:flex;gap:12px;align-items:center;padding:.6rem 0;border-bottom:1px solid rgba(0,0,0,0.06)"><img src="${it.image}" alt="" style="width:72px;height:72px;object-fit:cover;border-radius:8px"><div style="flex:1"><strong>${it.name}</strong><div style="color:#6b7280">Talla: ${it.size} • $${it.price} x ${it.qty}</div></div><div style="text-align:right"><button data-idx="${idx}" class="ut-remove" style="background:#eee;border:0;padding:.4rem .6rem;border-radius:8px">Eliminar</button></div></li>`;
  });
  html += '</ul>';
  html += `<div style="margin-top:1rem"><strong>Total: $${total.toFixed(2)}</strong></div>`;
  html += `<div style="margin-top:.8rem;display:flex;gap:.6rem"><button id="ut-clear" class="btn">Vaciar carrito</button><a id="ut-checkout" class="btn btn-primary" href="#">Checkout</a></div>`;
  container.innerHTML = html;
  container.querySelectorAll('.ut-remove').forEach(b=>b.addEventListener('click', ()=>{ removeFromCart(parseInt(b.dataset.idx,10)); renderCart(containerSelector); }));
  const clearBtn = container.querySelector('#ut-clear'); if(clearBtn) clearBtn.addEventListener('click', ()=>{ clearCart(); renderCart(containerSelector); showToast('Carrito vaciado'); });
  const checkout = container.querySelector('#ut-checkout'); if(checkout){
    const subject = encodeURIComponent('Pedido Urban Threads');
    const body = encodeURIComponent(cart.map(i=>`${i.name} (${i.size}) x${i.qty} - $${i.price}`).join('\n') + `\n\nTotal: $${total.toFixed(2)}`);
    checkout.href = `mailto:ventas@urbanthreads.example?subject=${subject}&body=${body}`;
  }
}

function removeFromCart(index){ const cart = getCart(); if(index>=0 && index < cart.length){ cart.splice(index,1); saveCart(cart); showToast('Artículo eliminado'); } }
function clearCart(){ saveCart([]); }

// expose helpers globally
window.utCart = { getCart, saveCart, addToCart, removeFromCart, clearCart, renderCart };
