import { labs } from './data.js';
import { createIcons, icons } from 'lucide';

/**
 * PAGE STATE
 */
const state = {
    sidebarOpen:    window.innerWidth > 768,
    selectedLab:    null,
    labSearchQuery: '',
};


/**
 * DOM ELEMENTS
 */
const elements = {
    sidebar:            document.getElementById('sidebar-nav'),
    mainContent:        document.getElementById('main-content'),
    sidebarToggle:      document.getElementById('sidebar-toggle'),
    sidebarOverlay:     document.getElementById('sidebar-overlay'),
    labName:            document.getElementById('lab-name-display'),
    labNameHeader:      document.getElementById('lab-name-header'),
    labIconHeader:      document.getElementById('lab-icon-header'),
    labDescription:     document.getElementById('lab-description-display'),
    itemsCount:         document.getElementById('items-count-display'),
    itemsGrid:          document.getElementById('items-grid-container'),
    labSearch:          document.getElementById('lab-item-search'),
    labIdDisplay:       document.getElementById('lab-id-display'),
    labItemsCountStat:  document.getElementById('lab-items-count-stat'),
    currentDate:        document.getElementById('current-date-display'),
};


/**
 * RENDERING LOGIC
 */
const renderItems = () => {
    if (!elements.itemsGrid || !state.selectedLab) return;
    
    const query = state.labSearchQuery.toLowerCase();
    const filtered = state.selectedLab.items.filter(item => 
        item.name.toLowerCase().includes(query) || 
        (item.brand && item.brand.toLowerCase().includes(query)) ||
        (item.model && item.model.toLowerCase().includes(query))
    );

    if (filtered.length === 0) {
        elements.itemsGrid.innerHTML = `
            <div class="col-span-full py-20 text-center">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full mb-4 shadow-2xl">
                    <i data-lucide="search-x" class="w-8 h-8 text-zinc-700"></i>
                </div>
                <p class="text-zinc-500 text-sm font-medium">Nenhum equipamento corresponde à sua pesquisa.</p>
            </div>
        `;
    } else {
        elements.itemsGrid.innerHTML = filtered.map((item, index) => {
            const originalIndex = state.selectedLab.items.indexOf(item);
            
            return `
                <a href="equipment.html?lab=${state.selectedLab.id}&item=${originalIndex}" class="eq-card group">
                    <div class="flex justify-between items-start mb-6">
                        <span class="text-[10px] font-mono text-blue-500/80 uppercase tracking-widest px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded">
                            ID:POP-${String(originalIndex + 1).padStart(3, '0')}
                        </span>
                        
                        <div class="flex gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                            <span class="h-1 w-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span>
                            <span class="h-1 w-1 rounded-full bg-zinc-800"></span>
                            <span class="h-1 w-1 rounded-full bg-zinc-800"></span>
                        </div>
                    </div>
                    
                    <h5 class="text-white font-bold text-lg mb-1 group-hover:text-blue-400 transition-colors tracking-tight">${item.name}</h5>
                    <p class="text-zinc-500 text-[11px] mb-6 font-medium font-mono uppercase tracking-wide opacity-80">${item.brand} — ${item.model || 'GENÉRIC'}</p>
                    
                    <div class="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                        <div class="flex items-center gap-2">
                            <i data-lucide="map-pin" class="w-3 h-3 text-zinc-600"></i>
                            <span class="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">${item.location}</span>
                        </div>
                        
                        <div class="opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all flex items-center gap-1 text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                            FICHA TÉCNICA <i data-lucide="chevron-right" class="w-3 h-3"></i>
                        </div>
                    </div>
                </a>
            `;
        }).join('');
    }
    
    createIcons({ icons });
};


/**
 * NAVIGATION LOGIC
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
 * PAGE INITIALIZATION
 */
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const labId  = params.get('id');
    
    state.selectedLab = labs.find(l => l.id === labId);
    
    if (!state.selectedLab) {
        window.location.href = '/index.html';
        return;
    }

    // 1. Populate Lab Identity
    if (elements.labName)          elements.labName.textContent          = state.selectedLab.name;
    if (elements.labNameHeader)    elements.labNameHeader.textContent    = state.selectedLab.name;
    if (elements.labDescription)   elements.labDescription.textContent   = state.selectedLab.description;
    if (elements.itemsCount)       elements.itemsCount.textContent       = `${state.selectedLab.items.length} Itens Registrados`;
    if (elements.labIdDisplay)     elements.labIdDisplay.textContent     = `LAB-${state.selectedLab.id.toUpperCase()}`;
    if (elements.labItemsCountStat) elements.labItemsCountStat.textContent = state.selectedLab.items.length;
    
    if (elements.labIconHeader) {
        elements.labIconHeader.setAttribute('data-lucide', state.selectedLab.icon);
    }

    // 2. Real-time Clock
    const updateClock = () => {
        if (elements.currentDate) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            elements.currentDate.innerHTML = `<span class="text-blue-500 font-bold">${timeStr}</span>`;
        }
    };
    
    updateClock();
    setInterval(updateClock, 1000);

    // 3. Sidebar Links Generation
    const sidebarItemsContainer = document.getElementById('sidebar-labs-items');
    if (sidebarItemsContainer) {
        sidebarItemsContainer.innerHTML = labs.map(lab => `
            <a href="lab.html?id=${lab.id}" class="nav-item ${lab.id === labId ? 'active' : ''}">
                <i data-lucide="${lab.icon}" class="w-4 h-4"></i>
                <span>${lab.name}</span>
            </a>
        `).join('');
    }

    // 4. Initial Render
    renderItems();

    // 5. Event Listeners
    if (elements.sidebarToggle) {
        elements.sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    if (elements.sidebarOverlay) {
        elements.sidebarOverlay.addEventListener('click', toggleSidebar);
    }
    
    if (elements.labSearch) {
        elements.labSearch.addEventListener('input', (e) => {
            state.labSearchQuery = e.target.value;
            renderItems();
        });
    }

    // 6. UI Polish
    updateSidebarUI();
    createIcons({ icons });
});
