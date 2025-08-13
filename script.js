// Product Data
const products = [
    {
        id: 1,
        name: "Arduino Uno R3",
        category: "arduino",
        price: 29.99,
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop",
        description: "The classic Arduino board for beginners and professionals alike.",
        specs: ["ATmega328P microcontroller", "14 digital pins", "6 analog inputs", "USB connection"],
        rating: 4.8,
        stock: 150
    },
    {
        id: 2,
        name: "Lithium Ion Battery 18650",
        category: "batteries",
        price: 12.99,
        image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=300&h=200&fit=crop",
        description: "High-capacity rechargeable lithium-ion battery.",
        specs: ["3.7V nominal voltage", "3000mAh capacity", "Protected circuit", "Rechargeable"],
        rating: 4.6,
        stock: 300
    },
    {
        id: 3,
        name: "DHT22 Temperature Sensor",
        category: "sensors",
        price: 8.99,
        image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&h=200&fit=crop",
        description: "Digital temperature and humidity sensor.",
        specs: ["Temperature range: -40 to 80°C", "Humidity range: 0-100%", "Digital output", "3.3V-5V operation"],
        rating: 4.7,
        stock: 200
    },
    {
        id: 4,
        name: "ESP32 Development Board",
        category: "modules",
        price: 19.99,
        image: "https://images.unsplash.com/photo-1587564604792-77e4b99e3c4e?w=300&h=200&fit=crop",
        description: "WiFi and Bluetooth enabled microcontroller.",
        specs: ["Dual-core processor", "WiFi 802.11 b/g/n", "Bluetooth 4.2", "GPIO pins"],
        rating: 4.9,
        stock: 120
    },
    {
        id: 5,
        name: "Ultrasonic Sensor HC-SR04",
        category: "sensors",
        price: 5.99,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
        description: "Ultrasonic distance measurement sensor.",
        specs: ["Range: 2cm - 400cm", "Frequency: 40kHz", "5V operation", "Easy to use"],
        rating: 4.5,
        stock: 180
    },
    {
        id: 6,
        name: "Raspberry Pi 4 Model B",
        category: "modules",
        price: 75.99,
        image: "https://images.unsplash.com/photo-1551703599-6b3e8379aa8c?w=300&h=200&fit=crop",
        description: "Single-board computer for advanced projects.",
        specs: ["Quad-core ARM processor", "4GB RAM", "WiFi & Bluetooth", "Multiple USB ports"],
        rating: 4.9,
        stock: 80
    },
    {
        id: 7,
        name: "Breadboard 830 Tie Points",
        category: "tools",
        price: 6.99,
        image: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=300&h=200&fit=crop",
        description: "Solderless breadboard for prototyping.",
        specs: ["830 tie points", "Self-adhesive back", "Color-coded rails", "High-quality contacts"],
        rating: 4.4,
        stock: 250
    },
    {
        id: 8,
        name: "LED Strip WS2812B",
        category: "modules",
        price: 24.99,
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop",
        description: "Addressable RGB LED strip.",
        specs: ["60 LEDs/meter", "5V operation", "Individually addressable", "Flexible PCB"],
        rating: 4.6,
        stock: 90
    },
    {
        id: 9,
        name: "Power Supply Module",
        category: "modules",
        price: 15.99,
        image: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=300&h=200&fit=crop",
        description: "Adjustable voltage power supply module.",
        specs: ["Input: 6-20V", "Output: 1.25-18V", "Max current: 3A", "Voltage display"],
        rating: 4.3,
        stock: 110
    },
    {
        id: 10,
        name: "Servo Motor SG90",
        category: "modules",
        price: 9.99,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
        description: "Micro servo motor for robotics projects.",
        specs: ["180° rotation", "4.8-6V operation", "Plastic gears", "Light weight"],
        rating: 4.2,
        stock: 200
    }
];

// Shopping Cart
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentPage = 1;
const productsPerPage = 9;

// DOM Elements
const cartCount = document.querySelector('.cart-count');
const cartModal = document.getElementById('cart-modal');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const productsGrid = document.getElementById('products-grid');
const toastContainer = document.getElementById('toast-container');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    updateCartCount();
    
    const productsGrid = document.getElementById('products-grid');
    console.log('Products grid element:', productsGrid);
    
    if (productsGrid) {
        console.log('Products grid found, displaying products...');
        // Display only first 6 products on homepage, all products on products page
        const isProductsPage = window.location.pathname.includes('products.html');
        const productsToShow = isProductsPage ? products : products.slice(0, 6);
        console.log('Products to show:', productsToShow.length);
        displayProducts(productsToShow);
        
        // Backup method: Add products with simple HTML if grid doesn't work
        setTimeout(() => {
            if (productsGrid.children.length === 0) {
                console.log('No products displayed, trying backup method...');
                productsGrid.innerHTML = `
                    <div class="product-card">
                        <div class="product-image">
                            <img src="https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop" alt="Arduino Uno R3">
                        </div>
                        <div class="product-info">
                            <h3 class="product-title">Arduino Uno R3</h3>
                            <p class="product-description">The classic Arduino board for beginners and professionals alike.</p>
                            <div class="product-price">$29.99</div>
                            <button class="btn-primary add-to-cart">Add to Cart</button>
                        </div>
                    </div>
                    <div class="product-card">
                        <div class="product-image">
                            <img src="https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=300&h=200&fit=crop" alt="Lithium Battery">
                        </div>
                        <div class="product-info">
                            <h3 class="product-title">Lithium Ion Battery 18650</h3>
                            <p class="product-description">High-capacity rechargeable lithium-ion battery.</p>
                            <div class="product-price">$12.99</div>
                            <button class="btn-primary add-to-cart">Add to Cart</button>
                        </div>
                    </div>
                    <div class="product-card">
                        <div class="product-image">
                            <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&h=200&fit=crop" alt="DHT22 Sensor">
                        </div>
                        <div class="product-info">
                            <h3 class="product-title">DHT22 Temperature Sensor</h3>
                            <p class="product-description">Digital temperature and humidity sensor.</p>
                            <div class="product-price">$8.99</div>
                            <button class="btn-primary add-to-cart">Add to Cart</button>
                        </div>
                    </div>
                    <div class="product-card">
                        <div class="product-image">
                            <img src="https://images.unsplash.com/photo-1587564604792-77e4b99e3c4e?w=300&h=200&fit=crop" alt="ESP32 Board">
                        </div>
                        <div class="product-info">
                            <h3 class="product-title">ESP32 Development Board</h3>
                            <p class="product-description">WiFi and Bluetooth enabled microcontroller.</p>
                            <div class="product-price">$19.99</div>
                            <button class="btn-primary add-to-cart">Add to Cart</button>
                        </div>
                    </div>
                    <div class="product-card">
                        <div class="product-image">
                            <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop" alt="Ultrasonic Sensor">
                        </div>
                        <div class="product-info">
                            <h3 class="product-title">Ultrasonic Sensor HC-SR04</h3>
                            <p class="product-description">Ultrasonic distance measurement sensor.</p>
                            <div class="product-price">$5.99</div>
                            <button class="btn-primary add-to-cart">Add to Cart</button>
                        </div>
                    </div>
                    <div class="product-card">
                        <div class="product-image">
                            <img src="https://images.unsplash.com/photo-1551703599-6b3e8379aa8c?w=300&h=200&fit=crop" alt="Raspberry Pi">
                        </div>
                        <div class="product-info">
                            <h3 class="product-title">Raspberry Pi 4 Model B</h3>
                            <p class="product-description">Single-board computer for advanced projects.</p>
                            <div class="product-price">$75.99</div>
                            <button class="btn-primary add-to-cart">Add to Cart</button>
                        </div>
                    </div>
                `;
            }
        }, 500);
    } else {
        console.log('Products grid element not found!');
    }
    
    initializeModals();
});

// Product Display Functions
function displayProducts(productsToShow, page = 1) {
    if (!productsGrid) {
        console.log('Products grid element not found');
        return;
    }
    
    console.log('Displaying products:', productsToShow.length);
    
    // Clear any existing content
    productsGrid.innerHTML = '';
    
    // Check if we're on the products page
    const isProductsPage = document.body.classList.contains('products-page');
    
    // Apply different grid styles based on page
    if (isProductsPage) {
        // Products page: 3 columns
        productsGrid.className = 'products-grid';
        productsGrid.style.cssText = `
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 1.5rem !important;
            margin-top: 0 !important;
            width: 100% !important;
            box-sizing: border-box !important;
        `;
    } else {
        // Homepage: responsive columns
        productsGrid.className = 'products-grid';
        productsGrid.style.cssText = `
            display: grid !important;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
            gap: 1.5rem !important;
            margin-top: 2rem !important;
            width: 100% !important;
            box-sizing: border-box !important;
        `;
    }
    
    // Set attributes for extra safety
    productsGrid.setAttribute('style', productsGrid.style.cssText);
    
    const startIndex = (page - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = productsToShow.slice(startIndex, endIndex);
    
    if (paginatedProducts.length === 0) {
        productsGrid.innerHTML = '<p class="no-products">No products found.</p>';
        return;
    }
    
    paginatedProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
    
    // Force a reflow to ensure styles are applied
    productsGrid.offsetHeight;
    
    // Update pagination if on products page
    if (document.getElementById('pagination')) {
        updatePagination(productsToShow.length, page);
    }
    
    console.log('Products displayed successfully');
    console.log('Final grid styles:', window.getComputedStyle(productsGrid).display);
    console.log('Final grid columns:', window.getComputedStyle(productsGrid).gridTemplateColumns);
}

function createProductCard(product) {
    const card = document.createElement('div');
    const isProductsPage = document.body.classList.contains('products-page');
    
    // Add different classes based on page
    if (isProductsPage) {
        card.className = 'product-card products-page-card';
        card.style.cssText = 'display: block; width: 100%; max-width: none;';
    } else {
        card.className = 'product-card';
        card.style.cssText = 'display: block; width: 100%; max-width: none;';
    }
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" onclick="showProductDetail(${product.id})" loading="lazy">
            <div class="product-overlay">
                <button class="btn-primary" onclick="showProductDetail(${product.id})">
                    <i class="fas fa-eye"></i> View Details
                </button>
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-rating">
                ${generateStars(product.rating)}
                <span class="rating-text">(${product.rating})</span>
            </div>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <div class="product-stock">Stock: ${product.stock} units</div>
            <button class="btn-primary add-to-cart" onclick="addToCart(${product.id})">
                <i class="fas fa-cart-plus"></i> Add to Cart
            </button>
        </div>
    `;
    return card;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Product Filtering and Search
function filterProducts(category) {
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Find the clicked button and make it active
    const clickedButton = Array.from(buttons).find(btn => 
        btn.textContent.toLowerCase().includes(category) || 
        (category === 'all' && btn.textContent.toLowerCase() === 'all')
    );
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
    
    const filteredProducts = category === 'all' ? products : products.filter(p => p.category === category);
    console.log(`Filtering by ${category}, found ${filteredProducts.length} products`);
    displayProducts(filteredProducts);
}

function searchProducts() {
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );
    displayProducts(filteredProducts);
}

function sortProducts() {
    const sortBy = document.getElementById('sort-by').value;
    let sortedProducts = [...products];
    
    switch(sortBy) {
        case 'name':
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'price-low':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            sortedProducts.sort((a, b) => b.rating - a.rating);
            break;
    }
    
    displayProducts(sortedProducts);
}

function filterByPrice() {
    const priceRange = document.getElementById('price-range').value;
    let filteredProducts = products;
    
    if (priceRange !== 'all') {
        const [min, max] = priceRange.split('-').map(p => parseFloat(p) || Infinity);
        filteredProducts = products.filter(product => {
            if (max === Infinity) return product.price >= min;
            return product.price >= min && product.price <= max;
        });
    }
    
    displayProducts(filteredProducts);
}

function filterByCategory() {
    const checkboxes = document.querySelectorAll('.category-item input[type="checkbox"]:checked');
    const selectedCategories = Array.from(checkboxes).map(cb => cb.value);
    
    if (selectedCategories.includes('all') || selectedCategories.length === 0) {
        displayProducts(products);
    } else {
        const filteredProducts = products.filter(product => 
            selectedCategories.includes(product.category)
        );
        displayProducts(filteredProducts);
    }
}

// Product Detail Modal
function showProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    const modal = document.getElementById('product-modal');
    const detailContainer = document.getElementById('product-detail');
    
    detailContainer.innerHTML = `
        <div class="product-detail-content">
            <div class="product-detail-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-detail-info">
                <h2>${product.name}</h2>
                <div class="product-rating">
                    ${generateStars(product.rating)}
                    <span>(${product.rating})</span>
                </div>
                <p class="product-description">${product.description}</p>
                <div class="product-specs">
                    <h3>Specifications:</h3>
                    <ul>
                        ${product.specs.map(spec => `<li>${spec}</li>`).join('')}
                    </ul>
                </div>
                <div class="product-price">$${product.price}</div>
                <div class="product-stock">In Stock: ${product.stock} units</div>
                <div class="product-actions">
                    <div class="quantity-selector">
                        <button onclick="changeQuantity(-1)">-</button>
                        <input type="number" id="product-quantity" value="1" min="1" max="${product.stock}">
                        <button onclick="changeQuantity(1)">+</button>
                    </div>
                    <button class="btn-primary" onclick="addToCartFromModal(${product.id})">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}

function changeQuantity(change) {
    const quantityInput = document.getElementById('product-quantity');
    const currentValue = parseInt(quantityInput.value);
    const newValue = currentValue + change;
    const maxValue = parseInt(quantityInput.max);
    
    if (newValue >= 1 && newValue <= maxValue) {
        quantityInput.value = newValue;
    }
}

function addToCartFromModal(productId) {
    const quantity = parseInt(document.getElementById('product-quantity').value);
    addToCart(productId, quantity);
    closeProductModal();
}

// Shopping Cart Functions
function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }
    
    updateCart();
    showToast(`${product.name} added to cart!`, 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    showToast('Item removed from cart', 'info');
}

function updateCartItemQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        updateCart();
    }
}

function updateCart() {
    updateCartCount();
    updateCartDisplay();
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

function updateCartDisplay() {
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotal.textContent = '0.00';
        return;
    }
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-quantity">
                    <button onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
            </div>
            <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItems.appendChild(cartItem);
        total += item.price * item.quantity;
    });
    
    cartTotal.textContent = total.toFixed(2);
}

function clearCart() {
    cart = [];
    updateCart();
    showToast('Cart cleared', 'info');
}

function toggleCart() {
    cartModal.style.display = cartModal.style.display === 'block' ? 'none' : 'block';
    updateCartDisplay();
}

// Pagination
function updatePagination(totalProducts, currentPage) {
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const pagination = document.getElementById('pagination');
    
    if (!pagination || totalPages <= 1) return;
    
    let paginationHTML = '';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button onclick="changePage(${currentPage - 1})">Previous</button>`;
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        paginationHTML += `<button class="${activeClass}" onclick="changePage(${i})">${i}</button>`;
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button onclick="changePage(${currentPage + 1})">Next</button>`;
    }
    
    pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    currentPage = page;
    displayProducts(products, page);
}

// Modal Functions
function initializeModals() {
    // Close modal when clicking outside
    window.onclick = function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    };
}

// Navigation Functions
function scrollToProducts() {
    const productsSection = document.getElementById('products');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        // If on a different page, redirect to home with hash
        window.location.href = 'index.html#products';
    }
}

// Form Functions
function submitContactForm(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    // Simulate form submission
    showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
    event.target.reset();
    
    // In a real application, you would send this data to a server
    console.log('Contact form submitted:', Object.fromEntries(formData));
}

function submitQuickContact(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    showToast('Quick message sent! We\'ll respond shortly.', 'success');
    event.target.reset();
    
    console.log('Quick contact submitted:', Object.fromEntries(formData));
}

// FAQ Functions
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const answer = faqItem.querySelector('.faq-answer');
    const icon = element.querySelector('i');
    
    faqItem.classList.toggle('active');
    
    if (faqItem.classList.contains('active')) {
        answer.style.display = 'block';
        icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
    } else {
        answer.style.display = 'none';
        icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
    }
}

// Checkout Functions
function proceedToCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'error');
        return;
    }
    
    // Close cart modal and redirect to payment page
    toggleCart();
    window.location.href = 'payment.html';
}

function closeCheckout() {
    document.getElementById('checkout-modal').style.display = 'none';
}

function updateCheckoutSummary() {
    const checkoutItems = document.getElementById('checkout-items');
    const subtotalElement = document.getElementById('checkout-subtotal');
    const taxElement = document.getElementById('checkout-tax');
    const shippingElement = document.getElementById('checkout-shipping');
    const totalElement = document.getElementById('checkout-total');
    
    if (!checkoutItems) return;
    
    let subtotal = 0;
    checkoutItems.innerHTML = '';
    
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'checkout-item';
        itemElement.innerHTML = `
            <span>${item.name} x ${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        `;
        checkoutItems.appendChild(itemElement);
        subtotal += item.price * item.quantity;
    });
    
    const tax = subtotal * 0.08; // 8% tax
    const shipping = 9.99;
    const total = subtotal + tax + shipping;
    
    if (subtotalElement) subtotalElement.textContent = subtotal.toFixed(2);
    if (taxElement) taxElement.textContent = tax.toFixed(2);
    if (shippingElement) shippingElement.textContent = shipping.toFixed(2);
    if (totalElement) totalElement.textContent = total.toFixed(2);
}

// Toast Notifications
function showToast(message, type = 'info') {
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${getToastIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close" onclick="removeToast(this)">&times;</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            removeToast(toast.querySelector('.toast-close'));
        }
    }, 3000);
}

function getToastIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

function removeToast(button) {
    const toast = button.parentElement;
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

// Utility Functions
function formatPrice(price) {
    return `$${price.toFixed(2)}`;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add debounced search
const debouncedSearch = debounce(searchProducts, 300);

// Event Listeners
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        // Close any open modals
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }
});

// Smooth scrolling for anchor links
document.addEventListener('click', function(event) {
    if (event.target.tagName === 'A' && event.target.getAttribute('href').startsWith('#')) {
        event.preventDefault();
        const targetId = event.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Initialize page-specific functionality
if (window.location.pathname.includes('products.html')) {
    // Products page specific initialization
    document.addEventListener('DOMContentLoaded', function() {
        displayProducts(products);
    });
}
