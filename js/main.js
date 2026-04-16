document.addEventListener('DOMContentLoaded', () => {
  const modal = document.querySelector('#feedback-modal');
  const form = document.querySelector('.modal-form');
  const phoneInput = document.querySelector('#modal-user-phone');
  const submitButton = document.querySelector('.modal-form-button');
  const closeButton = document.querySelector('.modal-close');

  const openButtons = document.querySelectorAll(
    '.hero-promo-button, .product-card-button, .order-call, .header-phone-button'
  );

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  document.body.appendChild(overlay);

  let lastActiveElement = null;

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      lastActiveElement = e.currentTarget;
      openModal();
    });
  });

  closeButton.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal();
  });

  overlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  submitButton.addEventListener('click', (e) => {
    e.preventDefault();

    if (!validatePhone(phoneInput.value)) {
      phoneInput.style.borderColor = '#ee685f';
      phoneInput.focus();
      setTimeout(() => {
        phoneInput.style.borderColor = '';
      }, 2000);
      return;
    }

    console.log('Заявка:', phoneInput.value);
    form.reset();
    alert('✅ Заявка на тест-драйв отправлена! Менеджер свяжется в течение 5 минут.');
    closeModal();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validatePhone(phoneInput.value)) {
      phoneInput.style.borderColor = '#ee685f';
      phoneInput.focus();
      setTimeout(() => {
        phoneInput.style.borderColor = '';
      }, 2000);
      return;
    }

    console.log('Заявка:', phoneInput.value);
    alert('✅ Заявка на тест-драйв отправлена! Менеджер свяжется в течение 5 минут.');
    form.reset();
    closeModal();
  });

  phoneInput.addEventListener('focus', onPhoneFocus);
  phoneInput.addEventListener('input', formatPhone);
  phoneInput.addEventListener('keydown', handlePhoneKeys);
  phoneInput.addEventListener('click', fixCursorPosition);

  function openModal() {
    modal.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    phoneInput.focus();
  }

  function closeModal() {
    modal.classList.add('closing');
    overlay.classList.remove('active');

    setTimeout(() => {
      modal.classList.remove('active', 'closing');
      document.body.style.overflow = '';
      form.reset();
      phoneInput.style.borderColor = '';
      if (lastActiveElement) lastActiveElement.focus();
    }, 200);
  }

  function onPhoneFocus(e) {
    if (e.target.value === '') {
      e.target.value = '+7(';
      e.target.setSelectionRange(4, 4);
    }
  }

  function formatPhone(e) {
    const input = e.target;
    let digits = input.value.replace(/\D/g, '').slice(0, 11);

    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (!digits.startsWith('7')) digits = '7' + digits;

    let value = '+7(';
    if (digits.length > 1) value += digits.slice(1, 4);
    if (digits.length > 4) value += ')' + digits.slice(4, 7);
    if (digits.length > 7) value += '-' + digits.slice(7, 9);
    if (digits.length > 9) value += '-' + digits.slice(9, 11);

    input.value = value;
  }

  function handlePhoneKeys(e) {
    if ([8, 9, 37, 38, 39, 46].includes(e.keyCode)) return;

    const value = e.target.value.replace(/\D/g, '');
    if (value.length >= 11) e.preventDefault();
  }

  function fixCursorPosition() {
    setTimeout(() => {
      if (phoneInput.value === '+7(') {
        phoneInput.setSelectionRange(4, 4);
      }
    }, 0);
  }

  function validatePhone(value) {
    return /^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(value);
  }
});