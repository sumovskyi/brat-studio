// ================================================
// BRAT Studio - Main JavaScript
// ================================================

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initScrollAnimations();
  initSmoothScroll();
  initFaqAccordion();
});

// -------------------- FAQ Accordion --------------------
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', () => {
      // Close other open items (optional - for single-open behavior)
      const isOpen = item.classList.contains('is-open');

      // Toggle current item
      item.classList.toggle('is-open');
      question.setAttribute('aria-expanded', !isOpen);
    });
  });
}

// -------------------- Mobile Navigation --------------------
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('nav--open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when clicking a link
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('nav--open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// -------------------- Scroll Animations --------------------
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('[data-animate]');

  if (!animatedElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  animatedElements.forEach(el => observer.observe(el));
}

// -------------------- Smooth Scroll --------------------
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerOffset = 100;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// -------------------- Form Handling --------------------
// Google Sheets integration would be configured per-form
// See form-handler.js for the actual submission logic

// -------------------- Schedule Filter (Masterclass) --------------------
function initScheduleFilter() {
  const filterBtns = document.querySelectorAll('.schedule-filter__btn');
  const scheduleCards = document.querySelectorAll('.schedule-card');
  const scheduleEmpty = document.getElementById('schedule-empty');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active button
      filterBtns.forEach(b => b.classList.remove('schedule-filter__btn--active'));
      btn.classList.add('schedule-filter__btn--active');

      // Filter cards
      let visibleCount = 0;
      scheduleCards.forEach(card => {
        const level = card.dataset.level;
        const show = filter === 'all' || level === filter;
        card.style.display = show ? '' : 'none';
        if (show) visibleCount++;
      });

      // Show empty message if no results
      if (scheduleEmpty) {
        scheduleEmpty.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    });
  });
}

// -------------------- Registration Modal (Masterclass) --------------------
function initRegistrationModal() {
  const modal = document.getElementById('register-modal');
  const modalClose = modal?.querySelector('.modal__close');
  const modalBackdrop = modal?.querySelector('.modal__backdrop');
  const modalProgramName = document.getElementById('modal-program-name');
  const registerProgramInput = document.getElementById('register-program');
  const registerBtns = document.querySelectorAll('.schedule-card__register');
  const form = document.getElementById('masterclass-register-form');

  if (!modal || !registerBtns.length) return;

  // Open modal
  registerBtns.forEach(btn => {
    if (btn.disabled) return; // Skip disabled buttons

    btn.addEventListener('click', () => {
      const programName = btn.dataset.program;
      if (modalProgramName) modalProgramName.textContent = programName;
      if (registerProgramInput) registerProgramInput.value = programName;
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  });

  // Close modal
  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  modalClose?.addEventListener('click', closeModal);
  modalBackdrop?.addEventListener('click', closeModal);

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  // Form submission
  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Here you would send to your backend/Google Sheets
    console.log('Masterclass Registration:', data);

    // Show success message
    alert(`Thank you for registering for "${data.program}"! We'll contact you within 24 hours to confirm your spot.`);

    // Close modal and reset form
    closeModal();
    form.reset();
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initScheduleFilter();
  initRegistrationModal();
});
