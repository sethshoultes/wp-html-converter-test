// Shared script: the small-screen menu toggle used on every page.
document.addEventListener('DOMContentLoaded', () => {
  // Marks the page so the test can see this shared script ran.
  document.body.dataset.siteScript = 'ran';
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) {
    return;
  }
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
});
