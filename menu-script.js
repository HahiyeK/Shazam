// Firebase is initialized in HTML, use the global reference
let database = window.firebaseDB || null;

// Generate unique Device ID for this device
function getOrCreateDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('deviceId', deviceId);
        console.log('🆔 New Device ID created:', deviceId);
    }
    return deviceId;
}

const currentDeviceId = getOrCreateDeviceId();

// Load and display announcements
function loadAnnouncementsOnMenu() {
    if (database) {
        // Listen for latest announcement
        database.ref('announcements').limitToLast(1).on('value', (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const latestKey = Object.keys(data)[Object.keys(data).length - 1];
                const announcement = data[latestKey];
                if (announcement) {
                    displayAnnouncementOnMenu(announcement.message);
                }
            }
        });
    }
}

function displayAnnouncementOnMenu(message) {
    const notifPanel = document.getElementById('customerNotificationsPanel');
    const notifContent = document.getElementById('notificationsContent');

    if (!notifPanel || !notifContent) return;

    // Create announcement element
    const notif = document.createElement('div');
    notif.style.cssText = `
        padding: 15px;
        margin-bottom: 10px;
        background: linear-gradient(135deg, #fff3cd, #fff8e1);
        border-left: 4px solid #ffc107;
        border-radius: 6px;
        font-size: 0.95rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;

    notif.innerHTML = `
        <strong style="color: #ff6f00;">📢 Shop Update</strong><br>
        <span style="color: #333;">${message}</span>
    `;

    // Clear old announcements and add new one at top
    const existingAnnouncements = notifContent.querySelectorAll('[data-type="announcement"]');
    existingAnnouncements.forEach(el => el.remove());

    notif.setAttribute('data-type', 'announcement');
    notifContent.insertBefore(notif, notifContent.firstChild);

    // Show notifications panel
    notifPanel.style.display = 'block';
}

// Menu functionality with Order System
function initializeMenu() {
    // Check if Firebase is available
    if (database) {
        console.log('✅ Firebase initialized successfully');
    } else {
        console.warn('⚠️ Firebase SDK not loaded. Using offline mode (localStorage).');
    }
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
    let orders = [];
    let selectedItem = null;
    let countdownIntervals = {};
    let firebaseListener = null;

    // Load orders from Firebase or localStorage fallback
    function loadOrdersFromFirebase() {
        // Try Firebase first
        if (database) {
            try {
                if (firebaseListener) {
                    firebaseListener.off();
                }
                firebaseListener = database.ref('orders').on('value', function (snapshot) {
                    const data = snapshot.val();
                    const allOrders = data ? Object.values(data) : [];
                    // Filter to only show orders from this device
                    orders = allOrders.filter(o => o.deviceId === currentDeviceId);
                    console.log('📱 Filtered orders for this device. Total in Firebase:', allOrders.length, 'This device:', orders.length);
                    updateOrdersDisplay();
                    checkForCompletedOrders();
                }, function (error) {
                    console.error('Firebase error:', error);
                    loadFromLocalStorage(); // Fallback
                });
            } catch (error) {
                console.error('Error loading from Firebase:', error);
                loadFromLocalStorage(); // Fallback
            }
        } else {
            // Firebase not available, use localStorage
            loadFromLocalStorage();
        }
    }

    // Check for completed orders and show notifications
    function checkForCompletedOrders() {
        orders.forEach(order => {
            if (order.status === 'completed' && !order.notificationShown) {
                showOrderCompletionNotification(order);
                // Mark notification as shown
                if (database) {
                    database.ref('orders/' + order.id).update({ notificationShown: true });
                }
            }
        });
    }

    // Show order completion notification
    function showOrderCompletionNotification(order) {
        const notifPanel = document.getElementById('customerNotificationsPanel');
        const notifContent = document.getElementById('notificationsContent');

        // Show panel if hidden
        notifPanel.style.display = 'block';

        // Create notification element
        const notif = document.createElement('div');
        notif.style.cssText = `
            padding: 12px;
            margin-bottom: 10px;
            background: #f5e6d3;
            border-left: 4px solid #4CAF50;
            border-radius: 6px;
            font-size: 0.95rem;
        `;

        notif.innerHTML = `
            <strong style="color: #4CAF50;">✓ Order Ready!</strong><br>
            <span style="color: #3e2723;">${order.itemName} for <strong>${order.customerName}</strong> is ready for pickup!</span>
        `;

        notifContent.insertBefore(notif, notifContent.firstChild);

        // Auto-remove notification after 10 seconds
        setTimeout(() => {
            notif.style.opacity = '0.5';
        }, 8000);
    }

    // Toggle notifications panel
    window.toggleNotificationsPanel = function () {
        const panel = document.getElementById('customerNotificationsPanel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }

    // Load from localStorage (fallback)
    function loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('coffeeOrders');
            const allOrders = stored ? JSON.parse(stored) : [];
            // Filter to only show orders from this device
            orders = allOrders.filter(o => o.deviceId === currentDeviceId);
            updateOrdersDisplay();
            console.log('📱 Loaded orders from local storage (offline mode). This device orders:', orders.length);
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            orders = [];
            updateOrdersDisplay();
        }
    }

    // Initialize
    loadOrdersFromFirebase();
    loadAnnouncementsOnMenu();

    // Search functionality
    searchInput.addEventListener('input', function (e) {
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
        btn.addEventListener('click', function () {
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
        item.addEventListener('click', function () {
            const itemName = this.querySelector('.item-name').textContent;
            const itemPrice = this.querySelector('.item-price').textContent;
            const itemImage = this.getAttribute('data-image');

            selectedItem = {
                name: itemName,
                price: itemPrice,
                image: itemImage
            };

            selectedItemName.textContent = itemName;
            selectedItemPrice.textContent = itemPrice;
            
            // Set the image if available
            const itemImageElement = document.getElementById('selectedItemImage');
            if (itemImageElement && itemImage) {
                itemImageElement.src = 'images/' + itemImage;
            }

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

    orderModal.addEventListener('click', function (e) {
        if (e.target === orderModal) {
            closeOrderModal();
        }
    });

    // Check if ordering is allowed (6 AM to midnight)
    function isOrderingTimeAllowed() {
        const now = new Date();
        const hour = now.getHours();
        // System accepts orders from 06:00 AM to 00:00 (midnight)
        // 6 AM = hour 6, Midnight = hour 0 (of next day)
        // So allow if: hour >= 6 (6 AM onwards)
        return hour >= 6;
    }

    // Handle order form submission
    orderForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const customerName = document.getElementById('customerName').value.trim();
        const customerPhone = document.getElementById('customerPhone').value.trim();
        const pickupTime = parseInt(document.getElementById('pickupTime').value);
        const specialInstructions = document.getElementById('specialInstructions').value.trim();

        if (!customerName || !customerPhone || !pickupTime) {
            showNotification('❌ Please fill in all required fields.');
            return;
        }

        // Check if ordering is allowed
        if (!isOrderingTimeAllowed()) {
            showNotification('❌ Sorry! Ordering is not available right now. We accept orders from 6:00 AM to 12:00 AM (midnight). Please try again during business hours.');
            return;
        }

        // Create order
        const orderId = Date.now().toString();
        const order = {
            id: orderId,
            itemName: selectedItem.name,
            itemPrice: selectedItem.price,
            customerName: customerName,
            customerPhone: customerPhone,
            pickupMinutes: pickupTime,
            specialInstructions: specialInstructions,
            orderTime: new Date().toISOString(),
            endTime: new Date(Date.now() + pickupTime * 60000).toISOString(),
            status: 'active',
            deviceId: currentDeviceId  // Tag order with this device
        };

        // Save to Firebase or localStorage
        if (database) {
            // Try Firebase first
            try {
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Request timeout')), 10000)
                );

                Promise.race([
                    database.ref('orders/' + orderId).set(order),
                    timeoutPromise
                ]).then(() => {
                    closeOrderModal();
                    showNotification(`✅ Order placed successfully! Your ${order.itemName} will be ready in ${pickupTime} minutes.`);

                    // Auto-open orders panel
                    setTimeout(() => {
                        activeOrdersContainer.style.display = 'block';
                    }, 500);
                }).catch((error) => {
                    console.error('Firebase save failed, trying localStorage:', error);
                    saveToLocalStorage(order);
                });
            } catch (error) {
                console.error('Error saving to Firebase:', error);
                saveToLocalStorage(order);
            }
        } else {
            // Firebase not available, save to localStorage
            saveToLocalStorage(order);
        }
    });

    // Save order to localStorage (fallback)
    function saveToLocalStorage(order) {
        try {
            let stored = localStorage.getItem('coffeeOrders');
            let ordersList = stored ? JSON.parse(stored) : [];
            ordersList.push(order);
            localStorage.setItem('coffeeOrders', JSON.stringify(ordersList));

            closeOrderModal();
            showNotification(`✅ Order placed successfully (offline)! Your ${order.itemName} will be ready in ${order.pickupMinutes} minutes.`);

            // Auto-open orders panel and reload
            setTimeout(() => {
                activeOrdersContainer.style.display = 'block';
                loadFromLocalStorage();
            }, 500);
        } catch (error) {
            showNotification('❌ Failed to save order.');
            console.error('Error saving to localStorage:', error);
        }
    }

    // Update orders display
    function updateOrdersDisplay() {
        // Clear intervals
        Object.values(countdownIntervals).forEach(interval => clearInterval(interval));
        countdownIntervals = {};

        // Remove expired orders
        const now = Date.now();
        const ordersToKeep = [];

        orders.forEach(order => {
            const endTime = new Date(order.endTime).getTime();
            if (now - endTime < 3600000) { // Keep for 1 hour after ready
                ordersToKeep.push(order);
            } else {
                // Delete expired orders from Firebase
                if (database) {
                    database.ref('orders/' + order.id).remove();
                }
            }
        });

        orders = ordersToKeep;

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
            <button class="cancel-order-btn" onclick="cancelOrder('${order.id}')">Cancel Order</button>
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

                // Update status in Firebase
                if (database) {
                    database.ref('orders/' + order.id + '/status').set('ready');
                }

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
    window.cancelOrder = function (orderId) {
        if (confirm('Are you sure you want to cancel this order?')) {
            if (database) {
                // Try Firebase first
                database.ref('orders/' + orderId).remove().then(() => {
                    showNotification('Order cancelled successfully');
                }).catch((error) => {
                    console.error('Firebase delete failed, trying localStorage:', error);
                    cancelOrderLocal(orderId);
                });
            } else {
                // Use localStorage
                cancelOrderLocal(orderId);
            }
        }
    };

    // Cancel order from localStorage
    function cancelOrderLocal(orderId) {
        try {
            let stored = localStorage.getItem('coffeeOrders');
            let ordersList = stored ? JSON.parse(stored) : [];
            ordersList = ordersList.filter(o => o.id !== orderId);
            localStorage.setItem('coffeeOrders', JSON.stringify(ordersList));
            showNotification('Order cancelled successfully');
            loadFromLocalStorage();
        } catch (error) {
            showNotification('❌ Failed to cancel order.');
            console.error('Error cancelling order:', error);
        }
    }

    // Toggle orders panel
    floatingOrdersBtn.addEventListener('click', function () {
        const isVisible = activeOrdersContainer.style.display === 'block';
        activeOrdersContainer.style.display = isVisible ? 'none' : 'block';
    });

    closeOrdersBtn.addEventListener('click', function () {
        activeOrdersContainer.style.display = 'none';
    });

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

    const observer = new IntersectionObserver(function (entries) {
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
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            this.value = '';
            this.dispatchEvent(new Event('input'));
            this.blur();
        }
    });

    // Escape key to close modal
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && orderModal.classList.contains('active')) {
            closeOrderModal();
        }
    });

    console.log('🎉 SHAZAM Coffee Shop App with Firebase Loaded!');
    console.log('📱 Mobile responsive | 🔍 Search & filter | 🛒 Order system active | 🌐 Cloud synced');
}

// Contact info modal toggle
function toggleContactInfo(event) {
    if (event) {
        event.preventDefault();
    }
    const modal = document.getElementById('contact-modal');
    if (modal.style.display === 'none') {
        modal.style.display = 'flex';
    } else {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside of it
window.addEventListener('click', (event) => {
    const modal = document.getElementById('contact-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Initialize menu when script loads (handles both DOMContentLoaded and dynamic loading)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMenu);
} else {
    // DOM already loaded (script loaded dynamically)
    initializeMenu();
}
