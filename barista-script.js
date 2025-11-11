// Barista Dashboard Script
document.addEventListener('DOMContentLoaded', function() {
    // Login credentials
    const VALID_USERNAME = 'AJM';
    const VALID_PASSWORD = 'ajm';
    const VALID_KEYWORD = 'koffi';
    
    // Login functionality
    const loginModal = document.getElementById('loginModal');
    const dashboardContainer = document.getElementById('dashboardContainer');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    
    // Handle login
    window.handleLogin = function(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const keyword = document.getElementById('keyword').value;
        
        if (username === VALID_USERNAME && password === VALID_PASSWORD && keyword === VALID_KEYWORD) {
            localStorage.setItem('baristaLoggedIn', 'true');
            loginModal.style.display = 'none';
            dashboardContainer.style.display = 'block';
            loginError.textContent = '';
            
            // Clear form
            loginForm.reset();
            
            // Initialize dashboard
            initializeDashboard();
        } else {
            loginError.textContent = '❌ Invalid credentials. Please try again.';
        }
    };
    
    // Add logout functionality
    window.logoutBarista = function() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.setItem('baristaLoggedIn', 'false');
            location.reload();
        }
    };
    
    // Check if user is already logged in
    if (localStorage.getItem('baristaLoggedIn') === 'true') {
        loginModal.style.display = 'none';
        dashboardContainer.style.display = 'block';
        initializeDashboard();
    } else {
        loginModal.style.display = 'flex';
        dashboardContainer.style.display = 'none';
    }
    
    function initializeDashboard() {
        // Elements
    const ordersContainer = document.getElementById('ordersContainer');
    const emptyState = document.getElementById('emptyState');
    const totalOrdersEl = document.getElementById('totalOrders');
    const activeOrdersEl = document.getElementById('activeOrders');
    const completedOrdersEl = document.getElementById('completedOrders');
    const refreshBtn = document.getElementById('refreshBtn');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');
    const notificationSound = document.getElementById('notificationSound');
    
    let orders = [];
    let countdownIntervals = {};
    let lastOrderCount = 0;
    
    // Initialize
    loadOrders();
    updateDisplay();
    
    // Auto-refresh every 2 seconds
    setInterval(() => {
        loadOrders();
        updateDisplay();
    }, 2000);
    
    // Refresh button
    refreshBtn.addEventListener('click', () => {
        loadOrders();
        updateDisplay();
        showToast('✅ Orders refreshed');
    });
    
    // Clear completed button
    clearCompletedBtn.addEventListener('click', () => {
        if (confirm('Clear all completed orders?')) {
            orders = orders.filter(o => o.status !== 'completed' && o.status !== 'ready');
            saveOrders();
            updateDisplay();
            showToast('🗑️ Completed orders cleared');
        }
    });
    
    // Load orders from localStorage
    function loadOrders() {
        const stored = localStorage.getItem('coffeeOrders');
        if (stored) {
            const loadedOrders = JSON.parse(stored);
            
            // Check for new orders
            if (loadedOrders.length > lastOrderCount) {
                playNotification();
                showToast('🔔 New order received!');
            }
            
            lastOrderCount = loadedOrders.length;
            orders = loadedOrders;
        } else {
            orders = [];
        }
    }
    
    // Save orders to localStorage
    function saveOrders() {
        localStorage.setItem('coffeeOrders', JSON.stringify(orders));
    }
    
    // Update display
    function updateDisplay() {
        // Clear intervals
        Object.values(countdownIntervals).forEach(interval => clearInterval(interval));
        countdownIntervals = {};
        
        // Update stats
        const activeCount = orders.filter(o => o.status === 'active').length;
        const completedCount = orders.filter(o => o.status === 'completed' || o.status === 'ready').length;
        
        totalOrdersEl.textContent = orders.length;
        activeOrdersEl.textContent = activeCount;
        completedOrdersEl.textContent = completedCount;
        
        // Show/hide empty state
        if (orders.length === 0) {
            emptyState.classList.remove('hidden');
            ordersContainer.innerHTML = '';
            return;
        } else {
            emptyState.classList.add('hidden');
        }
        
        // Render orders (newest first)
        ordersContainer.innerHTML = '';
        const sortedOrders = [...orders].reverse();
        
        sortedOrders.forEach((order, index) => {
            const orderCard = createOrderCard(order, orders.length - index);
            ordersContainer.appendChild(orderCard);
            
            if (order.status === 'active') {
                startCountdown(order);
            }
        });
    }
    
    // Create order card
    function createOrderCard(order, orderNumber) {
        const card = document.createElement('div');
        card.className = `order-card-barista ${order.status === 'active' ? 'new-order' : 'completed'}`;
        card.id = `barista-order-${order.id}`;
        
        const orderTime = new Date(order.orderTime);
        const timeStr = orderTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        const dateStr = orderTime.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        
        const isReady = order.status === 'ready' || order.status === 'completed';
        const remainingMs = new Date(order.endTime).getTime() - Date.now();
        
        card.innerHTML = `
            <span class="order-status-badge ${order.status === 'active' ? 'active' : 'completed'}">
                ${order.status === 'active' ? '🔄 ACTIVE' : '✅ READY'}
            </span>
            
            <div class="order-header-barista">
                <div class="order-number-barista">Order #${orderNumber}</div>
                <div class="order-time">📅 ${dateStr} at ${timeStr}</div>
            </div>
            
            <div class="order-item-info">
                <div class="item-name-barista">${order.itemName}</div>
                <div class="item-price-barista">${order.itemPrice}</div>
            </div>
            
            <div class="customer-info-section">
                <div class="customer-detail">
                    <strong>👤 Name:</strong>
                    <span>${order.customerName}</span>
                </div>
                <div class="customer-detail">
                    <strong>📱 Phone:</strong>
                    <span>${order.customerPhone}</span>
                </div>
                <div class="customer-detail">
                    <strong>⏰ Pickup:</strong>
                    <span>${order.pickupMinutes} minutes</span>
                </div>
            </div>
            
            ${order.specialInstructions ? `
                <div class="special-instructions">
                    📝 <strong>Special Instructions:</strong><br>
                    ${order.specialInstructions}
                </div>
            ` : ''}
            
            <div class="countdown-barista ${isReady ? 'ready' : ''}" id="barista-countdown-${order.id}">
                ${isReady ? '✅ ORDER READY!' : '<span class="countdown-time-barista">--:--</span><span class="countdown-label-barista">Time remaining</span>'}
            </div>
            
            <div class="order-actions">
                <button class="action-btn mark-ready-btn" onclick="markOrderReady(${order.id})" ${isReady ? 'disabled' : ''}>
                    ${isReady ? '✅ Completed' : '✓ Mark Ready'}
                </button>
                <button class="action-btn remove-order-btn" onclick="removeOrder(${order.id})">
                    🗑️ Remove
                </button>
            </div>
        `;
        
        return card;
    }
    
    // Start countdown
    function startCountdown(order) {
        const countdownEl = document.getElementById(`barista-countdown-${order.id}`);
        if (!countdownEl) return;
        
        const updateCountdown = () => {
            const now = Date.now();
            const endTime = new Date(order.endTime).getTime();
            const remainingMs = endTime - now;
            
            if (remainingMs <= 0) {
                countdownEl.innerHTML = '✅ TIME UP - READY TO SERVE!';
                countdownEl.classList.add('ready');
                clearInterval(countdownIntervals[order.id]);
                
                // Auto-mark as ready when time is up
                if (order.status === 'active') {
                    markOrderReady(order.id);
                }
                return;
            }
            
            const totalSeconds = Math.floor(remainingMs / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            
            countdownEl.innerHTML = `
                <span class="countdown-time-barista">${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}</span>
                <span class="countdown-label-barista">Time remaining</span>
            `;
        };
        
        updateCountdown();
        countdownIntervals[order.id] = setInterval(updateCountdown, 1000);
    }
    
    // Mark order ready
    window.markOrderReady = function(orderId) {
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;
        
        orders[orderIndex].status = 'ready';
        orders[orderIndex].completedTime = new Date().toISOString();
        
        saveOrders();
        updateDisplay();
        
        showToast(`✅ Order #${orders.length - orderIndex} marked as ready!`);
        playNotification();
    };
    
    // Remove order
    window.removeOrder = function(orderId) {
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;
        
        const orderNumber = orders.length - orderIndex;
        
        if (confirm(`Remove Order #${orderNumber}?`)) {
            orders = orders.filter(o => o.id !== orderId);
            saveOrders();
            updateDisplay();
            showToast(`🗑️ Order #${orderNumber} removed`);
        }
    };
    
    // Play notification sound
    function playNotification() {
        try {
            notificationSound.play().catch(e => console.log('Audio play failed:', e));
        } catch (e) {
            console.log('Audio not supported');
        }
    }
    
    // Show toast notification
    function showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #5c3d2e, #3e2723);
            color: #ffd89b;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: bold;
            animation: slideInRight 0.3s ease;
            border: 2px solid #d4a574;
            max-width: 300px;
            font-size: 1.1rem;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // Add animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    console.log('🎉 Barista Dashboard Loaded!');
    console.log('📊 Real-time order monitoring active');
    }
});
