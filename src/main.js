import { labs } from './data.js';
import { createIcons, icons } from 'lucide';

/**
 * APPLICATION STATE
 * Centralized state for the main dashboard view.
 */
const state = {
    sidebarOpen: window.innerWidth > 768,
    searchQuery: '',
};

// Replace global lucide call with local import
const refreshIcons = () => {
    createIcons({ icons });
};

/**
 * DOM ELEMENTS
 * Cached references to frequently used DOM nodes.
 */
const elements = {
    sidebar:        document.getElementById('sidebar-nav'),
    mainContent:    document.getElementById('main-content'),
    sidebarToggle:  document.getElementById('sidebar-toggle'),
    sidebarOverlay: document.getElementById('sidebar-overlay'),
    totalItems:     document.getElementById('total-items-count'),
    labsCount:      document.getElementById('labs-active-count'),
    labsGrid:       document.getElementById('labs-grid-container'),
    featuredGrid:   document.getElementById('featured-grid-container'),
    globalSearch:   document.getElementById('global-search-input'),
    searchResults:  document.getElementById('search-results-dropdown'),
    pdfIndexList:   document.getElementById('pdf-index-list'),
    pdfIndexCount:  document.getElementById('pdf-index-count'),
    currentDate:    document.getElementById('current-date-display'),
};


/**
 * STATS & CALCULATIONS
 * Updates dashboard counters based on data.
 */
const calculateStats = () => {
    const totalItems = labs.reduce((acc, lab) => acc + lab.items.length, 0);
    
    if (elements.totalItems) elements.totalItems.textContent = totalItems;
    if (elements.labsCount)  elements.labsCount.textContent  = labs.length;
};


/**
 * UI RENDERING
 * Functions responsible for generating HTML structures.
 */
const renderLabs = () => {
    if (!elements.labsGrid) return;
    
    elements.labsGrid.innerHTML = labs.map(lab => `
        <a href="lab.html?id=${lab.id}" class="lab-hero-card group relative overflow-hidden">
            <div class="absolute -right-2 -bottom-2 opacity-[0.03] transform scale-150 group-hover:scale-110 transition-transform duration-500">
                <i data-lucide="${lab.icon}" class="w-24 h-24"></i>
            </div>
            
            <div class="icon-box mb-6 group-hover:bg-blue-500 group-hover:border-blue-500 relative z-10">
                <i data-lucide="${lab.icon}" class="w-5 h-5 text-blue-500 group-hover:text-white transition-colors"></i>
            </div>
            
            <h4 class="font-bold text-base text-white mb-2 relative z-10">${lab.name}</h4>
            <p class="text-zinc-500 text-xs leading-relaxed line-clamp-2 relative z-10">${lab.description}</p>
        </a>
    `).join('');
};

const renderFeatured = () => {
    if (!elements.featuredGrid) return;
    
    const allItems = [];
    labs.forEach(lab => {
        lab.items.forEach((item, index) => {
            allItems.push({ ...item, labId: lab.id, labName: lab.name, index });
        });
    });
    
    const featured = allItems.slice(0, 4);
    elements.featuredGrid.innerHTML = featured.map(item => `
        <a href="equipment.html?lab=${item.labId}&item=${item.index}" 
           class="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:bg-zinc-900 hover:border-zinc-700 transition-all group">
            <div class="flex items-center gap-4">
                <div class="w-1 h-8 bg-blue-500/30 group-hover:bg-blue-500 rounded-full transition-colors"></div>
                <div>
                    <h5 class="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">${item.name}</h5>
                    <p class="text-[10px] text-zinc-500 tracking-wider uppercase font-mono">${item.labName}</p>
                </div>
            </div>
            <i data-lucide="arrow-right" class="w-4 h-4 text-zinc-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"></i>
        </a>
    `).join('');
};

const getPdfFilename = (pdfUrl) => {
    return pdfUrl ? pdfUrl.split('/').pop() : '';
};

const renderPdfIndex = () => {
    if (!elements.pdfIndexList || !elements.pdfIndexCount) return;

    const docs = new Map();
    labs.forEach(lab => {
        lab.items.forEach(item => {
            if (item.pdfUrl) {
                docs.set(item.pdfUrl, {
                    labName: lab.name,
                    itemName: item.name,
                    fileName: getPdfFilename(item.pdfUrl),
                    url: item.pdfUrl,
                });
            }
        });
    });

    const documentList = Array.from(docs.values());
    elements.pdfIndexCount.textContent = `${documentList.length} documentos`;
    elements.pdfIndexList.innerHTML = documentList.map(doc => `
        <a href="${doc.url}" target="_blank" class="p-4 bg-zinc-900/60 border border-zinc-800 rounded-3xl transition hover:border-blue-500/50 hover:bg-zinc-900">
            <div class="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">${doc.labName}</div>
            <div class="text-sm font-bold text-white truncate">${doc.fileName}</div>
            <div class="text-[10px] text-zinc-500 mt-2 overflow-hidden whitespace-nowrap text-ellipsis">${doc.itemName}</div>
        </a>
    `).join('');
};


/**
 * SEARCH SYSTEM
 * Filters and displays search results globally.
 */
const handleSearch = (query) => {
    state.searchQuery = query;
    if (!elements.searchResults) return;

    if (query.length < 3) {
        elements.searchResults.classList.add('hidden');
        return;
    }

    const results = [];
    const q = query.toLowerCase();
    
    labs.forEach(lab => {
        lab.items.forEach((item, index) => {
            if (item.name.toLowerCase().includes(q) || 
                (item.model && item.model.toLowerCase().includes(q)) ||
                (item.brand && item.brand.toLowerCase().includes(q)) ||
                (item.pdfUrl && getPdfFilename(item.pdfUrl).toLowerCase().includes(q))) {
                results.push({ ...item, labId: lab.id, labName: lab.name, index });
            }
        });
    });

    const limitedResults = results.slice(0, 5);
    
    if (limitedResults.length === 0) {
        elements.searchResults.innerHTML = `
            <div class="p-8 text-center text-zinc-500 text-sm italic">
                Nenhum resultado encontrado para "${query}"
            </div>
        `;
    } else {
        elements.searchResults.innerHTML = limitedResults.map(res => `
            <a href="equipment.html?lab=${res.labId}&item=${res.index}" 
               class="flex items-center gap-4 p-4 hover:bg-zinc-800 border-b border-zinc-800 last:border-0 transition-colors">
                <div class="icon-box-sm">
                    <i data-lucide="${res.icon || 'file-text'}" class="w-4 h-4 text-blue-500"></i>
                </div>
                <div>
                    <h5 class="text-sm font-bold text-white">${res.name}</h5>
                    <p class="text-[10px] text-zinc-500 uppercase tracking-widest">${res.labName}</p>
                </div>
            </a>
        `).join('');
    }
    
    elements.searchResults.classList.remove('hidden');
    refreshIcons();
};


/**
 * NAVIGATION / SIDEBAR
 * Controls the adaptive sidebar behavior.
 */
const toggleSidebar = () => {
    state.sidebarOpen = !state.sidebarOpen;
    updateSidebarUI();
};

const updateSidebarUI = () => {
    if (state.sidebarOpen) {
        elements.sidebar.classList.remove('-translate-x-full');
        elements.sidebar.classList.add('translate-x-0');
        elements.mainContent.classList.add('main-content-shifted');
        if (elements.sidebarOverlay) elements.sidebarOverlay.classList.remove('hidden');
    } else {
        elements.sidebar.classList.add('-translate-x-full');
        elements.sidebar.classList.remove('translate-x-0');
        elements.mainContent.classList.remove('main-content-shifted');
        if (elements.sidebarOverlay) elements.sidebarOverlay.classList.add('hidden');
    }
};


/**
 * INITIALIZATION
 * Bootstraps the application.
 */
document.addEventListener('DOMContentLoaded', () => {

    // 1. Real-time Clock
    const updateClock = () => {
        if (elements.currentDate) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            elements.currentDate.innerHTML = `<span class="text-blue-500 font-bold">${timeStr}</span>`;
        }
    };
    
    updateClock();
    setInterval(updateClock, 1000);

    // 2. Sidebar Navigation Build
    const sidebarItemsContainer = document.getElementById('sidebar-labs-items');
    if (sidebarItemsContainer) {
        sidebarItemsContainer.innerHTML = labs.map(lab => `
            <a href="lab.html?id=${lab.id}" class="nav-item">
                <i data-lucide="${lab.icon}" class="w-4 h-4"></i>
                <span>${lab.name}</span>
            </a>
        `).join('');
    }

    // 3. Render Views
    calculateStats();
    renderLabs();
    renderFeatured();
    renderPdfIndex();
    
    // 4. Global Event Listeners
    if (elements.sidebarToggle) {
        elements.sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    if (elements.sidebarOverlay) {
        elements.sidebarOverlay.addEventListener('click', toggleSidebar);
    }
    
    if (elements.globalSearch) {
        elements.globalSearch.addEventListener('input', (e) => handleSearch(e.target.value));
    }

    // 5. Final UI Adjustments
    updateSidebarUI();
    refreshIcons();
});
