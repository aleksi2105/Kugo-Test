document.addEventListener('DOMContentLoaded', function () {
  const modal = document.querySelector('#feedback-modal');
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  document.body.appendChild(overlay);

  const openButtons = document.querySelectorAll('.hero-promo-button, .product-card-button, .order-call');
  const closeButton = document.querySelector('.modal-close');
  const submitButton = document.querySelector('.modal-form-button'); // Кнопка "Оформить предзаказ"
  const form = document.querySelector('.modal-form');

  // Открытие
  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(e.currentTarget);
    });
  });

  // Закрытие по X
  closeButton.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal();
  });

  // Закрытие по overlay
  overlay.addEventListener('click', closeModal);

  // Закрытие по Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // ✅ Закрытие по кнопке "Оформить предзаказ" + очистка полей
  submitButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (validatePhone(phoneInput.value)) {
      // Имитация отправки
      console.log('Заявка:', phoneInput.value);

      // Очистка полей
      form.reset();

      // Уведомление
      alert('✅ Заявка на тест-драйв отправлена! Менеджер свяжется в течение 5 минут.');

      // Закрытие модала
      closeModal();
    } else {
      phoneInput.style.borderColor = '#ee685f';
      setTimeout(() => { phoneInput.style.borderColor = ''; }, 2000);
      phoneInput.focus();
    }
  });

  // Маска телефона
  const phoneInput = document.querySelector('#modal-user-phone');

  // События
  phoneInput.addEventListener('input', formatPhone);
  phoneInput.addEventListener('keydown', handlePhoneKeys);
  phoneInput.addEventListener('focus', onPhoneFocus);
  phoneInput.addEventListener('click', fixCursorPosition); // ✅ Фикс клика

  let cursorPos = 0; // Глобальная позиция курсора

  function formatPhone(e) {
    const input = e.target;
    cursorPos = input.selectionStart; // Сохраняем позицию ДО форматирования

    let value = input.value.replace(/\D/g, '');
    let formatted = '';

    if (value.length >= 1) formatted += '+7(';
    if (value.length > 1) formatted += value.slice(1, 4);
    if (value.length > 4) formatted += ')' + value.slice(4, 7);
    if (value.length > 7) formatted += '-' + value.slice(7, 9);
    if (value.length > 9) formatted += '-' + value.slice(9, 11);

    input.value = formatted;

    // ✅ Восстанавливаем позицию курсора ПОСЛЕ форматирования
    setCursorPosition(input, getCursorPosition(cursorPos, formatted.length));
  }

  function fixCursorPosition(e) {
    // ✅ При клике курсор идёт в конец доступной позиции
    const input = e.target;
    setTimeout(() => {
      const value = input.value;
      let pos = input.selectionStart;

      // Перемещаем курсор в первую доступную позицию после скобок/тире
      if (value.includes('+7(') && pos < 4) pos = 4;
      else if (value.includes(')') && pos < 7) pos = 7;
      else if (value.includes('-') && pos === 8) pos = 10;

      setCursorPosition(input, pos);
    }, 10);
  }

  function getCursorPosition(oldPos, newLength) {
    // Логика позиций маски: +7( | 777 ) 777 - 77 - 77
    const maskPositions = [4, 7, 10, 13]; // После +7(, ), первого -, второго -

    for (let i = 0; i < maskPositions.length; i++) {
      if (oldPos <= maskPositions[i]) return maskPositions[i];
    }
    return Math.min(newLength, 17);
  }

  function setCursorPosition(input, pos) {
    input.setSelectionRange(pos, pos);
    input.focus();
  }

  function handlePhoneKeys(e) {
    if ([8, 9, 37, 38, 39, 46].indexOf(e.keyCode) > -1) return;
    const value = e.target.value.replace(/\D/g, '');
    if (value.length + 1 > 11) e.preventDefault();
  }

  function onPhoneFocus(e) {
    if (e.target.value === '') {
      e.target.value = '+7(';
      setCursorPosition(e.target, 4);
    }
  }

  function validatePhone(value) {
    return /^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(value);
  }

  function openModal() {
    modal.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    trapFocus(modal);
  }

  function closeModal() {
    modal.classList.add('closing');
    overlay.classList.remove('active');

    setTimeout(() => {
      modal.classList.remove('active', 'closing');
      document.body.style.overflow = '';
      form.reset(); // ✅ Очистка формы при любом закрытии
      const lastActive = document.querySelector('.hero-promo-button, .product-card-button');
      lastActive?.focus();
    }, 200);
  }




});