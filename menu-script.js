// Menu functionality
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuSections = document.querySelectorAll('.menu-section');
    const menuItems = document.querySelectorAll('.menu-item');
    
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
            
            // Show/hide section based on if it has matching items
            if (searchTerm === '') {
                section.style.display = 'block';
            } else {
                section.style.display = sectionHasResults ? 'block' : 'none';
            }
        });
        
        // Show "no results" message
        showNoResults(!hasResults && searchTerm !== '');
    });
    
    // Category filter functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get selected category
            const category = this.getAttribute('data-category');
            
            // Clear search input
            searchInput.value = '';
            
            // Filter sections
            menuSections.forEach(section => {
                const sectionCategory = section.getAttribute('data-category');
                const items = section.querySelectorAll('.menu-item');
                
                // Reset all items to visible
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
            
            // Smooth scroll to first visible section
            const firstVisibleSection = document.querySelector('.menu-section:not(.hidden)');
            if (firstVisibleSection && category !== 'all') {
                firstVisibleSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // Menu item click animation
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            this.style.animation = 'pulse 0.3s ease';
            setTimeout(() => {
                this.style.animation = '';
            }, 300);
        });
    });
    
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
    
    // Add pulse animation to CSS dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(0.98); }
        }
    `;
    document.head.appendChild(style);
    
    // Add scroll animations
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
    
    // Add keyboard navigation
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            this.dispatchEvent(new Event('input'));
            this.blur();
        }
    });
    
    // Price sorting (optional feature)
    let sortOrder = 'default';
    
    // Log console message
    console.log('🎉 SHAZAM Barista Menu Loaded Successfully!');
    console.log('📱 Mobile responsive design active');
    console.log('🔍 Search and filter features ready');
});
