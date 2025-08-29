/**
 * Smartphone Deals Data and Display Functions
 * This file contains functions to display smartphone products
 * and handle user interactions for the smartphone deals section.
 */

// API URL for smartphone data
const SMARTPHONE_API_URL = 'https://xf9zlapr5e.execute-api.af-south-1.amazonaws.com/smartphones';

/**
 * Create a product card element for smartphone deals
 * @param {Object} product - The product data
 * @returns {HTMLElement} - The product card element
 */
function createSmartphoneProductCard(product) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-product-id", product.id || product.productId);

    // Check if product has price alerts set
    const priceAlerts = getPriceAlerts ? getPriceAlerts() : [];
    const hasPriceAlert = priceAlerts.some && priceAlerts.some(alert => alert.productId === (product.id || product.productId));

    // Format price display
    const currentPrice = product.currentPrice || product.price || 'N/A';
    const originalPrice = product.originalPrice || product.original_price || '';
    const discount = product.discount || product.discount_percentage || '';

    // Format image URL
    const imageUrl = product.image || product.imageUrl || product.img || '';

    // Format product name and specs
    const productName = product.name || product.model || product.title || 'Smartphone';
    const brand = product.brand || product.manufacturer || '';
    const specs = [];

    if (product.storage) specs.push(product.storage);
    if (product.ram) specs.push(product.ram + ' RAM');
    if (product.display_size) specs.push(product.display_size);

    card.innerHTML = `
        <a href="smartphones-info.html?id=${product.id || product.productId}" class="product-link">
            <div class="product-image-container">
                <img src="${imageUrl}" alt="${productName}" class="product-image" loading="lazy"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
            </div>
            <div class="product-details">
                <h3 class="product-name">${productName}</h3>
                ${brand ? `<div class="product-brand">${brand}</div>` : ''}
                ${specs.length > 0 ? `<div class="product-specs"><span>${specs.join(' • ')}</span></div>` : ''}
                <div class="product-price">
                    ${typeof currentPrice === 'number' ? `<span class="current-price">R${currentPrice.toLocaleString()}</span>` : `<span class="current-price">${currentPrice}</span>`}
                    ${originalPrice && originalPrice !== currentPrice ? `<span class="original-price">R${typeof originalPrice === 'number' ? originalPrice.toLocaleString() : originalPrice}</span>` : ''}
                    ${discount ? `<span class="discount">${discount}</span>` : ''}
                </div>
                <div class="product-retailers">
                    <span>${product.retailer_count || product.retailers || 2} retailers</span>
                </div>
            </div>
        </a>
        <div class="price-alert-bell ${hasPriceAlert ? 'active' : ''}" data-product-id="${product.id || product.productId}" data-product-price="${typeof currentPrice === 'number' ? currentPrice : 0}">
            <i class="fas fa-bell"></i>
        </div>
        <div class="product-buttons">
            <button class="compare-button" data-product-id="${product.id || product.productId}">Compare</button>
            <button class="wishlist-button" data-product-id="${product.id || product.productId}">Add to Wishlist</button>
        </div>
    `;

   
    const compareButton = card.querySelector('.compare-button');
    compareButton.addEventListener('click', function () {
        window.location.href = `smartphones-info.html?id=${product.id || product.productId}`;
    });

    // Add event listener for wishlist button
    const wishlistButton = card.querySelector('.wishlist-button');
    wishlistButton.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Only call wishlist.js functions if loaded
        if (typeof addToWishlist === 'function') {
            const productId = this.getAttribute('data-product-id');

            // Show loading indicator
            this.classList.add('wishlist-loading');
            const originalText = this.innerHTML;
            this.innerHTML = '<div class="wishlist-spinner"></div>';

            try {
                const wishlistItem = {
                    id: productId,
                    name: productName,
                    price: typeof currentPrice === 'number' ? currentPrice : 0,
                    image: imageUrl,
                    url: `smartphones-info.html?id=${product.id || product.productId}`
                };

                addToWishlist(wishlistItem);
            } catch (error) {
                console.error('Error updating wishlist:', error);
                // Use a notification function from your main app if available
                if (typeof showNotification === 'function') {
                    showNotification('Wishlist Error', 'There was a problem updating your wishlist. Please try again.', 'error');
                }
            } finally {
                // Hide loading indicator
                this.classList.remove('wishlist-loading');
                this.innerHTML = originalText;
            }
        }
    });

    // Add event listener for price alert bell
    const priceAlertBell = card.querySelector('.price-alert-bell');
    if (priceAlertBell) {
        priceAlertBell.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const productId = this.getAttribute('data-product-id');
            const productPrice = parseFloat(this.getAttribute('data-product-price'));

            togglePriceAlert(productId, productPrice, productName, imageUrl);
        });
    }

    return card;
}

/**
 * Display smartphone products in the deals section
 * @param {Array} products - The products to display
 * @param {number} page - The current page number
 * @param {string} sortBy - The sorting criteria
 */
function displaySmartphoneProducts(products, page = 1, sortBy = "relevance") {
    // Get the products grid element
    const productsGrid = document.getElementById("tv-section").querySelector(".products-grid");

    // Clear the grid
    productsGrid.innerHTML = "";

    // Filter out any invalid products
    const validProducts = products.filter(product => product && (product.name || product.model || product.title));

    if (validProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-results" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 0;">
                <i class="fas fa-search" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                <p style="font-size: 18px; margin-bottom: 20px; font-weight: bold;">No smartphone deals available.</p>
                <p style="color: #666;">Please check back later for the latest deals.</p>
            </div>
        `;
        return;
    }

    // Sort products
    const sortedProducts = sortSmartphoneProducts(validProducts, sortBy);

    // Pagination
    const productsPerPage = 9;
    const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
    const startIndex = (page - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

    // Create product cards
    paginatedProducts.forEach(product => {
        const productCard = createSmartphoneProductCard(product);
        productsGrid.appendChild(productCard);
    });

    // Update pagination if pagination element exists
    const paginationElement = document.getElementById("smartphone-pagination");
    if (paginationElement) {
        updateSmartphonePagination(page, totalPages, sortBy);
    }
}

/**
 * Sort smartphone products based on criteria
 * @param {Array} products - The products to sort
 * @param {string} sortBy - The sorting criteria
 * @returns {Array} - The sorted products
 */
function sortSmartphoneProducts(products, sortBy) {
    const sortedProducts = [...products];

    switch (sortBy) {
        case "price-asc":
            sortedProducts.sort((a, b) => {
                const priceA = a.currentPrice || a.price || 0;
                const priceB = b.currentPrice || b.price || 0;
                return priceA - priceB;
            });
            break;
        case "price-desc":
            sortedProducts.sort((a, b) => {
                const priceA = a.currentPrice || a.price || 0;
                const priceB = b.currentPrice || b.price || 0;
                return priceB - priceA;
            });
            break;
        case "brand-asc":
            sortedProducts.sort((a, b) => {
                const brandA = (a.brand || a.manufacturer || '').toLowerCase();
                const brandB = (b.brand || b.manufacturer || '').toLowerCase();
                return brandA.localeCompare(brandB);
            });
            break;
        case "brand-desc":
            sortedProducts.sort((a, b) => {
                const brandA = (a.brand || a.manufacturer || '').toLowerCase();
                const brandB = (b.brand || b.manufacturer || '').toLowerCase();
                return brandB.localeCompare(brandA);
            });
            break;
        default:
            // Default is relevance, sort by price
            sortedProducts.sort((a, b) => {
                const priceA = a.currentPrice || a.price || 0;
                const priceB = b.currentPrice || b.price || 0;
                return priceA - priceB;
            });
            break;
    }

    return sortedProducts;
}

/**
 * Update pagination controls for smartphone products
 * @param {number} currentPage - The current page number
 * @param {number} totalPages - The total number of pages
 * @param {string} sortBy - The sorting criteria
 */
function updateSmartphonePagination(currentPage, totalPages, sortBy) {
    const paginationElement = document.getElementById("smartphone-pagination");
    if (!paginationElement) return;

    const pagesContainer = paginationElement.querySelector(".pages");

   
    pagesContainer.innerHTML = "";

    // Previous button
    const prevButton = paginationElement.querySelector('[data-page="prev"]');
    if (prevButton) {
        prevButton.disabled = currentPage === 1;
        prevButton.onclick = () => {
            if (currentPage > 1) {
                displaySmartphoneProducts(window.currentSmartphoneProducts, currentPage - 1, sortBy);
            }
        };
    }

    // Next button
    const nextButton = paginationElement.querySelector('[data-page="next"]');
    if (nextButton) {
        nextButton.disabled = currentPage === totalPages;
        nextButton.onclick = () => {
            if (currentPage < totalPages) {
                displaySmartphoneProducts(window.currentSmartphoneProducts, currentPage + 1, sortBy);
            }
        };
    }

   
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    
    if (startPage > 1) {
        const firstPageBtn = document.createElement("button");
        firstPageBtn.className = "page-number";
        firstPageBtn.textContent = "1";
        firstPageBtn.onclick = () => displaySmartphoneProducts(window.currentSmartphoneProducts, 1, sortBy);
        pagesContainer.appendChild(firstPageBtn);

        if (startPage > 2) {
            const ellipsis = document.createElement("span");
            ellipsis.className = "page-ellipsis";
            ellipsis.textContent = "...";
            pagesContainer.appendChild(ellipsis);
        }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.className = `page-number ${i === currentPage ? "active" : ""}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => displaySmartphoneProducts(window.currentSmartphoneProducts, i, sortBy);
        pagesContainer.appendChild(pageBtn);
    }

    // Add last page if not visible
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement("span");
            ellipsis.className = "page-ellipsis";
            ellipsis.textContent = "...";
            pagesContainer.appendChild(ellipsis);
        }

        const lastPageBtn = document.createElement("button");
        lastPageBtn.className = "page-number";
        lastPageBtn.textContent = totalPages;
        lastPageBtn.onclick = () => displaySmartphoneProducts(window.currentSmartphoneProducts, totalPages, sortBy);
        pagesContainer.appendChild(lastPageBtn);
    }
}

/**
 * Fetch smartphone data from API
 * @returns {Promise<Array>} - The smartphone products data
 */
async function fetchSmartphoneData() {
    try {
        const response = await fetch(SMARTPHONE_API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Handle different response formats
        if (Array.isArray(data)) {
            return data;
        } else if (data.products || data.smartphones || data.items) {
            return data.products || data.smartphones || data.items;
        } else if (data.data) {
            return Array.isArray(data.data) ? data.data : [data.data];
        }

        return [];
    } catch (error) {
        console.error('Error fetching smartphone data:', error);
        return [];
    }
}

/**
 * Initialize smartphone deals section
 */
async function initializeSmartphoneDeals() {
    try {
        // Show loading state
        const productsGrid = document.getElementById("tv-section").querySelector(".products-grid");
        if (productsGrid) {
            productsGrid.innerHTML = `
                <div class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading smartphone deals...</p>
                </div>
            `;
        }

        // Fetch smartphone data
        const smartphoneProducts = await fetchSmartphoneData();

        // Store products globally for pagination
        window.currentSmartphoneProducts = smartphoneProducts;

        // Display products
        displaySmartphoneProducts(smartphoneProducts, 1, "relevance");

    } catch (error) {
        console.error('Error initializing smartphone deals:', error);

        // Show error state
        const productsGrid = document.getElementById("tv-section").querySelector(".products-grid");
        if (productsGrid) {
            productsGrid.innerHTML = `
                <div class="error-state" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 0;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ff6b6b; margin-bottom: 20px;"></i>
                    <h3 style="color: #333; margin-bottom: 10px;">Failed to load smartphone deals</h3>
                    <p style="color: #666; margin-bottom: 20px;">${error.message}</p>
                    <button onclick="initializeSmartphoneDeals()" class="retry-btn" style="padding: 10px 20px; background: #0066cc; color: white; border: none; border-radius: 5px; cursor: pointer;">Retry</button>
                </div>
            `;
        }
    }
}

/**
 * Navigate to smartphone page with type filter
 * @param {string} type - The product type (android, ios, etc.)
 */
function navigateToSmartphonesByType(type) {
    // Close the sidebar
    if (typeof closeSidebar === 'function') {
        closeSidebar();
    }

    // Navigate to smartphones page with type parameter
    window.location.href = `smartphones.html?type=${type}`;
}

// Price Alert Functions (similar to climate-control.js)
function getPriceAlerts() {
    const savedAlerts = localStorage.getItem('priceAlerts');
    if (savedAlerts) {
        try {
            return JSON.parse(savedAlerts);
        } catch (e) {
            console.error('Error parsing price alerts:', e);
            return [];
        }
    }
    return [];
}

function savePriceAlerts(alerts) {
    localStorage.setItem('priceAlerts', JSON.stringify(alerts));
}

function togglePriceAlert(productId, currentPrice, productName, productImage) {
    const alerts = getPriceAlerts();
    const existingAlertIndex = alerts.findIndex(alert => alert.productId === productId);

    if (existingAlertIndex >= 0) {
        // Remove existing alert
        alerts.splice(existingAlertIndex, 1);
        if (typeof showNotification === 'function') {
            showNotification('Price Alert Removed', `Price alert for ${productName} has been removed.`, 'info');
        }

        // Update UI
        const bellIcon = document.querySelector(`.price-alert-bell[data-product-id="${productId}"]`);
        if (bellIcon) {
            bellIcon.classList.remove('active');
        }
    } else {
        // Show price alert modal
        showPriceAlertModal(productId, currentPrice, productName, productImage);
    }

    savePriceAlerts(alerts);
}

function showPriceAlertModal(productId, currentPrice, productName, productImage) {
    // Check if modal already exists
    let modal = document.getElementById('priceAlertModal');
    if (modal) {
        modal.remove();
    }

    // Create modal HTML
    const modalHTML = `
        <div class="price-alert-modal" id="priceAlertModal">
            <div class="price-alert-container">
                <div class="price-alert-header">
                    <h2 class="price-alert-title">Set Price Alert</h2>
                    <button class="price-alert-close" id="priceAlertModalClose">&times;</button>
                </div>
                <div class="price-alert-content">
                    <div class="price-alert-product">
                        <div class="price-alert-product-image">
                            <img src="${productImage}" alt="${productName}">
                        </div>
                        <div class="price-alert-product-info">
                            <h3 class="price-alert-product-title">${productName}</h3>
                            <div class="price-alert-product-price">R${typeof currentPrice === 'number' ? currentPrice.toLocaleString() : currentPrice}</div>
                        </div>
                    </div>

                    <form id="priceAlertForm">
                        <div class="price-alert-form-group">
                            <label for="alertPrice">Alert me when price drops below:</label>
                            <div class="price-alert-input-container">
                                <span class="price-alert-currency">R</span>
                                <input type="number" id="alertPrice" class="price-alert-input" value="${Math.floor(currentPrice * 0.9)}" min="1" max="${currentPrice - 1}">
                            </div>
                        </div>

                        <div class="price-alert-form-group">
                            <label for="alertEmail">Email for notifications (optional):</label>
                            <input type="email" id="alertEmail" class="price-alert-input" placeholder="Enter your email address">
                        </div>

                        <div class="price-alert-actions">
                            <button type="button" class="price-alert-btn secondary" id="cancelPriceAlert">Cancel</button>
                            <button type="button" id="savePriceAlert" class="price-alert-btn primary">Set Alert</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Add modal to body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);

    // Show modal with animation
    setTimeout(() => {
        document.getElementById('priceAlertModal').classList.add('active');
    }, 10);

    // Add event listeners
    document.getElementById('priceAlertModalClose').addEventListener('click', () => {
        document.getElementById('priceAlertModal').classList.remove('active');
        setTimeout(() => {
            document.getElementById('priceAlertModal').remove();
        }, 300);
    });

    document.getElementById('cancelPriceAlert').addEventListener('click', () => {
        document.getElementById('priceAlertModal').classList.remove('active');
        setTimeout(() => {
            document.getElementById('priceAlertModal').remove();
        }, 300);
    });

    document.getElementById('savePriceAlert').addEventListener('click', () => {
        const alertPrice = parseFloat(document.getElementById('alertPrice').value);
        const alertEmail = document.getElementById('alertEmail').value;

        if (isNaN(alertPrice) || alertPrice >= currentPrice || alertPrice <= 0) {
            if (typeof showNotification === 'function') {
                showNotification('Invalid Price', 'Please enter a valid price below the current price.', 'error');
            }
            return;
        }

        // Save the alert
        const alerts = getPriceAlerts();
        alerts.push({
            productId,
            productName,
            currentPrice,
            alertPrice,
            email: alertEmail,
            dateCreated: new Date().toISOString()
        });
        savePriceAlerts(alerts);

        // Update UI
        const bellIcon = document.querySelector(`.price-alert-bell[data-product-id="${productId}"]`);
        if (bellIcon) {
            bellIcon.classList.add('active');
        }

        // Show confirmation
        if (typeof showNotification === 'function') {
            showNotification('Price Alert Set', `We'll notify you when ${productName} drops below R${alertPrice.toLocaleString()}.`, 'success');
        }

        // Close modal with animation
        document.getElementById('priceAlertModal').classList.remove('active');
        setTimeout(() => {
            document.getElementById('priceAlertModal').remove();
        }, 300);
    });
}

// Initialize smartphone deals when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize smartphone deals section
    initializeSmartphoneDeals();
});

// Make functions globally available
window.navigateToSmartphonesByType = navigateToSmartphonesByType;
window.initializeSmartphoneDeals = initializeSmartphoneDeals;