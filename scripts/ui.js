// UI helpers: sidebar toggle, subnav toggles, modal focus management
(function(){
  const btnBurger = document.getElementById('btn-burger');
  const sidebar = document.getElementById('site-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const btnClose = document.getElementById('btn-sidebar-close');

  function openSidebar(){ sidebar.classList.add('open'); sidebar.setAttribute('aria-hidden','false'); backdrop.hidden = false; backdrop.classList.add('visible'); document.body.style.overflow='hidden'; sidebar.querySelector('a,button').focus(); }
  function closeSidebar(){ sidebar.classList.remove('open'); sidebar.setAttribute('aria-hidden','true'); backdrop.hidden = true; backdrop.classList.remove('visible'); document.body.style.overflow=''; btnBurger.focus(); }

  btnBurger && btnBurger.addEventListener('click', ()=>{ openSidebar(); });
  btnClose && btnClose.addEventListener('click', ()=>{ closeSidebar(); });
  backdrop && backdrop.addEventListener('click', ()=>{ closeSidebar(); });

  // subnav toggle
  document.querySelectorAll('.sidebar-toggle').forEach(b=>{ b.addEventListener('click', ()=>{ b.parentElement.classList.toggle('open'); }); });

  // wire sidebar login/register buttons to auth modal
  const btnSidebarLogin = document.getElementById('btn-sidebar-login');
  const btnSidebarRegister = document.getElementById('btn-sidebar-register');
  btnSidebarLogin && btnSidebarLogin.addEventListener('click', ()=>{ window.utAuth && window.utAuth.openModal('login', true); closeSidebar(); });
  btnSidebarRegister && btnSidebarRegister.addEventListener('click', ()=>{ window.utAuth && window.utAuth.openModal('register', true); closeSidebar(); });

  // products mega menu (desktop)
  const productsToggle = document.getElementById('products-toggle');
  const productsMenu = document.getElementById('products-menu');
  function closeProducts(){ if(productsToggle){ productsToggle.setAttribute('aria-expanded','false'); productsMenu && productsMenu.setAttribute('aria-hidden','true'); } }
  function openProducts(){ if(productsToggle){ productsToggle.setAttribute('aria-expanded','true'); productsMenu && productsMenu.setAttribute('aria-hidden','false'); } }
  productsToggle && productsToggle.addEventListener('click', (e)=>{ const expanded = productsToggle.getAttribute('aria-expanded') === 'true'; if(expanded) closeProducts(); else openProducts(); e.preventDefault(); });
  // close on outside click
  document.addEventListener('click', function(e){ if(productsMenu && !productsMenu.contains(e.target) && !productsToggle.contains(e.target)){ closeProducts(); } });
  // close on escape
  window.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ closeProducts(); } });

  // ensure burger visible on small screens
  function checkBurger(){ if(window.innerWidth < 900){ document.querySelectorAll('.desktop-nav').forEach(n=>n.style.display='none'); document.querySelectorAll('.burger').forEach(b=>b.style.display='inline-flex'); } else { document.querySelectorAll('.desktop-nav').forEach(n=>n.style.display='block'); document.querySelectorAll('.burger').forEach(b=>b.style.display='none'); closeSidebar(); } }
  window.addEventListener('resize', checkBurger); window.addEventListener('load', checkBurger);

  // Close sidebar with Escape
  window.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ if(sidebar.classList.contains('open')) closeSidebar(); const mod = document.getElementById('login-modal'); if(mod && mod.getAttribute('aria-hidden')==='false') mod.setAttribute('aria-hidden','true'); } });
})();
