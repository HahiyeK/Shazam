// Simple zoom functionality for the menu image
const menuImage = document.getElementById('menu-image');
let isZoomed = false;

menuImage.addEventListener('click', () => {
    if (isZoomed) {
        menuImage.style.transform = 'scale(1)';
        isZoomed = false;
    } else {
        menuImage.style.transform = 'scale(1.5)';
        isZoomed = true;
    }
});

// Add touch support for mobile devices
menuImage.addEventListener('touchstart', (e) => {
    e.preventDefault();
    menuImage.click();
});

// Generate QR code using qrcode.js library
const qrCodeContainer = document.getElementById('qrcode');
const qr = qrcode(0, 'M');
qr.addData('http://localhost:8000/index.html'); // URL to the menu page
qr.make();
qrCodeContainer.innerHTML = qr.createImgTag(5, 10);
