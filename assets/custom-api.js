document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('customerNameUpdateForm');
  const messageEl = document.getElementById('updateMessage');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      // Get the customer access token
     const customerAccessToken = localStorage.getItem('authToken');
      if (!customerAccessToken) {
        showMessage('You need to be logged in to update your information.', 'error');
        return;
      }
      try {
        const response = await updateCustomerName(customerAccessToken, firstName, lastName);
        console.log('Full Response:', response); // Debugging
        if (response.errors) {
          console.error('GraphQL Errors:', response.errors);
          showMessage('Failed to update name. Please try again.', 'error');
          return;
        }
        if (response.data && response.data.customerUpdate) {
          if (response.data.customerUpdate.userErrors && response.data.customerUpdate.userErrors.length > 0) {
            showMessage(response.data.customerUpdate.userErrors[0].message, 'error');
          } else {
            showMessage('Your name has been updated successfully!', 'success');
            // Update the displayed name immediately
            document.getElementById('firstName').value = firstName;
            document.getElementById('lastName').value = lastName;
          }
        } else {
          showMessage('Unexpected response from server.', 'error');
        }
      } catch (error) {
        console.error('Error updating customer:', error);
        showMessage('There was an error updating your name. Please try again.', 'error');
      }
    });
  }
  // CORRECTED GraphQL mutation
  async function updateCustomerName(customerAccessToken, firstName, lastName) {
    const query = `
      mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
        customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
          customer {
            firstName
            lastName
            email
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    const variables = {
      customerAccessToken: customerAccessToken,
      customer: {
        firstName: firstName,
        lastName: lastName
      }
    };
    const response = await fetch('https://ineezy.myshopify.com/api/2025-07/graphql.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': '881ac94b12f00d73ce71dfbfc410a115'
      },
      body: JSON.stringify({ query, variables })
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }
  // Helper function to get cookies
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
  // Helper function to show messages
  function showMessage(message, type) {
    if (!messageEl) return;
    messageEl.textContent = message;
    messageEl.style.display = 'block';
    messageEl.style.color = type === 'success' ? 'green' : 'red';
    messageEl.style.padding = '10px';
    messageEl.style.margin = '10px 0';
    messageEl.style.borderRadius = '4px';
    messageEl.style.backgroundColor = type === 'success' ? '#f0fff0' : '#fff0f0';
    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 5000);
  }
});