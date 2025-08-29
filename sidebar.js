/**
 * Sidebar functionality for CompareHub
 * This file contains all sidebar-related JavaScript functionality
 * Updated: Only one submenu at each level is open at a time.
 * Submenus and nested submenus only open when their parent is clicked.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for OS-specific laptop links
    document.addEventListener('click', function(e) {
        // Check if the clicked element is one of our OS links for laptops
        if (e.target.matches('a[href="#windows"]')) {
            e.preventDefault();
            // Check if the link is within the Desktops submenu
            if (isInDesktopsSubmenu(e.target)) {
                navigateToDesktopsByOS('windows');
            } else {
                navigateToLaptopsByOS('windows');
            }
        } else if (e.target.matches('a[href="#macos"]')) {
            e.preventDefault();
            // Check if the link is within the Desktops submenu
            if (isInDesktopsSubmenu(e.target)) {
                navigateToDesktopsByOS('macos');
            } else {
                navigateToLaptopsByOS('macos');
            }
        } else if (e.target.matches('a[href="#chromeos"]')) {
            e.preventDefault();
            navigateToLaptopsByOS('chromeos');
        } else if (e.target.matches('a[href="#gaming-desktops"]')) {
            // Gaming Desktops link
            e.preventDefault();
            navigateToGamingByType('desktops');
        } else if (e.target.matches('a[href="#gaming-laptops"]')) {
            // Gaming Laptops link
            e.preventDefault();
            navigateToGamingByType('laptops');
        } else if (e.target.matches('a[href="#adapters"]')) {
            // Smartphone Adapters link
            e.preventDefault();
            navigateToAccessoriesByType('adapters');
        } else if (e.target.matches('a[href="#powerbanks"]')) {
            // Smartphone Powerbanks link
            e.preventDefault();
            navigateToAccessoriesByType('powerbanks');
        } else if (e.target.matches('a[href="#cables"]')) {
            // Smartphone Cables link
            e.preventDefault();
            navigateToAccessoriesByType('cables');
        } else if (e.target.matches('a[href="javascript:void(0);"][onclick*="handleAccessoryTypeClick"]')) {
            // Laptop & Desktop Accessories links with onclick handlers
            e.preventDefault();
            const onclickAttr = e.target.getAttribute('onclick');
            const match = onclickAttr.match(/handleAccessoryTypeClick\('([^']+)'\)/);
            if (match && match[1]) {
                const accessoryType = match[1];
                navigateToLaptopDesktopAccessoriesByType(accessoryType);
            }
        } else if (e.target.matches('a[href="#laptop-bags"]')) {
            // Check if the link is within the Data Storage submenu
            if (isInDataStorageSubmenu(e.target)) {
                e.preventDefault();
                navigateToDataStorageByType('memory_cards');
            }
        } else if (e.target.matches('a[href="#laptop-cooling"]')) {
            // Check if the link is within the Data Storage submenu
            if (isInDataStorageSubmenu(e.target)) {
                e.preventDefault();
                navigateToDataStorageByType('external_drives');
            }
        } else if (e.target.matches('a[href="#laptop-bags"]')) {
            // Check if the link is within the Data Storage submenu (second occurrence)
            if (isInDataStorageSubmenu(e.target)) {
                e.preventDefault();
                navigateToDataStorageByType('usb_flash_drives');
            }
        }
    });

    // Helper function to check if a link is within the Desktops submenu
    function isInDesktopsSubmenu(element) {
        let parent = element.parentElement;
        while (parent) {
            if (parent.querySelector('.submenu-item span') &&
                parent.querySelector('.submenu-item span').textContent.trim() === 'Desktops') {
                return true;
            }
            parent = parent.parentElement;
        }
        return false;
    }
    
    // Helper function to check if a link is within the Data Storage submenu
    function isInDataStorageSubmenu(element) {
        let parent = element.parentElement;
        while (parent) {
            if (parent.querySelector('.submenu-item span') &&
                parent.querySelector('.submenu-item span').textContent.trim() === 'Data Storage') {
                return true;
            }
            parent = parent.parentElement;
        }
        return false;
    }
    // Toggle sidebar visibility
    window.toggleSidebar = function() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    };

    // Close sidebar
    window.closeSidebar = function() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    };

    // Toggle submenu in sidebar (works for unlimited nested submenus)
    window.toggleSubmenu = function(element) {
        const item = element.parentElement; // .item
        const submenu = item.querySelector(':scope > .submenu'); // direct child submenu
        const isActive = item.classList.contains('active');

        // Close all sibling submenus at the same level
        const siblings = item.parentElement.querySelectorAll(':scope > .item');
        siblings.forEach(sibling => {
            if (sibling !== item) sibling.classList.remove('active');
            // Also close any nested submenus within siblings
            sibling.querySelectorAll('.item.active').forEach(nested => nested.classList.remove('active'));
        });

        // Toggle current item
        if (!isActive) {
            item.classList.add('active');
            // Optionally animate submenu items
            if (submenu) {
                const submenuItems = submenu.querySelectorAll(':scope > .item');
                submenuItems.forEach((submenuItem, index) => {
                    submenuItem.classList.remove('slide-in'); // reset
                    setTimeout(() => {
                        submenuItem.classList.add('slide-in');
                    }, index * 50);
                });
            }
        } else {
            item.classList.remove('active');
            // Also close any nested submenus when collapsing
            if (submenu) {
                submenu.querySelectorAll('.item.active').forEach(nested => nested.classList.remove('active'));
            }
        }
    };

    // Go back in sidebar navigation (for nested submenus)
    window.goBack = function(element) {
        const item = element.closest('.item');
        if (item) {
            item.classList.remove('active');
            // Optionally close all nested submenus within this item
            item.querySelectorAll('.item.active').forEach(nested => nested.classList.remove('active'));
        }
    };

    // Sidebar search functionality
    const sidebarSearchInput = document.getElementById('sidebarSearchInput');
    if (sidebarSearchInput) {
        sidebarSearchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const menuItems = document.querySelectorAll('.menu-items .item');
            menuItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // Close sidebar when clicking outside (except on toggle or overlay itself)
    document.addEventListener('click', function(e) {
        const sidebar = document.getElementById('sidebar');
        const toggle = document.querySelector('.sidebar-toggle');
        const overlay = document.getElementById('sidebarOverlay');
        if (
            sidebar &&
            sidebar.classList.contains('active') &&
            !sidebar.contains(e.target) &&
            e.target !== toggle &&
            e.target !== overlay
        ) {
            closeSidebar();
        }
    });
});

let currentCategory = 'electronics';

function switchCategoryType() {
    const electronicsMenu = document.getElementById('electronicsMenu');
    const foodMenu = document.getElementById('foodMenu');
    const switchBtnText = document.getElementById('switchBtnText');
    const categoryType = document.getElementById('categoryType');
    
    if (currentCategory === 'electronics') {
        // Switch to food categories
        electronicsMenu.style.display = 'none';
        foodMenu.style.display = 'block';
        switchBtnText.textContent = 'Switch to Electronics';
        categoryType.textContent = 'Essential Goods';
        currentCategory = 'Essential Goods';
    } else {
        // Switch to electronics categories
        foodMenu.style.display = 'none';
        electronicsMenu.style.display = 'block';
        switchBtnText.textContent = 'Switch to Essential Goods';
        categoryType.textContent = 'Electronics';
        currentCategory = 'electronics';
    }
}

// Existing sidebar functionality
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
}

function toggleSubmenu(element) {
    const item = element.parentElement;
    const isActive = item.classList.contains('active');
    
    // Close all other submenus at the same level
    const siblings = item.parentElement.children;
    for (let sibling of siblings) {
        if (sibling !== item && sibling.classList.contains('item')) {
            sibling.classList.remove('active');
        }
    }
    
    // Toggle current submenu
    if (isActive) {
        item.classList.remove('active');
    } else {
        item.classList.add('active');
    }
}

function goBack(element) {
    const submenu = element.closest('.submenu');
    const parentItem = submenu.parentElement;
    parentItem.classList.remove('active');
}

/**
 * Navigate to laptops page with OS filter
 * @param {string} os - The OS type (windows, macos, chromeos)
 */
function navigateToLaptopsByOS(os) {
    // Close the sidebar
    closeSidebar();
    
    // Navigate to laptops page with OS parameter
    window.location.href = `laptops.html?os=${os}`;
}

/**
 * Navigate to desktops page with OS filter
 * @param {string} os - The OS type (windows, macos)
 */
function navigateToDesktopsByOS(os) {
    // Close the sidebar
    closeSidebar();
    
    // Navigate to desktops page with OS parameter
    window.location.href = `Desktops.html?os=${os}`;
}

/**
 * Navigate to gaming page with type filter
 * @param {string} type - The product type (console, laptop, pc)
 */
function navigateToGamingByType(type) {
    // Close the sidebar
    closeSidebar();
    
    // Navigate to gaming page with type parameter
    window.location.href = `gaming.html?type=${type}`;
}

/**
 * Navigate to smartphone accessories page with type filter
 * @param {string} type - The accessory type (adapters, powerbanks, cables)
 */
function navigateToAccessoriesByType(type) {
    // Close the sidebar
    closeSidebar();
    
    // Navigate to smartphone accessories page with type parameter
    window.location.href = `smartphones-accessories.html?type=${type}`;
}

/**
 * Navigate to laptop and desktop accessories page with type filter
 * @param {string} type - The accessory type (adapters, usb_hubs, keyboards, monitors, printers, webcams, bags, speakers)
 */
function navigateToLaptopDesktopAccessoriesByType(type) {
    // Close the sidebar
    closeSidebar();
    
    // Navigate to laptop-desktop accessories page with type parameter
    window.location.href = `laptop-desktop-accessories.html?type=${type}`;
}

/**
 * Navigate to data storage page with type filter
 * @param {string} type - The storage type (external_drives, memory_cards, usb_flash_drives)
 */
function navigateToDataStorageByType(type) {
    // Close the sidebar
    closeSidebar();
    
    // Navigate to data storage page with type parameter
    window.location.href = `Data-storage.html?type=${type}`;
}

/**
 * Navigate to components page with type filter
 * @param {string} type - The component type (motherboards, ram, graphics_cards, storage, cpu, power_supplies)
 */
function navigateToComponentsByType(type) {
    // Close the sidebar
    closeSidebar();
    
    // Navigate to components page with type parameter
    window.location.href = `components.html?type=${type}`;
}

/**
 * Navigate to WiFi & Networking page with type filter
 * @param {string} type - The networking product type (routers, wifi_ups, extenders)
 */
function navigateToWifiNetworkingByType(type) {
    // Close the sidebar
    closeSidebar();
    
    // Navigate to WiFi & Networking page with type parameter
    window.location.href = `Wi-Fi-Networking.html?type=${type}`;
}

/**
 * Navigate to TV & Streaming page with type filter
 * @param {string} type - The TV & Streaming product type (televisions, streaming_devices, tv_accessories)
 */
function navigateToTVStreamingByType(type) {
    // Close the sidebar
    closeSidebar();
    
    // Navigate to TV & Streaming page with type parameter
    window.location.href = `televisions-streaming.html?type=${type}`;
}

/**
 * Navigate to Headphones & Earbuds page with type filter
 * @param {string} type - The audio product type (headphones, earbuds, gaming_headsets)
 */
function navigateToHeadphonesEarbudsByType(type) {
    // Close the sidebar
    closeSidebar();
    
    // Navigate to Headphones & Earbuds page with type parameter
    window.location.href = `headphones-earbuds.html?type=${type}`;
}

/**
 * Navigate to Home Entertainment Systems page with type filter
 * @param {string} type - The home entertainment product type (hifi_systems, soundbars)
 */
function navigateToHomeEntertainmentByType(type) {
    // Close the sidebar
    closeSidebar();
    
    // Navigate to Home Entertainment Systems page with type parameter
    window.location.href = `Home-Entertainment-Systems.html?type=${type}`;
}

/**
 * Navigate to Wearables Devices page with type filter
 * @param {string} type - The wearable device type (smartwatches, fitness_trackers, vr_headsets)
 */
function navigateToWearablesByType(type) {
    // Close the sidebar
    closeSidebar();
    
    // Navigate to Wearables Devices page with type parameter
    window.location.href = `wearables-devices.html?type=${type}`;
}

/**
 * Navigate to Climate Control page with type filter
 * @param {string} type - The climate control product type (fans, air_conditioners, air_coolers)
 */
function navigateToClimateControlByType(type) {
    // Close the sidebar
    closeSidebar();
    
    // Navigate to Climate Control page with type parameter
    window.location.href = `climate-control.html?type=${type}`;
}

/**
 * Navigate to Portable Speakers page with type filter
 * @param {string} type - The speaker type (bluetooth, party, usb, radios)
 */
function navigateToPortableSpeakersByType(type) {
    // Close the sidebar
    closeSidebar();
    
    // Navigate to Portable Speakers page with type parameter
    window.location.href = `portable-speakers.html?type=${type}`;
}

/**
 * Navigate to Appliances page with type filter
 * @param {string} type - The appliance type (fridges, freezers, microwaves, etc.)
 */
function navigateToAppliancesByType(type) {
    // Close the sidebar
    closeSidebar();
    
    // Navigate to Appliances page with type parameter
    window.location.href = `appliances.html?type=${type}`;
}

/**
 * Navigate to Power Solutions page with type filter
 * @param {string} type - The power solution type (ups, power_stations, inverters)
 */
function navigateToPowerSolutionsByType(type) {
    // Close the sidebar
    closeSidebar();
    
    // Navigate to Power Solutions page with type parameter
    window.location.href = `power-solutions.html?type=${type}`;
}

// Make the functions available globally
window.navigateToLaptopDesktopAccessoriesByType = navigateToLaptopDesktopAccessoriesByType;
window.navigateToDataStorageByType = navigateToDataStorageByType;
window.navigateToComponentsByType = navigateToComponentsByType;
window.navigateToWifiNetworkingByType = navigateToWifiNetworkingByType;
window.navigateToTVStreamingByType = navigateToTVStreamingByType;
window.navigateToHeadphonesEarbudsByType = navigateToHeadphonesEarbudsByType;
window.navigateToHomeEntertainmentByType = navigateToHomeEntertainmentByType;
window.navigateToGamingByType = navigateToGamingByType;
window.navigateToWearablesByType = navigateToWearablesByType;
window.navigateToClimateControlByType = navigateToClimateControlByType;
window.navigateToPortableSpeakersByType = navigateToPortableSpeakersByType;
window.navigateToAppliancesByType = navigateToAppliancesByType;
window.navigateToPowerSolutionsByType = navigateToPowerSolutionsByType;