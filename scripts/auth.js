// Simple client-side auth (demo only).
(function(){
  function getUsers(){ try{return JSON.parse(localStorage.getItem('ut_users')||'[]')}catch(e){return[]} }
  function saveUsers(u){ localStorage.setItem('ut_users', JSON.stringify(u||[])); }
  function getCurrentUser(){ try{return JSON.parse(localStorage.getItem('ut_user')||'null')}catch(e){return null} }
  function setCurrentUser(u){ localStorage.setItem('ut_user', JSON.stringify(u)); }
  function clearCurrentUser(){ localStorage.removeItem('ut_user'); }

  const modal = document.getElementById('login-modal');
  const authForm = document.getElementById('auth-form');
  const btnLogin = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');
  const userMenu = document.getElementById('user-menu');
  const userName = document.getElementById('user-name');
  const authTitle = document.getElementById('auth-title');
  const switchMode = document.getElementById('switch-mode');

  let mode = 'login'; // or 'register'

  let lastFocus = null;
  function openModal(m, focusFirst){ mode = m||'login'; lastFocus = document.activeElement; modal.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open');
    authTitle.textContent = (mode==='login')? 'Iniciar sesión' : 'Crear cuenta';
    switchMode.textContent = (mode==='login')? 'Crear cuenta':'Ya tengo cuenta';
    if(focusFirst){ const el = modal.querySelector('input[name="email"]'); if(el) el.focus(); }
    // small accessibility: trap focus inside modal
    const focusable = Array.from(modal.querySelectorAll('button, a, input, select, textarea')).filter(el=>!el.hasAttribute('disabled'));
    const first = focusable[0]; const last = focusable[focusable.length-1];
    modal.addEventListener('keydown', function trap(e){ if(e.key === 'Tab'){ if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); } else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); } } });
  }
  function closeModal(){ modal.setAttribute('aria-hidden','true'); document.body.classList.remove('modal-open'); if(lastFocus && lastFocus.focus) lastFocus.focus(); }

  // Toggle UI when user logs in/out
  function refreshAuthUI(){ const u = getCurrentUser(); if(u){ btnLogin.hidden = true; userMenu.hidden = false; userName.textContent = u.name || (u.email? u.email.split('@')[0]: 'Usuario'); } else { btnLogin.hidden = false; userMenu.hidden = true; userName.textContent = ''; } }

  // simple password store (not secure) - base64 encode
  function encode(p){ try{return btoa(p||''); }catch(e){return p} }

  authForm.addEventListener('submit', function(e){ e.preventDefault(); const form = new FormData(authForm); const email = (form.get('email')||'').trim().toLowerCase(); const password = form.get('password')||''; if(!email || !password){ alert('Completa email y contraseña'); return }
    const users = getUsers(); if(mode==='login'){
      const u = users.find(x=>x.email===email);
      if(!u || u.password !== encode(password)) { alert('Usuario o contraseña inválidos'); return }
      setCurrentUser({ email: u.email, name: u.name || (u.email.split('@')[0]) });
      closeModal(); if(window.showToast) showToast('Bienvenido, '+(u.name||u.email.split('@')[0])); else console.log('Bienvenido, '+(u.name||u.email.split('@')[0]));
      refreshAuthUI(); handleRedirectPostLogin();
    } else {
      // register
      if(users.find(x=>x.email===email)){ alert('Ya existe una cuenta con ese correo'); return }
      const newUser = { email: email, password: encode(password), name: email.split('@')[0] };
      users.push(newUser); saveUsers(users); setCurrentUser({ email: newUser.email, name: newUser.name });
      closeModal(); if(window.showToast) showToast('Cuenta creada: '+newUser.email); else console.log('Cuenta creada: '+newUser.email);
      refreshAuthUI(); handleRedirectPostLogin();
    }
  });

  // switch mode (register/login)
  switchMode.addEventListener('click', function(){ mode = (mode==='login')? 'register':'login'; openModal(mode, true); });

  // open/close
  btnLogin.addEventListener('click', ()=>openModal('login', true));
  document.querySelectorAll('.modal-close').forEach(b=>b.addEventListener('click', ()=>closeModal()));
  window.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ closeModal(); } });

  btnLogout && btnLogout.addEventListener('click', function(){ clearCurrentUser(); refreshAuthUI(); if(window.showToast) showToast('Sesión cerrada'); else console.log('Sesión cerrada'); });

  // Intercept links that require login
  document.addEventListener('click', function(e){ const a = e.target.closest && e.target.closest('a[data-requires-login]'); if(a){ const u = getCurrentUser(); if(!u){ e.preventDefault(); sessionStorage.setItem('ut_redirect', a.getAttribute('href')||''); openModal('login', true); } } });

  function handleRedirectPostLogin(){ const url = sessionStorage.getItem('ut_redirect'); if(url){ sessionStorage.removeItem('ut_redirect'); window.location = url; } }

  // Init
  window.addEventListener('load', function(){ refreshAuthUI(); });

  // Expose simple API
  window.utAuth = { getCurrentUser, getUsers, openModal };
})();
