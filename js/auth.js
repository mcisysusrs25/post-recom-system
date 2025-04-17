const form = document.getElementById('auth-form');
const messageDiv = document.getElementById('message');
const formTitle = document.getElementById('form-title');
const toggleLink = document.getElementById('toggle-link');
const toggleText = document.getElementById('toggle-text');
const submitButton = document.getElementById('submit-button');
let isLoginMode = false;

// Function to update UI based on login/register mode
function updateUI(login) {
    isLoginMode = login;
    
    if (isLoginMode) {
        formTitle.textContent = 'Log In';
        toggleLink.textContent = 'Register';
        toggleText.textContent = 'Don\'t have an account? ';
        submitButton.textContent = 'Log In';
        // Hide name field for login
        document.getElementById('name-group').style.display = 'none';
    } else {
        formTitle.textContent = 'Register';
        toggleLink.textContent = 'Log in';
        toggleText.textContent = 'Already have an account? ';
        submitButton.textContent = 'Register';
        // Show name field for registration
        document.getElementById('name-group').style.display = 'block';
    }
}

// Check URL parameters when page loads
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('login')) {
        updateUI(true);
    } else if (urlParams.has('register')) {
        updateUI(false);
    } else {
        // Default to register if no parameter specified
        updateUI(false);
    }
});

// Toggle between register and login
toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    // Toggle mode
    updateUI(!isLoginMode);
    
    // Update URL without page refresh
    const newUrl = isLoginMode 
        ? window.location.pathname + '?login' 
        : window.location.pathname + '?register';
    
    window.history.pushState({}, '', newUrl);
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    let name = '';
    
    if (!isLoginMode) {
        name = document.getElementById('name').value;
    }

    const endpoint = isLoginMode 
        ? 'http://127.0.0.1:5000/api/auth/login' 
        : 'http://127.0.0.1:5000/api/auth/register';

    try {
        const requestData = isLoginMode 
            ? { email, password } 
            : { name, email, password };
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (response.ok) {
            // For login, store token and redirect to dashboard
            if (isLoginMode) {
                sessionStorage.setItem('token', data.token);
                window.location.href = 'dashboard.html';
            } else {
                // For register, show success message and switch to login
                messageDiv.innerHTML = `
                    <div class="success-message">
                        Registration successful! Please log in.
                    </div>
                `;
                // Switch to login mode
                updateUI(true);
                // Update URL
                window.history.pushState({}, '', window.location.pathname + '?login');
            }
        } else {
            // Show error message
            messageDiv.innerHTML = `
                <div class="error-message">
                    ${data.message || 'An error occurred'}
                </div>
            `;
        }
    } catch (error) {
        messageDiv.innerHTML = `
            <div class="error-message">
                Network error. Please try again.
            </div>
        `;
        console.error('Error:', error);
    }
});