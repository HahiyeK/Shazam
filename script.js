// Simple zoom functionality for the menu image
const menuImage = document.getElementById('menu-image');
if (menuImage) {
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
}

// QR code image is now displayed as a static image in the HTML
