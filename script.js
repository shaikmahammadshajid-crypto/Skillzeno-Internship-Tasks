const header = document.querySelector('.site-header');
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('nav a');

toggle.addEventListener('click', () => {
  const isOpen = header.classList.toggle('open');
  toggle.setAttribute('aria-expanded', isOpen);
  toggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});

navLinks.forEach(link => link.addEventListener('click', () => {
  header.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));

const form = document.querySelector('#contact-form');
const status = document.querySelector('.form-status');
form.addEventListener('submit', event => {
  event.preventDefault();
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!name || !validEmail || !message) {
    status.textContent = 'Please add your name, a valid email, and a message.';
    status.className = 'form-status error';
    return;
  }
  status.textContent = `Thanks, ${name}! Your message is ready to send.`;
  status.className = 'form-status';
  form.reset();
});
