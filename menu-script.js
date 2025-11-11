// Menu functionality with Order System
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuSections = document.querySelectorAll('.menu-section');
    const menuItems = document.querySelectorAll('.menu-item');
    
    // Order modal elements
    const orderModal = document.getElementById('orderModal');
    const closeModal = document.getElementById('closeModal');
    const orderForm = document.getElementById('orderForm');
    const selectedItemName = document.getElementById('selectedItemName');
    const selectedItemPrice = document.getElementById('selectedItemPrice');
    
    // Active orders elements
    const activeOrdersContainer = document.getElementById('activeOrdersContainer');
    const activeOrdersList = document.getElementById('activeOrdersList');
    const floatingOrdersBtn = document.getElementById('floatingOrdersBtn');
    const closeOrdersBtn = document.getElementById('closeOrdersBtn');
    const orderCount = document.getElementById('orderCount');
    
    // Order tracking
    let orders = JSON.parse(localStorage.getItem('coffeeOrders')) || [];
    let selectedItem = null;
    let countdownIntervals = {};
    
    // Initialize
    updateOrdersDisplay();
    
    // Search functionality
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        let hasResults = false;
        
        menuSections.forEach(section => {
            const items = section.querySelectorAll('.menu-item');
            let sectionHasResults = false;
            
            items.forEach(item => {
                const itemName = item.querySelector('.item-name').textContent.toLowerCase();
                
                if (itemName.includes(searchTerm)) {
                    item.style.display = 'flex';
                    sectionHasResults = true;
                    hasResults = true;
                } else {
                    item.style.display = 'none';
                }
            });
            
            if (searchTerm === '') {
                section.style.display = 'block';
            } else {
                section.style.display = sectionHasResults ? 'block' : 'none';
            }
        });
        
        showNoResults(!hasResults && searchTerm !== '');
    });
    
    // Category filter functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            searchInput.value = '';
            
            menuSections.forEach(section => {
                const sectionCategory = section.getAttribute('data-category');
                const items = section.querySelectorAll('.menu-item');
                
                items.forEach(item => item.style.display = 'flex');
                
                if (category === 'all') {
                    section.classList.remove('hidden');
                    section.style.display = 'block';
                } else {
                    if (sectionCategory === category) {
                        section.classList.remove('hidden');
                        section.style.display = 'block';
                    } else {
                        section.classList.add('hidden');
                        section.style.display = 'none';
                    }
                }
            });
            
            const firstVisibleSection = document.querySelector('.menu-section:not(.hidden)');
            if (firstVisibleSection && category !== 'all') {
                firstVisibleSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // Menu item click to open order modal
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const itemName = this.querySelector('.item-name').textContent;
            const itemPrice = this.querySelector('.item-price').textContent;
            
            selectedItem = {
                name: itemName,
                price: itemPrice
            };
            
            selectedItemName.textContent = itemName;
            selectedItemPrice.textContent = itemPrice;
            
            openModal();
        });
    });
    
    // Open modal
    function openModal() {
        orderModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Close modal
    function closeOrderModal() {
        orderModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        orderForm.reset();
    }
    
    closeModal.addEventListener('click', closeOrderModal);
    
    orderModal.addEventListener('click', function(e) {
        if (e.target === orderModal) {
            closeOrderModal();
        }
    });
    
    // Handle order form submission
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const customerName = document.getElementById('customerName').value.trim();
        const customerPhone = document.getElementById('customerPhone').value.trim();
        const pickupTime = parseInt(document.getElementById('pickupTime').value);
        const specialInstructions = document.getElementById('specialInstructions').value.trim();
        
        // Create order
        const order = {
            id: Date.now(),
            itemName: selectedItem.name,
            itemPrice: selectedItem.price,
            customerName: customerName,
            customerPhone: customerPhone,
            pickupMinutes: pickupTime,
            specialInstructions: specialInstructions,
            orderTime: new Date().toISOString(),
            endTime: new Date(Date.now() + pickupTime * 60000).toISOString(),
            status: 'active'
        };
        
        orders.push(order);
        saveOrders();
        updateOrdersDisplay();
        
        closeOrderModal();
        
        // Show confirmation
        showNotification(`✅ Order placed successfully! Your ${order.itemName} will be ready in ${pickupTime} minutes.`);
        
        // Auto-open orders panel
        setTimeout(() => {
            activeOrdersContainer.style.display = 'block';
        }, 500);
    });
    
    // Update orders display
    function updateOrdersDisplay() {
        // Clear intervals
        Object.values(countdownIntervals).forEach(interval => clearInterval(interval));
        countdownIntervals = {};
        
        // Remove expired orders
        const now = Date.now();
        orders = orders.filter(order => {
            const endTime = new Date(order.endTime).getTime();
            return now - endTime < 3600000; // Keep for 1 hour after ready
        });
        saveOrders();
        
        // Update count
        const activeCount = orders.filter(o => o.status === 'active').length;
        orderCount.textContent = activeCount;
        
        if (activeCount > 0) {
            floatingOrdersBtn.style.display = 'flex';
        } else {
            floatingOrdersBtn.style.display = 'none';
            activeOrdersContainer.style.display = 'none';
        }
        
        // Render orders
        if (orders.length === 0) {
            activeOrdersList.innerHTML = '<div class="empty-orders">No active orders</div>';
            return;
        }
        
        activeOrdersList.innerHTML = '';
        
        orders.forEach((order, index) => {
            const orderCard = createOrderCard(order, index);
            activeOrdersList.appendChild(orderCard);
            startCountdown(order);
        });
    }
    
    // Create order card
    function createOrderCard(order, index) {
        const card = document.createElement('div');
        card.className = 'order-card';
        card.id = `order-${order.id}`;
        
        const remainingMs = new Date(order.endTime).getTime() - Date.now();
        const isReady = remainingMs <= 0;
        
        card.innerHTML = `
            <div class="order-card-header">
                <span class="order-number">Order #${orders.length - index}</span>
            </div>
            <div class="order-item-name">${order.itemName}</div>
            <div class="order-price">${order.itemPrice}</div>
            <div class="order-customer-info">👤 ${order.customerName}</div>
            <div class="order-customer-info">📱 ${order.customerPhone}</div>
            ${order.specialInstructions ? `<div class="order-customer-info">📝 ${order.specialInstructions}</div>` : ''}
            <div class="countdown-display ${isReady ? 'order-ready' : ''}" id="countdown-${order.id}">
                ${isReady ? '✅ ORDER READY FOR PICKUP!' : '<span class="countdown-time">--:--</span><span class="countdown-label">Time remaining</span>'}
            </div>
            <button class="cancel-order-btn" onclick="cancelOrder(${order.id})">Cancel Order</button>
        `;
        
        return card;
    }
    
    // Start countdown for an order
    function startCountdown(order) {
        const countdownElement = document.getElementById(`countdown-${order.id}`);
        if (!countdownElement) return;
        
        const updateCountdown = () => {
            const now = Date.now();
            const endTime = new Date(order.endTime).getTime();
            const remainingMs = endTime - now;
            
            if (remainingMs <= 0) {
                countdownElement.innerHTML = '✅ ORDER READY FOR PICKUP!';
                countdownElement.classList.add('order-ready');
                clearInterval(countdownIntervals[order.id]);
                
                // Play notification sound (optional)
                showNotification(`🎉 Your ${order.itemName} is ready for pickup!`);
                return;
            }
            
            const totalSeconds = Math.floor(remainingMs / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            
            countdownElement.innerHTML = `
                <span class="countdown-time">${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}</span>
                <span class="countdown-label">Time remaining</span>
            `;
        };
        
        updateCountdown();
        countdownIntervals[order.id] = setInterval(updateCountdown, 1000);
    }
    
    // Cancel order
    window.cancelOrder = function(orderId) {
        if (confirm('Are you sure you want to cancel this order?')) {
            orders = orders.filter(o => o.id !== orderId);
            saveOrders();
            updateOrdersDisplay();
            showNotification('Order cancelled successfully');
        }
    };
    
    // Toggle orders panel
    floatingOrdersBtn.addEventListener('click', function() {
        const isVisible = activeOrdersContainer.style.display === 'block';
        activeOrdersContainer.style.display = isVisible ? 'none' : 'block';
    });
    
    closeOrdersBtn.addEventListener('click', function() {
        activeOrdersContainer.style.display = 'none';
    });
    
    // Save orders to localStorage
    function saveOrders() {
        localStorage.setItem('coffeeOrders', JSON.stringify(orders));
    }
    
    // Show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #5c3d2e, #3e2723);
            color: #ffd89b;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: bold;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Show no results message
    function showNoResults(show) {
        let noResultsMsg = document.querySelector('.no-results');
        
        if (show) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.className = 'no-results';
                noResultsMsg.textContent = '☕ No items found. Try a different search term.';
                document.querySelector('.menu-content').appendChild(noResultsMsg);
            }
            noResultsMsg.style.display = 'block';
        } else {
            if (noResultsMsg) {
                noResultsMsg.style.display = 'none';
            }
        }
    }
    
    // Add animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    menuSections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(section);
    });
    
    // Keyboard navigation
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            this.dispatchEvent(new Event('input'));
            this.blur();
        }
    });
    
    // Escape key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && orderModal.classList.contains('active')) {
            closeOrderModal();
        }
    });
    
    console.log('🎉 SHAZAM Barista Menu with Order System Loaded!');
    console.log('📱 Mobile responsive | 🔍 Search & filter | 🛒 Order system active');
});
