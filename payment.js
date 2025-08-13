// Paystack Configuration
// Replace this with your actual Paystack test publishable key
// Get your keys from: https://dashboard.paystack.com/#/settings/developer
const PAYSTACK_PUBLIC_KEY = 'pk_test_99d801b477ef04a8c3b650911a733252e86f2606';
const PAYSTACK_SECRET_KEY = 'sk_test_43bf8faed077c1339b6400db403161f414492c71';

// Immediately stop any loaders when script loads
(function() {
    console.log('🚀 Payment script loaded - stopping any loaders immediately');
    
    // Force remove loading states
    if (document.body) {
        document.body.classList.remove('loading', 'is-loading');
        document.body.style.pointerEvents = 'auto';
        document.body.style.overflow = 'auto';
    }
    
    if (document.documentElement) {
        document.documentElement.classList.remove('loading', 'is-loading');
    }
    
    // Hide any visible loaders immediately
    setTimeout(() => {
        const loaders = document.querySelectorAll('.loading, .loader, .loading-spinner, .spinner, [class*="loading"], [class*="spinner"]');
        loaders.forEach(loader => {
            loader.style.display = 'none';
            loader.style.visibility = 'hidden';
            loader.style.opacity = '0';
        });
    }, 100);
})();

// Initialize Paystack with error handling
let paystack = null;

// Check if Paystack is available when script loads
let paystackInitAttempts = 0;
const MAX_PAYSTACK_ATTEMPTS = 10;

function initializePaystack() {
    paystackInitAttempts++;
    
    if (typeof PaystackPop === 'undefined') {
        if (paystackInitAttempts < MAX_PAYSTACK_ATTEMPTS) {
            console.warn(`Paystack.js not yet loaded, retry ${paystackInitAttempts}/${MAX_PAYSTACK_ATTEMPTS}...`);
            setTimeout(initializePaystack, 500);
            return false;
        } else {
            console.error('Paystack.js failed to load after maximum attempts');
            paystack = null;
            return false;
        }
    } else {
        try {
            paystack = PaystackPop;
            console.log('Paystack initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing Paystack:', error);
            paystack = null;
            return false;
        }
    }
}

// Start Paystack initialization
initializePaystack();

// Test payment gateway status
function testPaymentGatewayStatus() {
    console.log('🔍 Testing Payment Gateway Status...');
    
    const statusResults = {
        paystackScript: false,
        paystackObject: false,
        publicKey: false,
        networkConnection: false,
        formElements: false
    };
    
    // Test 1: Check if Paystack script is loaded
    const paystackScript = document.querySelector('script[src*="paystack"]');
    if (paystackScript) {
        statusResults.paystackScript = true;
        console.log('✅ Paystack script tag found');
    } else {
        console.log('❌ Paystack script tag not found');
    }
    
    // Test 2: Check if PaystackPop object is available
    if (typeof PaystackPop !== 'undefined' && PaystackPop) {
        statusResults.paystackObject = true;
        console.log('✅ PaystackPop object is available');
        
        // Test PaystackPop.setup function
        if (typeof PaystackPop.setup === 'function') {
            console.log('✅ PaystackPop.setup function is available');
        } else {
            console.log('❌ PaystackPop.setup function not found');
        }
    } else {
        console.log('❌ PaystackPop object not available');
    }
    
    // Test 3: Validate public key
    if (PAYSTACK_PUBLIC_KEY && PAYSTACK_PUBLIC_KEY.startsWith('pk_')) {
        statusResults.publicKey = true;
        console.log('✅ Paystack public key format is valid');
        console.log('🔑 Using key:', PAYSTACK_PUBLIC_KEY.substring(0, 10) + '...');
        
        if (PAYSTACK_PUBLIC_KEY.includes('test')) {
            console.log('🧪 Test mode detected (good for development)');
        } else {
            console.log('🚀 Live mode detected');
        }
    } else {
        console.log('❌ Invalid Paystack public key format');
    }
    
    // Test 4: Check network connectivity (simple test)
    fetch('https://api.paystack.co/bank', { method: 'GET' })
        .then(response => {
            if (response.status === 200) {
                statusResults.networkConnection = true;
                console.log('✅ Paystack API is reachable');
            } else {
                console.log('⚠️ Paystack API responded with status:', response.status);
            }
        })
        .catch(error => {
            console.log('❌ Network connection to Paystack API failed:', error.message);
        });
    
    // Test 5: Check form elements
    const requiredElements = [
        'payment-form',
        'billing-email',
        'billing-first-name',
        'billing-last-name'
    ];
    
    let elementsFound = 0;
    requiredElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            elementsFound++;
        } else {
            console.log(`❌ Required element not found: ${elementId}`);
        }
    });
    
    if (elementsFound === requiredElements.length) {
        statusResults.formElements = true;
        console.log('✅ All required form elements found');
    } else {
        console.log(`❌ Missing ${requiredElements.length - elementsFound} required form elements`);
    }
    
    // Overall status
    const allTestsPassed = Object.values(statusResults).every(test => test === true);
    
    if (allTestsPassed) {
        console.log('🎉 Payment Gateway Status: ALL SYSTEMS GO!');
        showPaymentGatewayStatus('success', 'Payment gateway is ready and functional');
    } else {
        const failedTests = Object.keys(statusResults).filter(key => !statusResults[key]);
        console.log('⚠️ Payment Gateway Status: ISSUES DETECTED');
        console.log('Failed tests:', failedTests);
        showPaymentGatewayStatus('warning', `Payment gateway has issues: ${failedTests.join(', ')}`);
    }
    
    return statusResults;
}

// Show payment gateway status in UI
function showPaymentGatewayStatus(type, message) {
    // Create status indicator
    const statusIndicator = document.createElement('div');
    statusIndicator.id = 'payment-gateway-status';
    statusIndicator.className = `payment-status ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'times-circle';
    
    statusIndicator.innerHTML = `
        <div class="status-content">
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
            <button onclick="runPaymentGatewayTest()" class="test-btn">Test Again</button>
        </div>
    `;
    
    // Add styles
    statusIndicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        ${type === 'success' ? 'background: #28a745;' : type === 'warning' ? 'background: #ffc107; color: #000;' : 'background: #dc3545;'}
    `;
    
    statusIndicator.querySelector('.status-content').style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    statusIndicator.querySelector('.test-btn').style.cssText = `
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: inherit;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
    `;
    
    // Remove existing status indicator
    const existing = document.getElementById('payment-gateway-status');
    if (existing) {
        existing.remove();
    }
    
    // Add to page
    document.body.appendChild(statusIndicator);
    
    // Auto remove after 10 seconds
    setTimeout(() => {
        if (statusIndicator.parentElement) {
            statusIndicator.remove();
        }
    }, 10000);
}

// Function to manually test payment gateway
function runPaymentGatewayTest() {
    console.log('🔄 Running manual payment gateway test...');
    testPaymentGatewayStatus();
}

// Add test payment function for debugging
function testPaystackPayment() {
    console.log('🧪 Running test payment (this will not charge real money)...');
    
    if (!paystack) {
        showToast('Paystack not initialized. Cannot run test.', 'error');
        return;
    }
    
    try {
        const testPaymentData = {
            key: PAYSTACK_PUBLIC_KEY,
            email: 'test@example.com',
            amount: 100, // 1 Naira in kobo (minimum amount)
            currency: 'NGN',
            firstname: 'Test',
            lastname: 'User',
            ref: 'test_' + Date.now(),
            metadata: {
                custom_fields: [
                    {
                        display_name: "Test Payment",
                        variable_name: "test_payment",
                        value: "This is a test payment"
                    }
                ]
            },
            callback: function(response) {
                console.log('✅ Test payment callback received:', response);
                showToast('Test payment successful! Gateway is working.', 'success');
            },
            onClose: function() {
                console.log('🔒 Test payment modal closed');
                showToast('Test payment modal closed', 'info');
            }
        };
        
        console.log('Setting up test payment with data:', testPaymentData);
        
        const handler = paystack.setup(testPaymentData);
        
        console.log('✅ Test payment setup successful. Gateway is functional!');
        showToast('Test payment modal should appear. Use test card: 4084084084084081', 'info');
        
    } catch (error) {
        console.error('❌ Test payment failed:', error);
        showToast('Test payment failed: ' + error.message, 'error');
    }
}

// Payment variables
let paymentTransaction = null;
let orderData = {};

// Initialize payment page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Payment page DOM loaded, initializing...');
    
    // Force stop any loading states immediately
    stopAllLoaders();
    
    // Ensure all modals are hidden on page load
    hideProcessingModal();
    hideSuccessModal();
    
    // Remove any potential overlays or loading states
    document.body.style.pointerEvents = 'auto';
    document.body.style.overflow = 'auto';
    
    // Ensure form is interactive
    const form = document.getElementById('payment-form');
    if (form) {
        form.style.pointerEvents = 'auto';
        console.log('Payment form enabled for interaction');
    }
    
    // Enable all input fields
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.disabled = false;
        input.readOnly = false;
    });
    
    // Test payment gateway status
    testPaymentGatewayStatus();
    
    initializePayment();
    setupPaymentForm();
    setupEventListeners();
    loadOrderSummary();
    
    console.log('Payment page initialization complete');
});

// Initialize payment functionality
function initializePayment() {
    console.log('Initializing payment page...');
    
    // Check if cart has items
    const cart = getCart();
    console.log('Cart contents:', cart);
    
    if (!cart || cart.length === 0) {
        console.log('Cart is empty, but continuing for demo purposes');
        // For demo purposes, create a sample cart item
        const sampleCart = [{
            id: 1,
            name: "Arduino Uno R3",
            price: 29.99,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop"
        }];
        localStorage.setItem('cart', JSON.stringify(sampleCart));
        console.log('Created sample cart for demo');
    }
    
    console.log('Payment page initialized successfully');
    
    // Update cart count in header
    updateCartCount();
}

// Setup payment form
function setupPaymentForm() {
    // Check if Paystack is properly initialized
    if (!paystack) {
        console.error('Paystack not properly initialized');
        showToast('Payment system unavailable. Please refresh the page.', 'error');
        return;
    }

    try {
        // Hide the Stripe card element section since we're using Paystack
        const cardPayment = document.getElementById('card-payment');
        if (cardPayment) {
            // Replace card element with Paystack info
            const cardElement = document.getElementById('card-element');
            if (cardElement) {
                cardElement.innerHTML = `
                    <div class="paystack-info">
                        <p><i class="fas fa-credit-card"></i> Secure payment powered by Paystack</p>
                        <p class="payment-note">You'll be redirected to a secure payment page when you click "Complete Payment"</p>
                    </div>
                `;
            }
            
            // Hide card errors div since we won't need it
            const cardErrors = document.getElementById('card-errors');
            if (cardErrors) {
                cardErrors.style.display = 'none';
            }
        }
        
        console.log('Payment form setup completed');
    } catch (error) {
        console.error('Error setting up payment form:', error);
        showToast('Error setting up payment form. Please refresh the page.', 'error');
    }
}

// Setup event listeners
function setupEventListeners() {
    const paymentForm = document.getElementById('payment-form');
    paymentForm.addEventListener('submit', handlePaymentSubmit);
    
    // Payment method toggle
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', togglePaymentMethod);
    });
    
    // Same as billing address toggle
    const sameAsBilling = document.getElementById('same-as-billing');
    sameAsBilling.addEventListener('change', toggleShippingAddress);
}

// Load order summary from cart
function loadOrderSummary() {
    const cart = getCart();
    const orderItemsContainer = document.getElementById('order-items');
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const finalTotalElement = document.getElementById('final-total');
    
    let subtotal = 0;
    
    // Clear existing items
    orderItemsContainer.innerHTML = '';
    
    // Add each cart item to order summary
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <div class="order-item-info">
                <h4>${item.name}</h4>
                <p>Qty: ${item.quantity} × $${item.price.toFixed(2)}</p>
            </div>
            <div class="order-item-total">
                $${itemTotal.toFixed(2)}
            </div>
        `;
        orderItemsContainer.appendChild(orderItem);
    });
    
    // Calculate totals
    const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
    const taxRate = 0.08; // 8% tax rate
    const tax = subtotal * taxRate;
    const total = subtotal + shipping + tax;
    
    // Update display
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    taxElement.textContent = `$${tax.toFixed(2)}`;
    finalTotalElement.textContent = `$${total.toFixed(2)}`;
    
    // Store order data
    orderData = {
        items: cart,
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        total: total
    };
}

// Toggle payment method display
function togglePaymentMethod() {
    const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;
    const cardPayment = document.getElementById('card-payment');
    const paypalPayment = document.getElementById('paypal-payment');
    const bankTransferPayment = document.getElementById('bank-transfer-payment');
    const submitButton = document.getElementById('submit-payment');
    const submitButtonText = document.getElementById('submit-button-text');
    
    // Hide all payment method forms first
    cardPayment.style.display = 'none';
    paypalPayment.style.display = 'none';
    if (bankTransferPayment) bankTransferPayment.style.display = 'none';
    
    // Show the selected payment method
    if (selectedMethod === 'card') {
        cardPayment.style.display = 'block';
        submitButtonText.textContent = 'Complete Payment';
        submitButton.querySelector('i').className = 'fas fa-lock';
    } else if (selectedMethod === 'paypal') {
        paypalPayment.style.display = 'block';
        submitButtonText.textContent = 'Complete Payment';
        submitButton.querySelector('i').className = 'fas fa-lock';
        initializePayPal();
    } else if (selectedMethod === 'bank-transfer') {
        if (bankTransferPayment) bankTransferPayment.style.display = 'block';
        submitButtonText.textContent = 'Download Invoice for Transfer';
        submitButton.querySelector('i').className = 'fas fa-download';
    }
}

// Toggle shipping address form
function toggleShippingAddress() {
    const sameAsBilling = document.getElementById('same-as-billing').checked;
    const shippingForm = document.getElementById('shipping-form');
    const shippingInputs = shippingForm.querySelectorAll('input');
    
    if (sameAsBilling) {
        shippingForm.style.display = 'none';
        shippingInputs.forEach(input => {
            input.removeAttribute('required');
        });
    } else {
        shippingForm.style.display = 'block';
        shippingInputs.forEach(input => {
            if (input.type !== 'tel') {
                input.setAttribute('required', 'required');
            }
        });
    }
}

// Handle payment form submission
async function handlePaymentSubmit(event) {
    event.preventDefault();
    console.log('Payment form submitted!');
    
    const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;
    console.log('Selected payment method:', selectedMethod);
    
    if (selectedMethod === 'card') {
        console.log('Processing Paystack payment...');
        await processPaystackPayment();
    } else if (selectedMethod === 'paypal') {
        // PayPal will handle submission through its own flow
        showToast('Please complete payment through PayPal', 'info');
    } else if (selectedMethod === 'bank-transfer') {
        console.log('Processing bank transfer...');
        generateBankTransferInvoice();
    }
}

// Process Paystack payment
async function processPaystackPayment() {
    try {
        console.log('processPaystackPayment function called');
        
        // Check if Paystack is available
        if (!paystack) {
            console.error('Paystack not available:', paystack);
            throw new Error('Payment system not properly initialized. Please refresh the page.');
        }
        
        console.log('Paystack is available:', paystack);

        // Validate form first
        if (!validatePaymentForm()) {
            console.log('Form validation failed');
            return;
        }
        
        console.log('Form validation passed');
        
        // Get billing details
        const billingDetails = getBillingDetails();
        console.log('Billing details:', billingDetails);
        
        // Prepare payment data
        const paymentData = {
            key: PAYSTACK_PUBLIC_KEY,
            email: billingDetails.email,
            amount: Math.round(orderData.total * 100), // Amount in kobo
            currency: 'NGN', // Paystack primarily works with Nigerian Naira
            firstname: billingDetails.name.split(' ')[0],
            lastname: billingDetails.name.split(' ').slice(1).join(' '),
            ref: 'ord_' + Date.now() + '_' + Math.floor(Math.random() * 1000), // Generate unique reference
            metadata: {
                custom_fields: [
                    {
                        display_name: "Order Items",
                        variable_name: "order_items",
                        value: orderData.items.length + " items"
                    },
                    {
                        display_name: "Phone",
                        variable_name: "phone",
                        value: billingDetails.phone
                    }
                ]
            },
            callback: function(response) {
                // Payment successful
                console.log('Payment callback received:', response);
                handlePaystackSuccess(response);
            },
            onClose: function() {
                // Payment was closed/cancelled
                console.log('Payment modal was closed');
                showToast('Payment was cancelled', 'warning');
            }
        };
        
        console.log('Payment data prepared:', paymentData);
        
        // Open Paystack payment modal
        console.log('Attempting to call paystack.setup...');
        const handler = paystack.setup({
            key: PAYSTACK_PUBLIC_KEY,
            email: paymentData.email,
            amount: paymentData.amount,
            currency: paymentData.currency,
            ref: paymentData.ref,
            firstname: paymentData.firstname,
            lastname: paymentData.lastname,
            channels: ['card'], // Explicitly set payment channels
            label: 'ElectroStore Order Payment', // Add a clear label
            metadata: paymentData.metadata,
            callback: paymentData.callback,
            onClose: paymentData.onClose
        });
        
        console.log('Paystack setup called, handler:', handler);
        
        // Simple check for modal after payment setup
        setTimeout(() => {
            console.log('Paystack payment modal should now be active');
            const paystackIframes = document.querySelectorAll('iframe[src*="paystack"]');
            if (paystackIframes.length > 0) {
                console.log(`Found ${paystackIframes.length} Paystack iframe(s)`);
            }
        }, 1000);
        
    } catch (error) {
        console.error('Error in processPaystackPayment:', error);
        showToast(error.message, 'error');
    }
}

// Handle Paystack payment success
async function handlePaystackSuccess(response) {
    try {
        showProcessingModal();
        
        // Verify payment on server (simulate)
        const verificationResult = await verifyPaystackPayment(response.reference);
        
        hideProcessingModal();
        
        if (verificationResult.success) {
            // Create order record
            const orderNumber = 'ORD-' + Date.now();
            
            // Clear cart
            clearCart();
            updateCartCount();
            
            // Show success modal
            const paymentData = {
                id: response.reference,
                status: 'succeeded',
                amount: orderData.total
            };
            showSuccessModal(orderNumber, paymentData);
            
            // Send confirmation email (simulate)
            await sendConfirmationEmail(orderNumber);
            
            showToast('Payment successful! Order confirmation sent.', 'success');
        } else {
            throw new Error(verificationResult.error || 'Payment verification failed');
        }
        
    } catch (error) {
        hideProcessingModal();
        console.error('Post-payment processing error:', error);
        showToast('Payment verification failed. Please contact support.', 'error');
    }
}

// Verify Paystack payment (simulate server call)
async function verifyPaystackPayment(reference) {
    // IMPORTANT: In a real application, this would be a call to your server
    // Your server would verify the payment using Paystack's secret key
    // 
    // Example server endpoint call:
    // const response = await fetch('/verify-payment', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ reference: reference })
    // });
    // return await response.json();
    
    // For demo purposes, we'll simulate a successful verification
    // In production, replace this with actual server call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                data: {
                    reference: reference,
                    status: 'success',
                    amount: orderData.total * 100
                }
            });
        }, 1000);
    });
}

// Create payment intent (simulate server call)
async function createPaymentIntent(amount) {
    // IMPORTANT: In a real application, this would be a call to your server
    // Your server would use the secret key stored securely in environment variables
    // 
    // Example server endpoint call:
    // const response = await fetch('/create-payment-intent', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ amount: Math.round(amount * 100) }) // Amount in cents
    // });
    // return await response.json();
    
    // For demo purposes, we'll simulate a successful response
    // In production, replace this with actual server call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                client_secret: 'pi_test_client_secret_' + Math.random().toString(36).substr(2, 9),
                payment_intent_id: 'pi_' + Math.random().toString(36).substr(2, 15)
            });
        }, 1000);
    });
}

// Get billing details from form
function getBillingDetails() {
    return {
        name: `${document.getElementById('billing-first-name').value} ${document.getElementById('billing-last-name').value}`,
        email: document.getElementById('billing-email').value,
        phone: document.getElementById('billing-phone').value,
        address: {
            line1: document.getElementById('billing-address').value,
            city: document.getElementById('billing-city').value,
            state: document.getElementById('billing-state').value,
            postal_code: document.getElementById('billing-zip').value,
            country: document.getElementById('billing-country').value,
        },
    };
}

// Validate payment form
function validatePaymentForm() {
    const requiredFields = [
        'billing-first-name',
        'billing-last-name',
        'billing-email',
        'billing-address',
        'billing-city',
        'billing-state',
        'billing-zip'
    ];
    
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        const formGroup = field.closest('.form-group');
        
        if (!field.value.trim()) {
            formGroup.classList.add('error');
            isValid = false;
        } else {
            formGroup.classList.remove('error');
        }
    });
    
    // Validate email format
    const email = document.getElementById('billing-email').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
        document.getElementById('billing-email').closest('.form-group').classList.add('error');
        isValid = false;
    }
    
    // Check shipping address if not same as billing
    const sameAsBilling = document.getElementById('same-as-billing').checked;
    if (!sameAsBilling) {
        const shippingFields = [
            'shipping-first-name',
            'shipping-last-name',
            'shipping-address',
            'shipping-city',
            'shipping-state',
            'shipping-zip'
        ];
        
        shippingFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const formGroup = field.closest('.form-group');
            
            if (!field.value.trim()) {
                formGroup.classList.add('error');
                isValid = false;
            } else {
                formGroup.classList.remove('error');
            }
        });
    }
    
    if (!isValid) {
        showToast('Please fill in all required fields', 'error');
    }
    
    return isValid;
}

// Handle successful payment
async function handlePaymentSuccess(paymentData) {
    try {
        // Create order record (simulate server call)
        const orderNumber = 'ORD-' + Date.now();
        
        // Clear cart
        clearCart();
        updateCartCount();
        
        // Show success modal
        showSuccessModal(orderNumber, paymentData);
        
        // Send confirmation email (simulate)
        await sendConfirmationEmail(orderNumber);
        
        showToast('Payment successful! Order confirmation sent.', 'success');
        
    } catch (error) {
        console.error('Post-payment processing error:', error);
        showToast('Payment successful, but there was an issue with order processing. Please contact support.', 'warning');
    }
}

// Initialize PayPal (placeholder for PayPal SDK integration)
function initializePayPal() {
    // In a real implementation, you would load PayPal SDK and create buttons
    const paypalContainer = document.getElementById('paypal-button-container');
    paypalContainer.innerHTML = `
        <div class="paypal-placeholder">
            <i class="fab fa-paypal"></i>
            <p>PayPal integration would be implemented here</p>
            <button class="btn-primary" onclick="simulatePayPalPayment()">
                Simulate PayPal Payment
            </button>
        </div>
    `;
}

// Simulate PayPal payment for demo
function simulatePayPalPayment() {
    showProcessingModal();
    
    setTimeout(() => {
        hideProcessingModal();
        const mockPaymentIntent = {
            id: 'paypal_' + Math.random().toString(36).substr(2, 15),
            status: 'succeeded'
        };
        handlePaymentSuccess(mockPaymentIntent);
    }, 2000);
}

// Send confirmation email (simulate)
async function sendConfirmationEmail(orderNumber) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Confirmation email sent for order ${orderNumber}`);
            resolve();
        }, 500);
    });
}

// Show processing modal
function showProcessingModal() {
    try {
        const modal = document.getElementById('processing-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    } catch (error) {
        console.warn('Failed to show processing modal:', error);
    }
}

// Hide processing modal
function hideProcessingModal() {
    try {
        const modal = document.getElementById('processing-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    } catch (error) {
        console.warn('Failed to hide processing modal:', error);
    }
}

// Show success modal
function showSuccessModal(orderNumber, paymentData) {
    const modal = document.getElementById('success-modal');
    const orderDetails = document.getElementById('success-order-details');
    
    orderDetails.innerHTML = `
        <div class="order-summary-success">
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Payment ID:</strong> ${paymentData.id}</p>
            <p><strong>Amount:</strong> $${orderData.total.toFixed(2)}</p>
            <p><strong>Status:</strong> Confirmed</p>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Hide success modal
function hideSuccessModal() {
    try {
        const modal = document.getElementById('success-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    } catch (error) {
        console.warn('Failed to hide success modal:', error);
    }
}

// Navigation functions
function goToHome() {
    window.location.href = 'index.html';
}

function downloadInvoice() {
    try {
        // Get order data from the last successful payment
        const cart = getCart();
        const currentDate = new Date();
        const invoiceNumber = 'INV-' + Date.now();
        
        // Create PDF document
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Company header
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('ElectroStore', 20, 30);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('Electronics Components & Batteries', 20, 40);
        doc.text('123 Tech Boulevard, Silicon Valley, CA', 20, 47);
        doc.text('Phone: +1 (555) 123-4567', 20, 54);
        doc.text('Email: info@electrostore.com', 20, 61);
        
        // Invoice title and details
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('INVOICE', 150, 30);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Invoice #: ${invoiceNumber}`, 150, 40);
        doc.text(`Date: ${currentDate.toLocaleDateString()}`, 150, 47);
        doc.text(`Due Date: ${new Date(currentDate.getTime() + 30*24*60*60*1000).toLocaleDateString()}`, 150, 54);
        
        // Bill to section
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Bill To:', 20, 80);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        
        // Get billing details from form if available
        const firstName = document.getElementById('billing-first-name')?.value || 'Customer';
        const lastName = document.getElementById('billing-last-name')?.value || '';
        const email = document.getElementById('billing-email')?.value || 'customer@email.com';
        const address = document.getElementById('billing-address')?.value || '';
        const city = document.getElementById('billing-city')?.value || '';
        const state = document.getElementById('billing-state')?.value || '';
        const zip = document.getElementById('billing-zip')?.value || '';
        
        doc.text(`${firstName} ${lastName}`, 20, 90);
        if (email) doc.text(email, 20, 97);
        if (address) doc.text(address, 20, 104);
        if (city || state || zip) doc.text(`${city}, ${state} ${zip}`, 20, 111);
        
        // Items table header
        const startY = 130;
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        
        // Table headers
        doc.text('Item', 20, startY);
        doc.text('Qty', 120, startY);
        doc.text('Price', 140, startY);
        doc.text('Total', 170, startY);
        
        // Draw header line
        doc.line(20, startY + 2, 190, startY + 2);
        
        // Items
        doc.setFont(undefined, 'normal');
        let yPosition = startY + 10;
        let subtotal = 0;
        
        // Use current cart or sample data if cart is empty
        const invoiceItems = cart.length > 0 ? cart : [{
            name: "Arduino Uno R3",
            price: 29.99,
            quantity: 1
        }];
        
        invoiceItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            // Truncate long item names
            const itemName = item.name.length > 40 ? item.name.substring(0, 37) + '...' : item.name;
            
            doc.text(itemName, 20, yPosition);
            doc.text(item.quantity.toString(), 120, yPosition);
            doc.text(`$${item.price.toFixed(2)}`, 140, yPosition);
            doc.text(`$${itemTotal.toFixed(2)}`, 170, yPosition);
            
            yPosition += 8;
        });
        
        // Totals section
        const totalsStartY = yPosition + 10;
        doc.line(20, totalsStartY - 5, 190, totalsStartY - 5);
        
        const shipping = subtotal > 50 ? 0 : 5.99;
        const taxRate = 0.08;
        const tax = subtotal * taxRate;
        const total = subtotal + shipping + tax;
        
        doc.text('Subtotal:', 140, totalsStartY);
        doc.text(`$${subtotal.toFixed(2)}`, 170, totalsStartY);
        
        doc.text('Shipping:', 140, totalsStartY + 8);
        doc.text(shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`, 170, totalsStartY + 8);
        
        doc.text('Tax (8%):', 140, totalsStartY + 16);
        doc.text(`$${tax.toFixed(2)}`, 170, totalsStartY + 16);
        
        doc.setFont(undefined, 'bold');
        doc.text('Total:', 140, totalsStartY + 24);
        doc.text(`$${total.toFixed(2)}`, 170, totalsStartY + 24);
        
        // Footer
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text('Thank you for your business!', 20, 260);
        doc.text('Payment Terms: Net 30 days', 20, 267);
        doc.text('For questions about this invoice, please contact us at info@electrostore.com', 20, 274);
        
        // Save the PDF
        doc.save(`ElectroStore_Invoice_${invoiceNumber}.pdf`);
        
        showToast('Invoice downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating invoice:', error);
        showToast('Error generating invoice. Please try again.', 'error');
    }
}

// Print invoice function
function printInvoice() {
    try {
        // Create a printable HTML version of the invoice
        const currentDate = new Date();
        const invoiceNumber = 'INV-' + Date.now();
        
        // Get billing details
        const firstName = document.getElementById('billing-first-name')?.value || 'Customer';
        const lastName = document.getElementById('billing-last-name')?.value || '';
        const email = document.getElementById('billing-email')?.value || 'customer@email.com';
        const address = document.getElementById('billing-address')?.value || '';
        const city = document.getElementById('billing-city')?.value || '';
        const state = document.getElementById('billing-state')?.value || '';
        const zip = document.getElementById('billing-zip')?.value || '';
        
        // Get cart items
        const cart = getCart();
        const invoiceItems = cart.length > 0 ? cart : [{
            name: "Arduino Uno R3",
            price: 29.99,
            quantity: 1
        }];
        
        let subtotal = 0;
        let itemsHTML = '';
        
        invoiceItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            itemsHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">$${item.price.toFixed(2)}</td>
                    <td style="text-align: right;">$${itemTotal.toFixed(2)}</td>
                </tr>
            `;
        });
        
        const shipping = subtotal > 50 ? 0 : 5.99;
        const taxRate = 0.08;
        const tax = subtotal * taxRate;
        const total = subtotal + shipping + tax;
        
        // Create printable HTML
        const printHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice ${invoiceNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
                    .company-info h1 { margin: 0; color: #333; }
                    .company-info p { margin: 2px 0; color: #666; }
                    .invoice-info { text-align: right; }
                    .invoice-info h2 { margin: 0; color: #333; }
                    .invoice-info p { margin: 2px 0; color: #666; }
                    .bill-to { margin: 20px 0; }
                    .bill-to h3 { margin-bottom: 10px; color: #333; }
                    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .items-table th, .items-table td { padding: 10px; border-bottom: 1px solid #ddd; }
                    .items-table th { background-color: #f5f5f5; font-weight: bold; }
                    .totals { margin-top: 20px; text-align: right; }
                    .totals table { margin-left: auto; }
                    .totals td { padding: 5px 10px; }
                    .total-final { font-weight: bold; border-top: 2px solid #333; }
                    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="company-info">
                        <h1>ElectroStore</h1>
                        <p>Electronics Components & Batteries</p>
                        <p>123 Tech Boulevard, Silicon Valley, CA</p>
                        <p>Phone: +1 (555) 123-4567</p>
                        <p>Email: info@electrostore.com</p>
                    </div>
                    <div class="invoice-info">
                        <h2>INVOICE</h2>
                        <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
                        <p><strong>Date:</strong> ${currentDate.toLocaleDateString()}</p>
                        <p><strong>Due Date:</strong> ${new Date(currentDate.getTime() + 30*24*60*60*1000).toLocaleDateString()}</p>
                    </div>
                </div>
                
                <div class="bill-to">
                    <h3>Bill To:</h3>
                    <p><strong>${firstName} ${lastName}</strong></p>
                    ${email ? `<p>${email}</p>` : ''}
                    ${address ? `<p>${address}</p>` : ''}
                    ${city || state || zip ? `<p>${city}, ${state} ${zip}</p>` : ''}
                </div>
                
                <table class="items-table">
                    <thead>
                        <tr>
                            <th style="text-align: left;">Item</th>
                            <th style="text-align: center;">Qty</th>
                            <th style="text-align: right;">Price</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>
                
                <div class="totals">
                    <table>
                        <tr>
                            <td>Subtotal:</td>
                            <td style="text-align: right;">$${subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Shipping:</td>
                            <td style="text-align: right;">${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Tax (8%):</td>
                            <td style="text-align: right;">$${tax.toFixed(2)}</td>
                        </tr>
                        <tr class="total-final">
                            <td><strong>Total:</strong></td>
                            <td style="text-align: right;"><strong>$${total.toFixed(2)}</strong></td>
                        </tr>
                    </table>
                </div>
                
                <div class="footer">
                    <p><strong>Thank you for your business!</strong></p>
                    <p>Payment Terms: Net 30 days</p>
                    <p>For questions about this invoice, please contact us at info@electrostore.com</p>
                </div>
                
                <div class="no-print" style="margin-top: 20px; text-align: center;">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Invoice</button>
                    <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
                </div>
            </body>
            </html>
        `;
        
        // Open print window
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(printHTML);
        printWindow.document.close();
        printWindow.focus();
        
        showToast('Invoice opened for printing!', 'success');
        
    } catch (error) {
        console.error('Error generating print invoice:', error);
        showToast('Error generating print invoice. Please try again.', 'error');
    }
}

// Generate Bank Transfer Invoice (PDF Download)
function generateBankTransferInvoice() {
    try {
        // Check if billing info is filled
        const firstName = document.getElementById('billing-first-name')?.value;
        const lastName = document.getElementById('billing-last-name')?.value;
        const email = document.getElementById('billing-email')?.value;
        
        if (!firstName || !lastName || !email) {
            showToast('Please fill in your billing information first.', 'error');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('ElectroStore', 20, 30);
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text('Electronics Components & Batteries', 20, 38);
        doc.text('123 Tech Boulevard, Silicon Valley, CA', 20, 45);
        doc.text('Phone: +1 (555) 123-4567', 20, 52);
        doc.text('Email: info@electrostore.com', 20, 59);
        
        // Invoice details
        const currentDate = new Date();
        const invoiceNumber = 'BANK-' + Date.now();
        
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('PROFORMA INVOICE', 140, 30);
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Invoice #: ${invoiceNumber}`, 140, 40);
        doc.text(`Date: ${currentDate.toLocaleDateString()}`, 140, 47);
        doc.text(`Due: Upon Bank Transfer`, 140, 54);
        
        // Customer details
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Bill To:', 20, 80);
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        const customerName = `${firstName} ${lastName}`;
        const customerEmail = email;
        const address = document.getElementById('billing-address')?.value || '';
        const city = document.getElementById('billing-city')?.value || '';
        const state = document.getElementById('billing-state')?.value || '';
        const zip = document.getElementById('billing-zip')?.value || '';
        
        doc.text(customerName, 20, 90);
        if (customerEmail) doc.text(customerEmail, 20, 97);
        if (address) doc.text(address, 20, 104);
        if (city || state || zip) doc.text(`${city}, ${state} ${zip}`, 20, 111);
        
        // Bank Transfer Details
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Bank Transfer Details:', 140, 80);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('Bank Name: First National Bank', 140, 90);
        doc.text('Account Name: ElectroStore Ltd.', 140, 97);
        doc.text('Account Number: 1234567890', 140, 104);
        doc.text('Routing Number: 123456789', 140, 111);
        doc.text('SWIFT Code: FNBKUS33', 140, 118);
        doc.text(`Reference: ${invoiceNumber}`, 140, 125);
        
        // Items table
        const cart = getCart();
        const invoiceItems = cart.length > 0 ? cart : [{
            name: "Arduino Uno R3",
            price: 29.99,
            quantity: 1
        }];
        
        let yPosition = 140;
        
        // Table header
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Item', 20, yPosition);
        doc.text('Qty', 120, yPosition);
        doc.text('Price', 140, yPosition);
        doc.text('Total', 170, yPosition);
        
        doc.line(20, yPosition + 2, 190, yPosition + 2);
        yPosition += 10;
        
        // Table rows
        doc.setFont(undefined, 'normal');
        let subtotal = 0;
        
        invoiceItems.forEach(item => {
            const total = item.price * item.quantity;
            subtotal += total;
            
            doc.text(item.name, 20, yPosition);
            doc.text(item.quantity.toString(), 120, yPosition);
            doc.text(`$${item.price.toFixed(2)}`, 140, yPosition);
            doc.text(`$${total.toFixed(2)}`, 170, yPosition);
            yPosition += 8;
        });
        
        // Totals
        yPosition += 10;
        const shipping = subtotal >= 50 ? 0 : 5.99;
        const tax = subtotal * 0.08;
        const total = subtotal + shipping + tax;
        
        doc.line(140, yPosition, 190, yPosition);
        yPosition += 8;
        
        doc.text('Subtotal:', 140, yPosition);
        doc.text(`$${subtotal.toFixed(2)}`, 170, yPosition);
        yPosition += 8;
        
        doc.text('Shipping:', 140, yPosition);
        doc.text(shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`, 170, yPosition);
        yPosition += 8;
        
        doc.text('Tax (8%):', 140, yPosition);
        doc.text(`$${tax.toFixed(2)}`, 170, yPosition);
        yPosition += 8;
        
        doc.setFont(undefined, 'bold');
        doc.text('Total:', 140, yPosition);
        doc.text(`$${total.toFixed(2)}`, 170, yPosition);
        
        // Payment instructions
        yPosition += 20;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Payment Instructions:', 20, yPosition);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        yPosition += 10;
        doc.text('1. Transfer the exact amount to the bank account above', 20, yPosition);
        yPosition += 7;
        doc.text(`2. Use invoice number ${invoiceNumber} as transfer reference`, 20, yPosition);
        yPosition += 7;
        doc.text('3. Email transfer receipt to: payments@electrostore.com', 20, yPosition);
        yPosition += 7;
        doc.text('4. We will process your order within 24 hours of payment confirmation', 20, yPosition);
        
        // Footer
        yPosition += 20;
        doc.setFont(undefined, 'bold');
        doc.text('Thank you for choosing ElectroStore!', 20, yPosition);
        
        // Save the PDF
        doc.save(`ElectroStore_BankTransfer_Invoice_${invoiceNumber}.pdf`);
        
        showToast('Bank transfer invoice downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating bank transfer invoice:', error);
        showToast('Error generating invoice. Please ensure jsPDF is loaded.', 'error');
    }
}

// Print Bank Transfer Invoice
function printBankTransferInvoice() {
    try {
        // Check if billing info is filled
        const firstName = document.getElementById('billing-first-name')?.value;
        const lastName = document.getElementById('billing-last-name')?.value;
        const email = document.getElementById('billing-email')?.value;
        
        if (!firstName || !lastName || !email) {
            showToast('Please fill in your billing information first.', 'error');
            return;
        }
        
        const currentDate = new Date();
        const invoiceNumber = 'BANK-' + Date.now();
        
        // Get customer details
        const customerName = `${firstName} ${lastName}`;
        const address = document.getElementById('billing-address')?.value || '';
        const city = document.getElementById('billing-city')?.value || '';
        const state = document.getElementById('billing-state')?.value || '';
        const zip = document.getElementById('billing-zip')?.value || '';
        
        // Get cart items
        const cart = getCart();
        const invoiceItems = cart.length > 0 ? cart : [{
            name: "Arduino Uno R3",
            price: 29.99,
            quantity: 1
        }];
        
        let subtotal = 0;
        let itemsHTML = '';
        
        invoiceItems.forEach(item => {
            const total = item.price * item.quantity;
            subtotal += total;
            itemsHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">$${item.price.toFixed(2)}</td>
                    <td style="text-align: right;">$${total.toFixed(2)}</td>
                </tr>
            `;
        });
        
        const shipping = subtotal >= 50 ? 0 : 5.99;
        const tax = subtotal * 0.08;
        const total = subtotal + shipping + tax;
        
        const printHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bank Transfer Invoice - ${invoiceNumber}</title>
                <style>
                    @media print {
                        .no-print { display: none !important; }
                        body { margin: 0; }
                    }
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #007bff; padding-bottom: 20px; }
                    .company-info h1 { color: #007bff; margin: 0; }
                    .company-info p { margin: 5px 0; color: #666; }
                    .invoice-info h2 { color: #007bff; margin: 0; }
                    .invoice-info p { margin: 5px 0; }
                    .bill-to { margin: 20px 0; }
                    .bill-to h3 { color: #333; margin: 0 0 10px 0; }
                    .bank-details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    .bank-details h3 { color: #007bff; margin: 0 0 10px 0; }
                    .bank-details p { margin: 5px 0; }
                    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; }
                    .items-table th { background: #f8f9fa; font-weight: bold; }
                    .totals { margin: 20px 0; text-align: right; }
                    .totals table { margin-left: auto; }
                    .totals td { padding: 5px 10px; }
                    .total-final { border-top: 2px solid #333; font-weight: bold; }
                    .instructions { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    .instructions h4 { color: #856404; margin: 0 0 10px 0; }
                    .instructions ol { margin: 10px 0; padding-left: 20px; }
                    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="company-info">
                        <h1>ElectroStore</h1>
                        <p>Electronics Components & Batteries</p>
                        <p>123 Tech Boulevard, Silicon Valley, CA</p>
                        <p>Phone: +1 (555) 123-4567</p>
                        <p>Email: info@electrostore.com</p>
                    </div>
                    <div class="invoice-info">
                        <h2>PROFORMA INVOICE</h2>
                        <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
                        <p><strong>Date:</strong> ${currentDate.toLocaleDateString()}</p>
                        <p><strong>Payment:</strong> Bank Transfer</p>
                    </div>
                </div>
                
                <div class="bill-to">
                    <h3>Bill To:</h3>
                    <p><strong>${customerName}</strong></p>
                    ${email ? `<p>${email}</p>` : ''}
                    ${address ? `<p>${address}</p>` : ''}
                    ${city || state || zip ? `<p>${city}, ${state} ${zip}</p>` : ''}
                </div>
                
                <div class="bank-details">
                    <h3>Bank Transfer Details</h3>
                    <p><strong>Bank Name:</strong> First National Bank</p>
                    <p><strong>Account Name:</strong> ElectroStore Ltd.</p>
                    <p><strong>Account Number:</strong> 1234567890</p>
                    <p><strong>Routing Number:</strong> 123456789</p>
                    <p><strong>SWIFT Code:</strong> FNBKUS33</p>
                    <p><strong>Transfer Reference:</strong> ${invoiceNumber}</p>
                </div>
                
                <table class="items-table">
                    <thead>
                        <tr>
                            <th style="text-align: left;">Item</th>
                            <th style="text-align: center;">Qty</th>
                            <th style="text-align: right;">Price</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>
                
                <div class="totals">
                    <table>
                        <tr>
                            <td>Subtotal:</td>
                            <td style="text-align: right;">$${subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Shipping:</td>
                            <td style="text-align: right;">${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Tax (8%):</td>
                            <td style="text-align: right;">$${tax.toFixed(2)}</td>
                        </tr>
                        <tr class="total-final">
                            <td><strong>Total Amount to Transfer:</strong></td>
                            <td style="text-align: right;"><strong>$${total.toFixed(2)}</strong></td>
                        </tr>
                    </table>
                </div>
                
                <div class="instructions">
                    <h4>Payment Instructions:</h4>
                    <ol>
                        <li>Transfer the exact amount of <strong>$${total.toFixed(2)}</strong> to the bank account above</li>
                        <li>Use invoice number <strong>${invoiceNumber}</strong> as the transfer reference</li>
                        <li>Email the transfer receipt to: <strong>payments@electrostore.com</strong></li>
                        <li>We will process and ship your order within 24 hours of payment confirmation</li>
                        <li>You will receive an order confirmation email once payment is verified</li>
                    </ol>
                </div>
                
                <div class="footer">
                    <p><strong>Thank you for choosing ElectroStore!</strong></p>
                    <p>For questions about this invoice, please contact us at info@electrostore.com</p>
                </div>
                
                <div class="no-print" style="margin-top: 20px; text-align: center;">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Invoice</button>
                    <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
                </div>
            </body>
            </html>
        `;
        
        // Open print window
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(printHTML);
        printWindow.document.close();
        printWindow.focus();
        
        showToast('Bank transfer invoice opened for printing!', 'success');
        
    } catch (error) {
        console.error('Error generating print invoice:', error);
        showToast('Error generating print invoice. Please try again.', 'error');
    }
}

// Utility functions
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function clearCart() {
    localStorage.removeItem('cart');
}

function updateCartCount() {
    const cart = getCart();
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
}

function showToast(message, type = 'info') {
    try {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            console.warn('Toast container not found, logging message instead:', message);
            return;
        }
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    } catch (error) {
        console.warn('Failed to show toast:', message, error);
    }
}

function getToastIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Global function for easy testing in browser console
window.checkPaymentGateway = function() {
    console.log('🚀 Payment Gateway Diagnostic Report');
    console.log('=====================================');
    
    const report = testPaymentGatewayStatus();
    
    console.log('\n📋 Quick Reference:');
    console.log('- Run: checkPaymentGateway() - Full diagnostic');
    console.log('- Run: testPaystackPayment() - Test payment with ₦1');
    console.log('- Run: runPaymentGatewayTest() - Re-run status check');
    
    console.log('\n🔑 Current Configuration:');
    console.log('- Public Key:', PAYSTACK_PUBLIC_KEY);
    console.log('- Environment:', PAYSTACK_PUBLIC_KEY?.includes('test') ? 'TEST MODE' : 'LIVE MODE');
    console.log('- Paystack Object:', paystack ? 'Available' : 'Not Available');
    
    console.log('\n💳 Test Card Details:');
    console.log('- Card Number: 4084084084084081');
    console.log('- CVV: 408');
    console.log('- Expiry: Any future date (e.g., 12/25)');
    
    return report;
};

// Make test functions globally available
window.testPaystackPayment = testPaystackPayment;
window.runPaymentGatewayTest = runPaymentGatewayTest;

// Function to stop all loaders and loading states
function stopAllLoaders() {
    console.log('🛑 Stopping all loaders and loading states...');
    
    // Remove loading class from body and html
    document.body.classList.remove('loading', 'is-loading');
    document.documentElement.classList.remove('loading', 'is-loading');
    
    // Hide any loading overlays
    const loadingElements = document.querySelectorAll([
        '.loading',
        '.loader',
        '.loading-overlay',
        '.loading-spinner',
        '.spinner',
        '[class*="loading"]',
        '[class*="spinner"]'
    ].join(','));
    
    loadingElements.forEach(element => {
        element.style.display = 'none';
        element.style.visibility = 'hidden';
        element.style.opacity = '0';
        element.remove(); // Remove completely if it's a loading element
    });
    
    // Force hide processing modal
    hideProcessingModal();
    
    // Clear any loading timeouts
    for (let i = 1; i < 99999; i++) {
        window.clearTimeout(i);
    }
    
    // Ensure page is interactive
    document.body.style.pointerEvents = 'auto';
    document.body.style.overflow = 'auto';
    document.body.style.cursor = 'auto';
    
    // Remove any loading styles
    document.body.style.removeProperty('pointer-events');
    document.body.style.removeProperty('overflow');
    
    console.log('✅ All loaders stopped');
}

// Make stopAllLoaders globally available for console access
window.stopAllLoaders = stopAllLoaders;

console.log('💡 Payment Gateway Testing Available!');
console.log('Type: checkPaymentGateway() in console for full diagnostic');
console.log('Type: stopAllLoaders() in console to force stop any loaders');
