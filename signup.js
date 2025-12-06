document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signupForm');
  const submitBtn = document.getElementById('submitBtn');
  const agree = document.getElementById('agree');

  const pw = document.getElementById('password');
  const confirm = document.getElementById('confirm');
  const pwMeterBar = document.querySelector('#pw-meter .pw-bar');
  const pwText = document.getElementById('pw-text');

  const avatar = document.getElementById('avatar');
  const avatarPreview = document.getElementById('avatarPreview');

  const successOverlay = document.getElementById('successOverlay');
  const closeOverlay = document.getElementById('closeOverlay');

  // helper validators
  const emailValid = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const usernameValid = v => /^[a-zA-Z0-9._-]{3,}$/.test(v);
  const phoneValid = v => v.trim() === '' || /^[0-9\-\+\s]{7,}$/.test(v);

  function checkPasswordsMatch(){
    const err = document.getElementById('err-confirm');
    if (confirm.value && confirm.value !== pw.value) {
      err.textContent = 'Passwords do not match';
      return false;
    }
    err.textContent = '';
    return true;
  }

  function updatePwStrength(){
    const v = pw.value;
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    pwMeterBar.style.width = (score / 4 * 100) + '%';
    const txt = ['Very weak','Weak','Okay','Strong','Excellent'][score];
    pwText.textContent = txt + (v ? ` • ${v.length} chars` : ' • Use at least 8 chars');
  }

  // show / hide password
  document.querySelectorAll('.toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.target;
      const el = document.getElementById(id);
      if (!el) return;
      if (el.type === 'password') {
        el.type = 'text';
        btn.textContent = 'Hide';
      } else {
        el.type = 'password';
        btn.textContent = 'Show';
      }
      el.focus();
    });
  });

  // avatar preview
  avatar.addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    const err = document.getElementById('err-avatar');
    err.textContent = '';
    if (!f) {
      avatarPreview.style.backgroundImage = '';
      return;
    }
    if (!f.type.startsWith('image/')) {
      err.textContent = 'Please upload an image';
      avatar.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      avatarPreview.style.backgroundImage = `url(${reader.result})`;
    };
    reader.readAsDataURL(f);
  });

  // field-level validation
  function validateField(id) {
    const val = document.getElementById(id).value.trim();
    const errEl = document.getElementById('err-' + id);
    errEl.textContent = '';
    if (id === 'fullname') {
      if (!val) { errEl.textContent = 'Full name is required'; return false; }
      return true;
    }
    if (id === 'username') {
      if (!usernameValid(val)) { errEl.textContent = 'Choose a valid username (min 3 chars)'; return false; }
      return true;
    }
    if (id === 'email') {
      if (!emailValid(val)) { errEl.textContent = 'Enter a valid email'; return false; }
      return true;
    }
    if (id === 'password') {
      if (val.length < 8) { document.getElementById('err-password').textContent = 'Password too short'; return false; }
      return true;
    }
    if (id === 'confirm') {
      return checkPasswordsMatch();
    }
    if (id === 'phone') {
      if (!phoneValid(val)) { document.getElementById('err-phone').textContent = 'Invalid phone number'; return false; }
      return true;
    }
    return true;
  }

  ['fullname','username','email','password','confirm','phone'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', () => {
      validateField(id);
      if (id === 'password') updatePwStrength();
      if (id === 'confirm') checkPasswordsMatch();
      checkFormReady();
    });
    el.addEventListener('blur', () => { validateField(id); });
  });

  function checkFormReady(){
    const ready = agree.checked &&
      validateField('fullname') &&
      validateField('username') &&
      validateField('email') &&
      validateField('password') &&
      validateField('confirm') &&
      checkPasswordsMatch();
    submitBtn.disabled = !ready;
  }

  agree.addEventListener('change', checkFormReady);

  // handle submit
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    // final validation
    const ok = ['fullname','username','email','password','confirm','phone'].every(id => validateField(id)) && checkPasswordsMatch();
    if (!ok) return;
    // collect safe summary (do NOT store raw password in real apps)
    const userSummary = {
      fullname: document.getElementById('fullname').value.trim(),
      username: document.getElementById('username').value.trim(),
      email: document.getElementById('email').value.trim(),
      bio: document.getElementById('bio').value.trim(),
      createdAt: new Date().toISOString()
    };
    try {
      // store a summary only
      localStorage.setItem('demo_user_summary', JSON.stringify(userSummary));
    } catch (e) {
      console.warn('Storage failed', e);
    }
    successOverlay.hidden = false;
    successOverlay.querySelector('.overlay-card h2').focus?.();
  });

  closeOverlay.addEventListener('click', () => {
    successOverlay.hidden = true;
    // optional: redirect or reset form
    form.reset();
    avatarPreview.style.backgroundImage = '';
    pwMeterBar.style.width = '0%';
    submitBtn.disabled = true;
  });

  // initial setup
  updatePwStrength();
  checkFormReady();
});
