document.addEventListener('DOMContentLoaded', () => {

  function validatePhone(value) {
    return /^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(value);
  }

  function setInputError(input, hasError, message = 'Введите номер в формате +7(XXX)XXX-XX-XX') {
    input.classList.toggle('input--error', hasError);
    input.setAttribute('aria-invalid', hasError ? 'true' : 'false');

    input.parentElement?.querySelector('.input-error-hint')?.remove();

    if (hasError) {
      const hint = document.createElement('span');
      hint.className = 'input-error-hint';
      hint.setAttribute('role', 'alert');
      hint.setAttribute('aria-live', 'assertive');
      hint.textContent = message;
      input.insertAdjacentElement('afterend', hint);

      const timer = setTimeout(() => setInputError(input, false), 3000);
      input.dataset.errorTimer = timer;
    } else {
      clearTimeout(Number(input.dataset.errorTimer));
    }
  }

  // ── Маска телефона 

  function applyPhoneMask(input) {
    input.addEventListener('focus', () => {
      if (input.value === '') {
        input.value = '+7(';
        requestAnimationFrame(() => input.setSelectionRange(4, 4));
      }
    });

    input.addEventListener('input', () => {
      let digits = input.value.replace(/\D/g, '').slice(0, 11);
      if (digits.startsWith('8')) digits = '7' + digits.slice(1);
      if (!digits.startsWith('7')) digits = '7' + digits;

      let value = '+7(';
      if (digits.length > 1) value += digits.slice(1, 4);
      if (digits.length >= 4) value += ')' + digits.slice(4, 7);
      if (digits.length >= 7) value += '-' + digits.slice(7, 9);
      if (digits.length >= 9) value += '-' + digits.slice(9, 11);

      input.value = value;
      setInputError(input, false);
    });

    input.addEventListener('keydown', (e) => {
      if ([8, 9, 37, 38, 39, 40, 46].includes(e.keyCode)) return;
      if (input.value.replace(/\D/g, '').length >= 11) e.preventDefault();
    });

    input.addEventListener('click', () => {
      requestAnimationFrame(() => {
        if (input.value === '+7(') input.setSelectionRange(4, 4);
      });
    });
  }

  // ── Мини-модал «Отправлено» 

  function showSuccessMessage() {
    document.querySelector('.success-modal')?.remove();
    document.querySelector('.success-modal-overlay')?.remove();

    const successOverlay = document.createElement('div');
    successOverlay.className = 'success-modal-overlay';

    const successModal = document.createElement('div');
    successModal.className = 'success-modal';
    successModal.setAttribute('role', 'dialog');
    successModal.setAttribute('aria-modal', 'true');
    successModal.setAttribute('aria-label', 'Уведомление об отправке');
    successModal.innerHTML = `
      <div class="success-modal__icon">✓</div>
      <p class="success-modal__title">Отправлено</p>
      <p class="success-modal__text">Менеджер свяжется с вами в течение 5 минут</p>
      <button class="success-modal__close" aria-label="Закрыть">Закрыть</button>
    `;

    document.body.appendChild(successOverlay);
    document.body.appendChild(successModal);

    requestAnimationFrame(() => {
      successOverlay.classList.add('success-modal-overlay--visible');
      successModal.classList.add('success-modal--visible');
    });

    let closed = false;
    function closeSuccess() {
      if (closed) return;
      closed = true;
      successModal.classList.remove('success-modal--visible');
      successOverlay.classList.remove('success-modal-overlay--visible');
      setTimeout(() => { successModal.remove(); successOverlay.remove(); }, 250);
    }

    successModal.querySelector('.success-modal__close').addEventListener('click', closeSuccess);
    successOverlay.addEventListener('click', closeSuccess);
    document.addEventListener('keydown', function onEsc(e) {
      if (e.key === 'Escape') { closeSuccess(); document.removeEventListener('keydown', onEsc); }
    });
    setTimeout(closeSuccess, 4000);
  }

  function showFormError(form, message) {
    form.querySelector('.form-error-message')?.remove();
    const el = document.createElement('p');
    el.className = 'form-error-message';
    el.setAttribute('role', 'alert');
    el.textContent = message;
    form.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }

  async function sendForm({ phone, submitBtn, form, originalText, onSuccess }) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка…';

    try {
      const body = new FormData();
      body.append('phone', phone);

      const response = await fetch('send.php', { method: 'POST', body });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const tel = form.querySelector('input[type="tel"]');
      form.reset();
      if (tel) tel.value = '';

      showSuccessMessage();
      onSuccess?.();

    } catch (err) {
      console.error('Ошибка отправки:', err);
      showFormError(form, 'Не удалось отправить заявку. Попробуйте ещё раз.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  // ── Инициализация формы 

  function initForm(form, { onSuccess } = {}) {
    if (!form) return;

    const phoneInput = form.querySelector('input[type="tel"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn?.textContent?.trim() || 'Отправить';

    if (phoneInput) applyPhoneMask(phoneInput);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!phoneInput || !validatePhone(phoneInput.value)) {
        if (phoneInput) { setInputError(phoneInput, true); phoneInput.focus(); }
        return;
      }

      await sendForm({ phone: phoneInput.value, submitBtn, form, originalText, onSuccess });
    });
  }

  initForm(document.querySelector('.cta-form'));

  // ── Модальное окно 

  const modal = document.querySelector('#feedback-modal');
  const closeButton = document.querySelector('.modal-close');

  if (!modal || !closeButton) return;

  const modalForm = modal.querySelector('.modal-form');
  const modalPhone = modal.querySelector('input[type="tel"]');

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);

  let lastActiveElement = null;

  function openModal() {
    modal.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    modal.setAttribute('aria-hidden', 'false');
    trapFocus(modal);
    modalPhone?.focus();
  }

  function closeModal() {
    modal.classList.add('closing');
    overlay.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      modal.classList.remove('active', 'closing');
      document.body.style.overflow = '';
      if (modalPhone) { modalPhone.value = ''; setInputError(modalPhone, false); }
      modalForm?.reset();
      lastActiveElement?.focus();
    }, 200);
  }

  initForm(modalForm, { onSuccess: closeModal });

  const openButtons = document.querySelectorAll(
    '.hero-promo-button, .product-card-button, .order-call, .header-phone-button'
  );

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      lastActiveElement = e.currentTarget;
      openModal();
    });
  });

  closeButton.addEventListener('click', (e) => { e.preventDefault(); closeModal(); });
  overlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });

  function trapFocus(container) {
    const focusable = container.querySelectorAll(
      'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function onKeydown(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    container.addEventListener('keydown', onKeydown);

    const observer = new MutationObserver(() => {
      if (!modal.classList.contains('active')) {
        container.removeEventListener('keydown', onKeydown);
        observer.disconnect();
      }
    });
    observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

});