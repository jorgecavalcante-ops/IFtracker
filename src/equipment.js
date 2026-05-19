import { labs } from './data.js';
import { createIcons, icons } from 'lucide';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * PAGE STATE
 */
const state = {
    sidebarOpen:  window.innerWidth > 768,
    selectedLab:  null,
    selectedItem: null,

    // PDF State
    pdfDoc: null,
    pageNum: 1,
    pageRendering: false,
    pageNumPending: null,
    scale: 1.0,
    canvas: null,
    ctx: null
};


/**
 * DOM ELEMENTS
 */
const elements = {
    sidebar:        document.getElementById('sidebar-nav'),
    mainContent:    document.getElementById('main-content'),
    sidebarToggle:  document.getElementById('sidebar-toggle'),
    sidebarOverlay: document.getElementById('sidebar-overlay'),
    
    backBtn:        document.getElementById('back-link'),
    labTitle:       document.getElementById('lab-title-breadcrumb'),
    itemName:       document.getElementById('item-name-breadcrumb'),
    
    // Info Panel
    eqIcon:         document.getElementById('eq-icon-large'),
    eqId:           document.getElementById('eq-id-display'),
    eqName:         document.getElementById('eq-name-display'),
    eqBrand:        document.getElementById('eq-brand-display'),
    eqModel:        document.getElementById('eq-model-display'),
    eqLocation:     document.getElementById('eq-location-display'),
    eqLabName:      document.getElementById('eq-lab-name-display'),
    
    // Technical Info
    eqSupplier:     document.getElementById('eq-supplier-display'),
    eqEmission:     document.getElementById('eq-emission-display'),
    eqRevision:     document.getElementById('eq-revision-display'),
    
    // Procedure
    procedureContainer: document.getElementById('procedure-steps-container'),
    
    // Tables
    tablesSection:   document.getElementById('extra-tables-wrapper'),
    tablesContainer: document.getElementById('extra-tables-container'),
    
    // Enhanced PDF Elements
    pdfSection:      document.getElementById('pdf-panel-section'),
    pdfContainer:    document.getElementById('pdf-viewer-container'),
    pdfCanvas:       document.getElementById('pdf-canvas'),
    pdfPrevBtn:      document.getElementById('pdf-prev'),
    pdfNextBtn:      document.getElementById('pdf-next'),
    pdfPageNumInput: document.getElementById('pdf-page-num'),
    pdfPageCount:    document.getElementById('pdf-page-count'),
    pdfZoomIn:       document.getElementById('pdf-zoom-in'),
    pdfZoomOut:      document.getElementById('pdf-zoom-out'),
    pdfZoomLevel:    document.getElementById('pdf-zoom-level'),
    pdfSearchInput:  document.getElementById('pdf-search-input'),
    pdfSearchPrev:   document.getElementById('search-prev'),
    pdfSearchNext:   document.getElementById('search-next'),
    pdfLoading:      document.getElementById('pdf-loading'),
    pdfDownloadBtn:  document.getElementById('pdf-download-btn'),
    currentDate:     document.getElementById('current-date-display'),
};

/**
 * PDF RENDERING LOGIC
 */

const renderPage = async (num) => {
    state.pageRendering = true;
    
    // Get page
    const page = await state.pdfDoc.getPage(num);
    const viewport = page.getViewport({ scale: state.scale });
    
    elements.pdfCanvas.height = viewport.height;
    elements.pdfCanvas.width = viewport.width;

    // Render PDF page into canvas context
    const renderContext = {
        canvasContext: state.ctx,
        viewport: viewport
    };
    
    const renderTask = page.render(renderContext);

    // Wait for rendering to finish
    await renderTask.promise;
    state.pageRendering = false;

    if (state.pageNumPending !== null) {
        renderPage(state.pageNumPending);
        state.pageNumPending = null;
    }

    // Update UI
    elements.pdfPageNumInput.value = num;
    updateNavButtons();
};

const queueRenderPage = (num) => {
    if (state.pageRendering) {
        state.pageNumPending = num;
    } else {
        renderPage(num);
    }
};

const updateNavButtons = () => {
    elements.pdfPrevBtn.disabled = state.pageNum <= 1;
    elements.pdfNextBtn.disabled = state.pageNum >= state.pdfDoc.numPages;
};

const onPrevPage = () => {
    if (state.pageNum <= 1) return;
    state.pageNum--;
    queueRenderPage(state.pageNum);
};

const onNextPage = () => {
    if (state.pageNum >= state.pdfDoc.numPages) return;
    state.pageNum++;
    queueRenderPage(state.pageNum);
};

const changeZoom = (delta) => {
    const newScale = Math.min(Math.max(0.5, state.scale + delta), 3.0);
    if (newScale !== state.scale) {
        state.scale = newScale;
        elements.pdfZoomLevel.textContent = `${Math.round(state.scale * 100)}%`;
        queueRenderPage(state.pageNum);
    }
};

/**
 * PDF SEARCH LOGIC (Simple jump to page)
 */
let searchMatches = [];
let searchIndex = -1;

const updateSearchUI = () => {
    if (elements.pdfSearchPrev) elements.pdfSearchPrev.disabled = searchMatches.length === 0;
    if (elements.pdfSearchNext) elements.pdfSearchNext.disabled = searchMatches.length === 0;
};

const searchInPDF = async (query) => {
    if (!query || query.length < 3) {
        searchMatches = [];
        searchIndex = -1;
        updateSearchUI();
        return;
    }
    
    elements.pdfLoading.classList.remove('hidden');
    searchMatches = [];
    
    for (let i = 1; i <= state.pdfDoc.numPages; i++) {
        const page = await state.pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const textItems = textContent.items.map(item => item.str).join(' ');
        
        if (textItems.toLowerCase().includes(query.toLowerCase())) {
            searchMatches.push(i);
        }
    }
    
    elements.pdfLoading.classList.add('hidden');
    
    if (searchMatches.length > 0) {
        searchIndex = 0;
        state.pageNum = searchMatches[searchIndex];
        queueRenderPage(state.pageNum);
    } else {
        searchIndex = -1;
    }
    updateSearchUI();
};

const navigateSearch = (dir) => {
    if (searchMatches.length === 0) return;
    
    searchIndex = (searchIndex + dir + searchMatches.length) % searchMatches.length;
    state.pageNum = searchMatches[searchIndex];
    queueRenderPage(state.pageNum);
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
 * INITIALIZATION
 */
document.addEventListener('DOMContentLoaded', async () => {
    const params    = new URLSearchParams(window.location.search);
    const labId     = params.get('lab');
    const itemIndex = parseInt(params.get('item'));
    
    state.selectedLab = labs.find(l => l.id === labId);
    
    if (state.selectedLab) {
        state.selectedItem = state.selectedLab.items[itemIndex];
    }

    if (!state.selectedItem) {
        window.location.href = '/index.html';
        return;
    }

    // Initialize Canvas
    state.canvas = elements.pdfCanvas;
    state.ctx = state.canvas.getContext('2d');

    // 1. Header / Breadcrumbs
    if (elements.backBtn)  elements.backBtn.href       = `/lab.html?id=${labId}`;
    if (elements.labTitle) elements.labTitle.textContent = state.selectedLab.name;
    if (elements.itemName) elements.itemName.textContent = state.selectedItem.name;

    // 2. Info Panel
    if (elements.eqIcon)     elements.eqIcon.setAttribute('data-lucide', state.selectedItem.icon);
    if (elements.eqId)       elements.eqId.textContent       = `ID:${state.selectedItem.model || 'N/A'}`;
    if (elements.eqName)     elements.eqName.textContent     = state.selectedItem.name;
    if (elements.eqBrand)    elements.eqBrand.textContent    = state.selectedItem.brand;
    if (elements.eqModel)    elements.eqModel.textContent    = state.selectedItem.model;
    if (elements.eqLocation) elements.eqLocation.textContent = state.selectedItem.location;
    if (elements.eqLabName)  elements.eqLabName.textContent  = state.selectedLab.name;

    // 3. Technical Info Section
    if (elements.eqSupplier) elements.eqSupplier.textContent = state.selectedItem.supplier;
    if (elements.eqEmission) elements.eqEmission.textContent = state.selectedItem.emission;
    if (elements.eqRevision) elements.eqRevision.textContent = state.selectedItem.revision;

    // 4. Operation Procedure
    if (elements.procedureContainer) {
        elements.procedureContainer.innerHTML = state.selectedItem.procedure.split('\n').map((line, i) => {
            if (!line.trim()) return '';
            
            return `
                <div class="flex gap-4 group items-start">
                    <div class="flex-shrink-0 w-6 h-6 rounded bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-[10px] font-mono font-bold text-blue-500 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-400 transition-all uppercase tracking-tighter shadow-inner">
                        ${i + 1}
                    </div>
                    <p class="text-zinc-400 text-xs leading-relaxed pt-0.5 group-hover:text-zinc-200 transition-colors">
                        ${line.replace(/^\d+\.\s*/, '')}
                    </p>
                </div>
            `;
        }).join('');
    }

    // 5. Technical Tables
    if (state.selectedItem.tables && state.selectedItem.tables.length > 0) {
        if (elements.tablesSection) elements.tablesSection.classList.remove('hidden');
        
        if (elements.tablesContainer) {
            elements.tablesContainer.innerHTML = state.selectedItem.tables.map(table => `
                <div class="space-y-4">
                    <h3 class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <i data-lucide="table-2" class="w-3 h-3 text-blue-500"></i>
                        <span>${table.title}</span>
                    </h3>
                    
                    <div class="overflow-x-auto rounded-xl border border-zinc-800/50">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-zinc-950/50">
                                    ${table.headers.map(header => `
                                        <th class="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800/50">
                                            ${header}
                                        </th>
                                    `).join('')}
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-zinc-800/50">
                                ${table.rows.map(row => `
                                    <tr class="hover:bg-zinc-800/30 transition-colors">
                                        ${row.map(cell => `
                                            <td class="px-4 py-3 text-xs text-zinc-300 font-medium">
                                                ${cell}
                                            </td>
                                        `).join('')}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `).join('');
        }
    } else {
        if (elements.tablesSection) elements.tablesSection.classList.add('hidden');
    }

    // 6. PDF Panel Integration
    if (state.selectedItem.pdfUrl && state.selectedItem.pdfUrl !== '#' && state.selectedItem.pdfUrl !== '') {
        if (elements.pdfSection) elements.pdfSection.classList.remove('hidden');
        elements.pdfLoading.classList.remove('hidden');
        
        try {
            // Adjust container height
            const screenHeight = window.innerHeight;
            const optimalHeight = Math.max(500, screenHeight - 300);
            elements.pdfContainer.style.height = `${optimalHeight}px`;

            // Load PDF
            const loadingTask = pdfjsLib.getDocument(state.selectedItem.pdfUrl);
            state.pdfDoc = await loadingTask.promise;
            
            elements.pdfPageCount.textContent = state.pdfDoc.numPages;
            elements.pdfPageNumInput.max = state.pdfDoc.numPages;
            
            // Initial render
            await renderPage(state.pageNum);
            elements.pdfLoading.classList.add('hidden');
            
        } catch (error) {
            console.error('Error loading PDF:', error);
            elements.pdfLoading.innerHTML = `
                <i data-lucide="file-warning" class="w-12 h-12 text-red-500 mb-4"></i>
                <p class="text-zinc-400 text-sm">Erro ao carregar o documento.</p>
            `;
            createIcons({ icons });
        }
        
        if (elements.pdfDownloadBtn) {
            elements.pdfDownloadBtn.href = state.selectedItem.pdfUrl;
        }
    }

    // 7. Sidebar Navigation
    const sidebarItemsContainer = document.getElementById('sidebar-labs-items');
    if (sidebarItemsContainer) {
        sidebarItemsContainer.innerHTML = labs.map(lab => `
            <a href="lab.html?id=${lab.id}" class="nav-item">
                <i data-lucide="${lab.icon}" class="w-4 h-4"></i>
                <span>${lab.name}</span>
            </a>
        `).join('');
    }

    // 8. Clock
    const updateClock = () => {
        if (elements.currentDate) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            elements.currentDate.innerHTML = `<span class="text-blue-500 font-bold">${timeStr}</span>`;
        }
    };
    
    updateClock();
    setInterval(updateClock, 1000);

    // 9. Event Listeners
    if (elements.sidebarToggle)  elements.sidebarToggle.addEventListener('click', toggleSidebar);
    if (elements.sidebarOverlay) elements.sidebarOverlay.addEventListener('click', toggleSidebar);
    
    // PDF Control Listeners
    elements.pdfPrevBtn?.addEventListener('click', onPrevPage);
    elements.pdfNextBtn?.addEventListener('click', onNextPage);
    elements.pdfZoomIn?.addEventListener('click', () => changeZoom(0.1));
    elements.pdfZoomOut?.addEventListener('click', () => changeZoom(-0.1));
    
    elements.pdfSearchPrev?.addEventListener('click', () => navigateSearch(-1));
    elements.pdfSearchNext?.addEventListener('click', () => navigateSearch(1));
    
    elements.pdfPageNumInput?.addEventListener('change', (e) => {
        const num = parseInt(e.target.value);
        if (num >= 1 && num <= state.pdfDoc.numPages) {
            state.pageNum = num;
            queueRenderPage(state.pageNum);
        }
    });

    let searchTimeout;
    elements.pdfSearchInput?.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => searchInPDF(e.target.value), 600);
    });

    // 10. Final Polish
    updateSidebarUI();
    createIcons({ icons });
});

