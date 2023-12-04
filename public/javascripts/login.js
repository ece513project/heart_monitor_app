document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.form');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const formErrors = document.getElementById('formErrors');
    const submitButton = document.getElementById('submit');

    submitButton.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent form submission

        // Reset error messages and styles
        formErrors.style.display = 'none';
        email.style.border = '1px solid #aaa';
        password.style.border = '1px solid #aaa';

        let errorMessages = "<ul>";

        // Email Validation
        if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/.test(email.value)) {
            errorMessages += "<li>Invalid or missing email address.</li>";
            email.style.border = '2px solid red';
        }

        // Password Validation
        if (password.value.length < 10 || password.value.length > 20) {
            errorMessages += "<li>Password must be between 10 and 20 characters.</li>";
            password.style.border = '2px solid red';
        }

        if (!/[a-z]/.test(password.value)) {
            errorMessages += "<li>Password must contain at least one lowercase character.</li>";
            password.style.border = '2px solid red';
        }

        if (!/[A-Z]/.test(password.value)) {
            errorMessages += "<li>Password must contain at least one uppercase character.</li>";
            password.style.border = '2px solid red';
        }

        if (!/\d/.test(password.value)) {
            errorMessages += "<li>Password must contain at least one digit.</li>";
            password.style.border = '2px solid red';
        }

        errorMessages += "</ul>";

        // Display errors if any
        if (errorMessages !== "<ul></ul>") {
            formErrors.style.display = 'block';
            formErrors.innerHTML = errorMessages;
        }

    });
});
