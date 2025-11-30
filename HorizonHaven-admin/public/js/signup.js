// public/js/signup.js

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons once DOM is ready
  if (window.lucide) {
    window.lucide.createIcons();
  }

  const form = document.getElementById('signupForm');
  const submitBtn = document.getElementById('submitBtn');
  const successModal = document.getElementById('successModal');
  const errorMessage = document.getElementById('errorMessage');

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  const togglePassword = document.getElementById('togglePassword');
  const googleSignupBtn = document.getElementById('googleSignupBtn');

  // ---- Redirect if already logged in ----
  (function checkLoggedIn() {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('/api/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          window.location.href = '/dashboard.html';
        } else {
          localStorage.removeItem('token');
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
      });
  })();

  // ---- Floating label fix for pre-filled inputs ----
  [nameInput, emailInput, passwordInput].forEach((input) => {
    input.addEventListener('input', () => {
      input.setAttribute('value', input.value);
    });
  });

  // ---- Password Toggle Logic ----
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function () {
      const type =
        passwordInput.getAttribute('type') === 'password'
          ? 'text'
          : 'password';
      passwordInput.setAttribute('type', type);
      this.style.color = type === 'password' ? '#9ca3af' : '#4b5563';
    });
  }

  // Helper: show loader inside a button
  function setButtonLoading(button, isLoading) {
    if (isLoading) {
      const original = button.innerHTML;
      button.dataset.originalText = original;
      button.innerHTML =
        '<i data-lucide="loader-2" class="spin" style="margin: 0 auto;"></i>';
      if (window.lucide) {
        window.lucide.createIcons();
      }
      const loader = button.querySelector('svg');
      if (loader) {
        loader.animate(
          [
            { transform: 'rotate(0deg)' },
            { transform: 'rotate(360deg)' },
          ],
          {
            duration: 1000,
            iterations: Infinity,
          }
        );
      }
      button.disabled = true;
    } else {
      button.innerHTML = button.dataset.originalText || 'Sign Up';
      button.disabled = false;
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  }

  // ---- Form submit: real signup using backend (/api/signup) ----
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!name || !email || !password) {
      errorMessage.textContent = 'Please fill in all fields.';
      errorMessage.style.display = 'block';
      return;
    }

    try {
      setButtonLoading(submitBtn, true);

      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        errorMessage.textContent =
          data.message || 'Could not create account. Please try again.';
        errorMessage.style.display = 'block';
        setButtonLoading(submitBtn, false);
        return;
      }

      // Save token if provided
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // Show success modal and redirect to dashboard
      if (successModal) {
        successModal.classList.add('active');
      }

      setTimeout(() => {
        if (successModal) {
          successModal.classList.remove('active');
        }
        setButtonLoading(submitBtn, false);
        window.location.href = '/dashboard.html';
      }, 1500);
    } catch (err) {
      console.error('Signup error:', err);
      errorMessage.textContent =
        'Something went wrong. Please try again later.';
      errorMessage.style.display = 'block';
      setButtonLoading(submitBtn, false);
    }
  });

  // ---- Mock Google signup (still fake for now) ----
  if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', () => {
      setButtonLoading(googleSignupBtn, true);

      setTimeout(() => {
        setButtonLoading(googleSignupBtn, false);
        alert('Google Signup flow would trigger here.');
      }, 1000);
    });
  }
});
