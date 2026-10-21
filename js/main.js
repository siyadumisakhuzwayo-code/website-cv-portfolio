/**
 * SIYADUMISA KHUZWAYO - PORTFOLIO INTERACTIVITY & BINARY STREAM
 * - Interactive 2D/3D Binary Code Rain Canvas (Royal Blue Theme)
 * - Copy to Clipboard Toast
 * - Mobile Navigation Toggle
 * - ScrollSpy & Sticky Header
 * - Contact Form Handler
 */

document.addEventListener('DOMContentLoaded', () => {
  initBinaryCanvas();
  initNavigation();
  initClipboardButtons();
  initContactForm();
});

/* ==========================================================================
   1. Interactive Moving Binary Code Canvas (Royal Blue Tech Theme)
   ========================================================================== */
function initBinaryCanvas() {
  const canvas = document.getElementById('binary-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;

  // Characters to rain: purely binary 0 & 1 with occasional subtle punctuation
  const binaryChars = ['0', '1'];

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const fontSize = 16;
  let columns = Math.floor(width / fontSize);

  // Each column has a vertical position (y), falling speed, and depth/opacity
  let drops = [];
  let speeds = [];
  let opacities = [];
  let charChangeTimers = [];

  function resetColumns() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    columns = Math.floor(width / fontSize);

    drops = [];
    speeds = [];
    opacities = [];
    charChangeTimers = [];

    for (let i = 0; i < columns; i++) {
      // Scatter initial positions so it looks natural and ambient
      drops[i] = Math.floor(Math.random() * -height / fontSize);
      // Varied speeds for pseudo-3D parallax effect
      speeds[i] = 0.4 + Math.random() * 0.9;
      // Opacity varies between 0.25 and 0.85
      opacities[i] = 0.2 + Math.random() * 0.6;
      charChangeTimers[i] = Math.floor(Math.random() * 20);
    }
  }

  resetColumns();

  // Resize listener with debounce
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resetColumns, 150);
  });

  // Respect prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let lastTime = 0;
  const fpsInterval = 1000 / 30; // Smooth 30fps target for battery and CPU efficiency

  function drawBinaryRain(currentTime) {
    animationFrameId = requestAnimationFrame(drawBinaryRain);

    const elapsed = currentTime - lastTime;
    if (elapsed < fpsInterval) return;
    lastTime = currentTime - (elapsed % fpsInterval);

    // Subtle dark slate fade effect for smooth trailing ribbons
    ctx.fillStyle = 'rgba(6, 11, 24, 0.22)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = `600 ${fontSize}px "JetBrains Mono", Consolas, monospace`;

    for (let i = 0; i < columns; i++) {
      // Pick random binary digit
      const char = binaryChars[Math.floor(Math.random() * binaryChars.length)];

      const x = i * fontSize;
      const y = drops[i] * fontSize;

      // Depth coloring: leading head is bright cyan/white, tail is royal blue
      const depth = opacities[i];
      if (Math.random() > 0.88) {
        // Occasional luminous shimmer
        ctx.fillStyle = `rgba(147, 197, 253, ${depth + 0.2})`;
      } else {
        // Deep royal blue & electric blue glow
        ctx.fillStyle = `rgba(59, 130, 246, ${depth})`;
      }

      ctx.fillText(char, x, y);

      if (!prefersReducedMotion) {
        drops[i] += speeds[i];

        // Reset drop when it reaches bottom with randomized stagger
        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
          speeds[i] = 0.4 + Math.random() * 0.9;
          opacities[i] = 0.2 + Math.random() * 0.6;
        }
      }
    }
  }

  animationFrameId = requestAnimationFrame(drawBinaryRain);
}

/* ==========================================================================
   2. Navigation, Sticky Header & ScrollSpy
   ========================================================================== */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Header background on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    // ScrollSpy active link detection
    let currentSectionId = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navItems.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });

  // Mobile menu toggle
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
      toggleBtn.innerHTML = isOpen
        ? '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>'
        : '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>';
    });

    // Close menu when clicking a link
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.innerHTML = '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>';
      });
    });
  }
}

/* ==========================================================================
   3. Copy to Clipboard with Toast Notification
   ========================================================================== */
function initClipboardButtons() {
  const copyButtons = document.querySelectorAll('[data-copy]');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  let toastTimeout;

  function showToast(message) {
    if (!toast) return;
    if (toastMessage) toastMessage.textContent = message;
    toast.classList.add('show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  copyButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      const textToCopy = button.getAttribute('data-copy');
      const label = button.getAttribute('data-label') || 'Text';

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          // Fallback
          const textArea = document.createElement('textarea');
          textArea.value = textToCopy;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          textArea.remove();
        }
        showToast(`${label} copied to clipboard!`);
      } catch (err) {
        showToast(`Copied: ${textToCopy}`);
      }
    });
  });
}

/* ==========================================================================
   4. Contact Form Handler (Direct Email / Mailto)
   ========================================================================== */
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('sender-name')?.value.trim();
    const email = document.getElementById('sender-email')?.value.trim();
    const subject = document.getElementById('sender-subject')?.value.trim();
    const message = document.getElementById('sender-message')?.value.trim();

    if (!name || !email || !message) {
      alert('Please fill in all required fields.');
      return;
    }

    // Build mailto link so it directly opens the user's preferred email client
    const mailtoSubject = encodeURIComponent(subject ? `[Portfolio Inquiry] ${subject}` : `Portfolio Inquiry from ${name}`);
    const mailtoBody = encodeURIComponent(`Hi Siyadumisa,\n\n${message}\n\nFrom: ${name} (${email})`);
    const mailtoLink = `mailto:siyadumisakhuzwayo@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

    // Prompt user and trigger mailto
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    if (toast && toastMessage) {
      toastMessage.textContent = 'Opening email client to send message...';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3500);
    }

    setTimeout(() => {
      window.location.href = mailtoLink;
      contactForm.reset();
    }, 600);
  });
}
