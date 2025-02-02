const formWrapper = document.getElementById('formWrapper');
const signupLink = document.getElementById('signupLink');
const loginLink = document.getElementById('loginLink');

signupLink.addEventListener('click', (e) => {
    e.preventDefault();
    formWrapper.style.transform = 'rotateY(180deg)';
    // ... inside the signupLink click handler ...

    const usernameInput = document.querySelector('.login-form input[type="text"]');
    const passwordInput = document.querySelector('.login-form input[type="password"]');

    // const signupPasswordInput = document.getElementById('password').value;
    // const signupConfirmPasswordInput = document.getElementById('cfmpassword').value;

    // if (signupPasswordInput && signupConfirmPasswordInput && signupPasswordInput.value !== signupConfirmPasswordInput.value) {
    //     alert("Passwords do not match!");
    //     return;
    // }
    usernameInput.value = '';
    passwordInput.value = '';
    document.title = "MediConnect - Sign Up into the website"
});

loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    formWrapper.style.transform = 'rotateY(0deg)';
    const signupNameInput = document.querySelector('.signup-form input[type="text"][placeholder="Enter username"]'); // More specific selector
  const signupEmailInput = document.querySelector('.signup-form input[type="email"]');
  const signupPasswordInput = document.querySelector('.signup-form input[type="password"]');

    if (signupNameInput) {
        signupNameInput.value = '';
    }

    if (signupEmailInput) {
        signupEmailInput.value = '';
    }

    if (signupPasswordInput) {
        signupPasswordInput.value = '';
    }
    document.title = "MediConnect - Log In into the website"
});
const signupForm = document.getElementById('signupForm');

signupForm.addEventListener('submit', (event) => {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('cfmpassword').value;
    if (!signupForm.checkValidity()) {
        alert("Please fill out all required fields.");
        event.preventDefault();
        return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        alert("Passwords do not match. Please try again.");
        event.preventDefault(); 
    }
});