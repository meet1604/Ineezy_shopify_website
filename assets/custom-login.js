$(document).ready(function() {

    
    // Login Form Submission
    $('#custom-login-form').on('submit', function(e) {
        e.preventDefault();
        console.log('custome-login loaded');
    
        const email = $('#login-email').val().trim();
        const password = $('#login-password').val().trim();
        
        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }
        
        $.ajax({
            url: '/account/login',
            type: 'POST',
            data: {
                'customer[email]': email,
                'customer[password]': password,
                'form_type': 'customer_login',
                'utf8': '✓'
            },
            beforeSend: function() {
                $('#login-button').prop('disabled', true).text('Logging in...');
            },
            success: function(response) {
                if (response.includes('id="customer_logout_link"')) {
                    // Successful login
                    window.location.href = '/account';
                } else {
                    // Check for error message in response
                    const errorMessage = $(response).find('.errors').text() || 'Invalid email or password';
                    showError(errorMessage);
                }
            },
            error: function(xhr) {
                showError('An error occurred. Please try again.');
            },
            complete: function() {
                $('#login-button').prop('disabled', false).text('Login');
            }
        });
    });
    
    // Password Recovery
    $('#recover-password-form').on('submit', function(e) {
        e.preventDefault();
        
        const email = $('#recover-email').val().trim();
        
        if (!email) {
            showError('Please enter your email');
            return;
        }
        
        $.ajax({
            url: '/account/recover',
            type: 'POST',
            data: {
                'email': email,
                'form_type': 'recover_customer_password',
                'utf8': '✓'
            },
            beforeSend: function() {
                $('#recover-button').prop('disabled', true).text('Sending...');
            },
            success: function(response) {
                if (response.includes('recovery-success')) {
                    showSuccess('Password reset email sent. Check your inbox.');
                    $('#recover-password-form')[0].reset();
                } else {
                    const errorMessage = $(response).find('.errors').text() || 'Email not found';
                    showError(errorMessage);
                }
            },
            error: function() {
                showError('An error occurred. Please try again.');
            },
            complete: function() {
                $('#recover-button').prop('disabled', false).text('Recover Password');
            }
        });
    });
    
    // Toggle between login and recover forms
    $('#show-recover-password').on('click', function(e) {
        e.preventDefault();
        $('#login-form-container').hide();
        $('#recover-form-container').show();
    });
    
    $('#hide-recover-password').on('click', function(e) {
        e.preventDefault();
        $('#recover-form-container').hide();
        $('#login-form-container').show();
    });
    
    // Helper functions
    function showError(message) {
        $('#error-message').text(message).show();
        setTimeout(() => $('#error-message').fadeOut(), 5000);
    }
    
    function showSuccess(message) {
        $('#success-message').text(message).show();
        setTimeout(() => $('#success-message').fadeOut(), 5000);
    }

      $('.forgotpass').on('click', function(e) {
        e.preventDefault();
        $('.forgot-password').show();
        $('.signinform').hide();
    });

    $('.backtologin').on('click', function(e) {
        e.preventDefault();
        $('.forgot-password').hide();
        $('.signinform').show();
    });  
});