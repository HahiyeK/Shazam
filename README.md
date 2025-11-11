# SHAZAM - USAFI COFFEE SHOP App

A modern web-based coffee ordering and management system designed for USAFI COFFEE Shop. This app allows customers to browse the menu, place orders, and enables baristas to manage orders in real-time.

---

## Table of Contents
- [Features](#features)
- [For Customers](#for-customers)
- [For Baristas](#for-baristas)
- [Getting Started](#getting-started)

---

## Features

✅ **User-Friendly Interface** - Intuitive design for easy navigation  
✅ **Real-Time Order Management** - Instant order updates and notifications  
✅ **Cloud Sync (Firebase)** - Orders sync across all devices instantly  
✅ **Secure Barista Dashboard** - Protected access with authentication  
✅ **Order Countdown Timer** - Visual timer to track preparation time  
✅ **Coffee Shop Themed Design** - Beautiful, branded aesthetics  
✅ **Mobile Responsive** - Works seamlessly on all devices  
✅ **Multi-Device Support** - Place orders on phone, manage on laptop  

---

## For Customers

### How to Place an Order

1. **Open the App**
   - Go to the main menu page of the SHAZAM app

2. **Browse the Menu**
   - View available coffee items with names, prices, and descriptions
   - Each item displays its preparation time in minutes

3. **Select an Item**
   - Click on any coffee item to select it
   - You'll see the item details and price

4. **Enter Your Details**
   - **Name**: Enter your full name
   - **Phone Number**: Provide your contact number for pickup notifications
   - **Pickup Time**: Select how many minutes from now you want to pick up your order
   - **Special Instructions** (Optional): Add any special requests (e.g., "extra sugar," "less milk," etc.)

5. **Confirm Your Order**
   - Review all details
   - Click the "Place Order" button to submit

6. **Order Confirmation**
   - Your order is now in the queue
   - The barista will begin preparing your coffee
   - You'll know when your order is ready

7. **Pickup Your Order**
   - When notified, return to the shop to pick up your prepared coffee
   - The barista will hand over your order

### Tips for Customers

- **Timing**: Request pickup times that give the barista enough time to prepare
- **Special Requests**: Be specific with your instructions for the best result
- **Phone Number**: Keep it accessible in case the barista needs to contact you
- **Peak Hours**: Orders may take longer during busy hours

---

## For Baristas

### Accessing the Dashboard

1. **Navigate to Barista Dashboard**
   - Click on "Barista Dashboard" or visit the barista.html page

2. **Login**
   - You'll see the Barista Access login page
   - Enter your credentials:
     - **Username**: Required
     - **Password**: Required
     - **Keyword**: Required (security verification)
   - Click "Login" to access the dashboard
   - *Note: Credentials are provided separately for security*

3. **Dashboard Overview**
   - Once logged in, you'll see the full barista dashboard with:
     - **Total Orders**: Count of all orders
     - **Active Orders**: Orders currently being prepared
     - **Completed Orders**: Orders ready for pickup
     - **Real-Time Order List**: All incoming orders displayed as cards

### Managing Orders

#### Viewing Order Details

Each order card displays:
- **Order Number**: Unique identifier
- **Order Time**: When the order was placed
- **Item Name**: The coffee/drink ordered
- **Price**: Cost of the item
- **Customer Name**: Who placed the order
- **Phone Number**: Customer's contact info
- **Pickup Time**: Minutes until customer arrives
- **Special Instructions**: Any custom requests
- **Countdown Timer**: How much time is left to prepare

#### Marking Orders as Ready

1. **Prepare the Order**
   - Start making the coffee/drink according to specifications
   - Follow any special instructions provided

2. **Check the Timer**
   - Watch the countdown timer on the order card
   - Prepare the order before time expires
   - When timer reaches zero, the system auto-marks as "TIME UP"

3. **Mark as Ready**
   - Click the "✓ Mark Ready" button when the order is completed
   - Order status changes to "✅ READY"
   - Button becomes disabled to prevent duplicate actions

#### Removing Orders

1. **Remove Completed Orders**
   - Once a customer picks up their order, click "🗑️ Remove"
   - Confirm the deletion when prompted
   - Order is removed from the dashboard

2. **Bulk Clear**
   - Use "🗑️ Clear Completed" button to remove all completed orders at once
   - Useful for cleaning up the dashboard during quiet periods

### Dashboard Controls

- **🔄 Refresh**: Manually refresh to see the latest orders
- **🗑️ Clear Completed**: Remove all ready/completed orders at once
- **🚪 Logout**: Safely exit the dashboard when done
- **← Back to Menu**: Return to the main menu

### Dashboard Notifications

- **Sound Alerts**: Receive audio notifications when new orders arrive
- **Toast Messages**: Visual notifications for actions performed
- **Real-Time Updates**: Dashboard automatically refreshes every 2 seconds
- **Order Status Badges**: 
  - 🔄 **ACTIVE** = Currently being prepared (green)
  - ✅ **READY** = Ready for customer pickup (blue)

### Tips for Baristas

1. **Stay Organized**
   - Keep track of multiple orders using the countdown timers
   - Prioritize orders that are running out of time

2. **Accuracy**
   - Always verify customer name and special instructions
   - Double-check the order details before marking as ready

3. **Communication**
   - Use the customer phone number if you need clarification
   - Keep customers informed of delays if necessary

4. **Efficiency**
   - Refresh the dashboard regularly to see incoming orders
   - Clear completed orders to reduce clutter

5. **Security**
   - Always logout when stepping away
   - Keep your credentials confidential
   - Only authorized personnel should access the barista dashboard

---

## Getting Started

### Important: Firebase Setup Required (One Time)

Before using the app, you must configure Firebase Database Rules:

1. Go to https://console.firebase.google.com/
2. Select project: **shazam-coffee**
3. Go to **Build → Realtime Database → Rules tab**
4. Follow instructions in **FIREBASE_SETUP.md**
5. Click **Publish** to save rules

**See FIREBASE_SETUP.md for detailed instructions**

### First Time Setup

1. **For Customers**
   - Open `menu.html` in your web browser
   - Start browsing and placing orders
   - No login required
   - Orders sync to Firebase automatically

2. **For Baristas**
   - Open `barista.html` in your web browser
   - Login with your provided credentials
   - See all orders from all devices in real-time
   - Start managing orders

### Browser Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Local storage enabled (for session management)

### Files Structure

```
Shazam/
├── index.html           # Main landing page
├── menu.html            # Customer menu & ordering interface
├── menu-script.js       # Customer ordering functionality
├── menu-style.css       # Customer interface styling
├── barista.html         # Barista dashboard
├── barista-script.js    # Dashboard functionality & logic
├── barista-style.css    # Dashboard styling
├── favicon.svg          # App icon
└── README.md            # This file
```

---

## Support

For issues or questions:
- Contact the admin or manager at the USAFI COFFEE Shop
- For technical support, reach out to AJM Digital Solution

---

## Version

**SHAZAM v1.0** - Coffee Shop Ordering System  
Made by AJM Digital Solution

---

## License

This application is proprietary software for USAFI COFFEE Shop.

---

## Last Updated

November 2025
