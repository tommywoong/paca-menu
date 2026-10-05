/**
 * PACA CANVA ENGINE
 * Visual Interactive Long-Poster & Drag-and-Drop Canvas Engine
 * Supports Multi-Page, Layers, Product Binding, Dynamic Price Tags, and Responsive Scaling
 */

const PACA_CANVAS_KEYS = {
    PUBLISHED_DESIGN: 'paca_published_canvas_v2',
    DRAFT_DESIGN: 'paca_draft_canvas_v2',
    SETTINGS: 'paca_canvas_settings_v2',
    CLOUD_TOPIC: 'paca_design_sync_dalat_2025',
    CLOUD_BROKER: 'https://ntfy.sh',
    CLOUD_BROKER_FALLBACK: 'https://ntfy.envs.net'
};

class PacaCanvasEngine {
    constructor(options = {}) {
        this.mode = options.mode || 'view'; // 'view' for customer menu, 'edit' for studio
        this.container = options.container || null;
        this.design = null;
        this.activePageId = null;
        this.selectedElementId = null;
        this.undoStack = [];
        this.redoStack = [];
        this.zoom = 1;
        this.onProductClick = options.onProductClick || null;
        this.onSelectionChange = options.onSelectionChange || null;
        this.onDesignChange = options.onDesignChange || null;
    }

    safeSetItem(key, val) {
        try {
            localStorage.setItem(key, val);
        } catch (e) {
            console.warn(`PACA Canvas: Storage write failed for ${key}:`, e);
        }
    }

    safeGetItem(key, fallback = null) {
        try {
            const val = localStorage.getItem(key);
            return val !== null ? val : fallback;
        } catch (e) {
            return fallback;
        }
    }

    // --- INITIALIZATION ---
    async init() {
        try {
            await this.loadDesign();
            if (this.design && this.design.pages && this.design.pages.length > 0) {
                this.activePageId = this.design.pages[0].id;
            }
            if (this.container) {
                this.render();
            }
        } catch (err) {
            console.error("PacaCanvasEngine init error:", err);
        }
    }

    async loadDesign() {
        const storageKey = this.mode === 'edit' ? PACA_CANVAS_KEYS.DRAFT_DESIGN : PACA_CANVAS_KEYS.PUBLISHED_DESIGN;
        const local = this.safeGetItem(storageKey);
        let currentDesign = null;
        if (local) {
            try {
                const parsed = JSON.parse(local);
                if (parsed && Array.isArray(parsed.pages) && parsed.pages.length > 0) {
                    currentDesign = parsed;
                }
            } catch (e) {
                console.warn("Invalid local canvas design", e);
            }
        }

        // Priority 1: Use cached design if available
        if (currentDesign) {
            this.design = currentDesign;
        } else {
            // Priority 2: Fetch default template immediately (local asset, loads in ms)
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3500);
                const res = await fetch('data/default_canvas_template.json?v=' + Date.now(), { cache: 'no-store', signal: controller.signal });
                clearTimeout(timeoutId);
                if (res.ok) {
                    this.design = await res.json();
                    this.safeSetItem(storageKey, JSON.stringify(this.design));
                }
            } catch (e) {
                console.warn("Failed to load default template with cache-buster", e);
                try {
                    const res = await fetch('data/default_canvas_template.json');
                    if (res.ok) {
                        this.design = await res.json();
                        this.safeSetItem(storageKey, JSON.stringify(this.design));
                    }
                } catch (err2) {
                    console.error("Failed to load fallback template", err2);
                }
            }
        }

        if (!this.design || !Array.isArray(this.design.pages) || this.design.pages.length === 0) {
            this.design = {
                version: "2.0",
                title: "PACA Canvas",
                baseWidth: 800,
                pages: [
                    { id: "page_cover", title: "Trang Mở Đầu", width: 800, height: 1000, bg: "#10234d", elements: [] },
                    { id: "page_intro", title: "Lời Chào & Giới Thiệu", width: 800, height: 1000, bg: "#10234d", elements: [] },
                    { id: "page_bites", title: "Món Nhắm (Bites)", width: 800, height: 1000, bg: "#f6dcaf", elements: [] },
                    { id: "page_beer", title: "Bia & Đồ Uống Lên Men (Beer & Cider)", width: 800, height: 1000, bg: "#f6dcaf", elements: [] },
                    { id: "page_wine_shots", title: "Rượu Vang, Shots & Thông Tin Quán", width: 800, height: 1000, bg: "#f6dcaf", elements: [] }
                ]
            };
        }

        // Auto-prune pages belonging to categories deleted from Admin
        this.pruneDeletedCategoryPages();

        // Priority 3: In view mode, check Cloud Sync in background (NON-BLOCKING)
        if (this.mode === 'view') {
            setTimeout(async () => {
                try {
                    const cloudPayload = await this.pullFromCloudSync();
                    if (cloudPayload && cloudPayload.design && Array.isArray(cloudPayload.design.pages) && cloudPayload.design.pages.length > 0) {
                        const localTs = parseInt(this.safeGetItem('paca_canvas_published_timestamp', '0'));
                        if (cloudPayload.timestamp > localTs || !local) {
                            console.log("PACA: Newer design received from Cloud Sync! Updating view...");
                            this.design = cloudPayload.design;
                            this.pruneDeletedCategoryPages();
                            this.safeSetItem(PACA_CANVAS_KEYS.PUBLISHED_DESIGN, JSON.stringify(this.design));
                            this.safeSetItem('paca_canvas_published_timestamp', Math.max(cloudPayload.timestamp, localTs).toString());
                            if (this.container) {
                                this.render();
                            }
                        } else if (localTs > cloudPayload.timestamp && this.design) {
                            // Local published design is newer than cloud -> sync to cloud
                            this.pushToCloudSync().catch(e => console.warn("PACA: Background pushToCloudSync skipped", e));
                        }
                    }
                } catch (err) {
                    console.warn("PACA: Background canvas cloud check skipped", err);
                }
            }, 100);
        }

        return this.design;
    }

    pruneDeletedCategoryPages() {
        if (!this.design || !Array.isArray(this.design.pages)) return false;
        const activeCats = window.paca?.getCategories ? window.paca.getCategories(true) : (window.paca?.menu?.categories || []);
        const deletedCatIds = new Set(window.paca?.getDeletedCategoryIds ? window.paca.getDeletedCategoryIds() : []);
        ['week', 'cocktail', 'mocktail'].forEach(id => deletedCatIds.add(id));

        const initialCount = this.design.pages.length;
        this.design.pages = this.design.pages.filter(page => {
            // Keep intro/cover info pages
            if (page.id === 'page_cover' || page.id === 'page_intro' || page.id === 'sec_cover') return true;

            // Check if page corresponds to a known active category
            const matchesActive = activeCats.some(c => 
                c.id === page.id ||
                c.pageId === page.id ||
                ('page_' + c.id) === page.id ||
                ('sec_cat_' + c.id) === page.id ||
                (c.name_vi && (page.title || '').trim().toLowerCase() === c.name_vi.trim().toLowerCase()) ||
                (c.name && (page.title || '').trim().toLowerCase() === c.name.trim().toLowerCase())
            );

            // Explicitly deleted category IDs
            const isExplicitDeleted = deletedCatIds.has(page.id) || 
                                     (page.id.startsWith('page_') && deletedCatIds.has(page.id.replace('page_', ''))) ||
                                     (page.id.startsWith('sec_cat_') && deletedCatIds.has(page.id.replace('sec_cat_', '')));

            if (isExplicitDeleted) {
                console.log(`PACA Studio: Pruning explicitly deleted category page: ${page.id} (${page.title})`);
                return false;
            }

            // Check if page represents a category section
            const isCatPage = page.id.startsWith('sec_cat_') || 
                              page.id.startsWith('page_cat_') || 
                              ['page_week', 'page_bites', 'page_cocktail', 'page_beer', 'page_wine_shots'].includes(page.id);
            
            if (isCatPage && !matchesActive) {
                console.log(`PACA Studio: Pruning orphaned category page: ${page.id} (${page.title})`);
                return false;
            }

            return true;
        });

        // Also sanitize Cover page link_nav elements pointing to deleted categories
        const coverPage = this.design.pages.find(p => p.id === 'page_cover');
        if (coverPage && Array.isArray(coverPage.elements)) {
            const initialElementsCount = coverPage.elements.length;
            coverPage.elements = coverPage.elements.filter(el => {
                if (el.type !== 'link_nav') return true;
                const target = el.props?.targetPageId || '';
                const text = (el.props?.text || '').toLowerCase();
                // Check if target or text mentions deleted categories
                const isTargetDeleted = deletedCatIds.has(target) ||
                    (target.startsWith('page_') && deletedCatIds.has(target.replace('page_', ''))) ||
                    (target.startsWith('sec_cat_') && deletedCatIds.has(target.replace('sec_cat_', '')));
                const isTextDeleted = (text.includes('menu of the week') && deletedCatIds.has('week')) ||
                    (text.includes('cocktail') && deletedCatIds.has('cocktail')) ||
                    (text.includes('mocktail') && deletedCatIds.has('mocktail'));
                return !isTargetDeleted && !isTextDeleted;
            });
            if (coverPage.elements.length !== initialElementsCount) {
                const storageKey = this.mode === 'edit' ? PACA_CANVAS_KEYS.DRAFT_DESIGN : PACA_CANVAS_KEYS.PUBLISHED_DESIGN;
                this.safeSetItem(storageKey, JSON.stringify(this.design));
            }
        }

        if (this.design.pages.length !== initialCount) {
            if (!this.design.pages.some(p => p.id === this.activePageId)) {
                this.activePageId = this.design.pages[0]?.id || null;
            }
            const storageKey = this.mode === 'edit' ? PACA_CANVAS_KEYS.DRAFT_DESIGN : PACA_CANVAS_KEYS.PUBLISHED_DESIGN;
            this.safeSetItem(storageKey, JSON.stringify(this.design));
            return true;
        }
        return false;
    }

    // --- SAVE & PUBLISH ---
    saveDraft() {
        if (!this.design) return;
        localStorage.setItem(PACA_CANVAS_KEYS.DRAFT_DESIGN, JSON.stringify(this.design));
        if (this.onDesignChange) this.onDesignChange(this.design);
    }

    async publish(pushToCloud = true) {
        if (!this.design) return false;
        this.saveDraft();
        localStorage.setItem(PACA_CANVAS_KEYS.PUBLISHED_DESIGN, JSON.stringify(this.design));
        localStorage.setItem('paca_canvas_published_timestamp', Date.now().toString());

        // Also broadcast event to update client views
        if (window.paca && window.paca.broadcastChannel) {
            window.paca.broadcastChannel.postMessage({ type: 'CANVAS_PUBLISHED', timestamp: Date.now() });
        }

        if (pushToCloud) {
            await this.pushToCloudSync();
        }
        return true;
    }

    async pushToCloudSync() {
        if (!this.design) return false;
        const payload = JSON.stringify({
            version: "1.0",
            timestamp: Date.now(),
            design: this.design
        });
        const brokers = [PACA_CANVAS_KEYS.CLOUD_BROKER, PACA_CANVAS_KEYS.CLOUD_BROKER_FALLBACK];
        for (const broker of brokers) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3500);
                const res = await fetch(`${broker}/${PACA_CANVAS_KEYS.CLOUD_TOPIC}`, {
                    method: 'PUT',
                    headers: {
                        'Filename': 'paca_design.json',
                        'Title': 'PACA Design Published'
                    },
                    body: payload,
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                if (res.ok) {
                    console.log(`PACA: Design published to Cloud Sync (${broker}) successfully!`);
                    return true;
                }
            } catch (e) {
                console.warn(`PACA: Failed to push design to Cloud Sync via ${broker}`, e);
            }
        }
        return false;
    }

    async pullFromCloudSync() {
        const brokers = [PACA_CANVAS_KEYS.CLOUD_BROKER, PACA_CANVAS_KEYS.CLOUD_BROKER_FALLBACK];
        for (const broker of brokers) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3500);
                const res = await fetch(`${broker}/${PACA_CANVAS_KEYS.CLOUD_TOPIC}/json?poll=1&since=24h`, {
                    cache: 'no-store',
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                if (!res.ok) continue;
                const text = await res.text();
                if (!text) continue;
                const lines = text.trim().split('\n');
                let latestAttachmentUrl = null;
                let latestTime = 0;
                for (const line of lines) {
                    try {
                        const item = JSON.parse(line);
                        if (item.attachment && item.attachment.url && item.time > latestTime) {
                            latestAttachmentUrl = item.attachment.url;
                            latestTime = item.time;
                        }
                    } catch (e) {}
                }
                if (latestAttachmentUrl) {
                    const attController = new AbortController();
                    const attTimeout = setTimeout(() => attController.abort(), 3500);
                    const fileRes = await fetch(latestAttachmentUrl, { signal: attController.signal });
                    clearTimeout(attTimeout);
                    if (!fileRes.ok) continue;
                    const fileData = await fileRes.json();
                    if (fileData && fileData.design && Array.isArray(fileData.design.pages)) {
                        return fileData;
                    }
                }
            } catch (e) {
                console.warn(`PACA: Failed to pull design from Cloud Sync via ${broker}`, e);
            }
        }
        return null;
    }

    recordState() {
        if (this.mode !== 'edit' || !this.design) return;
        this.undoStack.push(JSON.stringify(this.design));
        if (this.undoStack.length > 30) this.undoStack.shift();
        this.redoStack = []; // clear redo
    }

    undo() {
        if (this.undoStack.length === 0) return;
        this.redoStack.push(JSON.stringify(this.design));
        const prev = JSON.parse(this.undoStack.pop());
        this.design = prev;
        this.render();
        this.saveDraft();
    }

    redo() {
        if (this.redoStack.length === 0) return;
        this.undoStack.push(JSON.stringify(this.design));
        const next = JSON.parse(this.redoStack.pop());
        this.design = next;
        this.render();
        this.saveDraft();
    }

    // --- RENDERING ENGINE ---
    render() {
        if (!this.container || !this.design) return;

        this.container.innerHTML = '';

        if (this.mode === 'view') {
            this.renderCustomerLongPoster();
        } else {
            this.renderStudioCanvas();
        }
    }

    // --- 1. CUSTOMER MODE: LONG VERTICAL POSTER WITH RESPONSIVE SCALING ---
    renderCustomerLongPoster() {
        const pages = this.design.pages || [];
        const baseWidth = this.design.baseWidth || 800;

        // Container wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'paca-poster-wrapper w-full flex flex-col items-center select-none';

        // Identify custom active categories that do not have dedicated pre-baked canvas pages
        const allCategories = window.paca?.getCategories ? window.paca.getCategories(true) : [];
        const bakedPageIds = new Set(pages.map(p => p.id));
        const dynamicCats = allCategories.filter(c => 
            c.is_active !== false && 
            !bakedPageIds.has(c.pageId) && 
            !bakedPageIds.has('page_' + c.id) &&
            !bakedPageIds.has('sec_cat_' + c.id) &&
            !bakedPageIds.has(c.id)
        );

        pages.forEach((page, pageIdx) => {
            // Check if page belongs to an inactive or deleted category
            const isCatPage = page.id.startsWith('sec_cat_') || 
                              page.id.startsWith('page_cat_') || 
                              ['page_week', 'page_bites', 'page_cocktail', 'page_beer', 'page_wine_shots'].includes(page.id);

            const catForPage = allCategories.find(c => 
                c.id === page.id ||
                c.pageId === page.id || 
                ('page_' + c.id) === page.id ||
                ('sec_cat_' + c.id) === page.id ||
                (page.id.startsWith('page_') && ('page_' + c.id) === page.id) ||
                (c.name_vi && (page.title || '').trim().toLowerCase() === c.name_vi.trim().toLowerCase()) ||
                (c.name && (page.title || '').trim().toLowerCase() === c.name.trim().toLowerCase())
            );

            // If it is a category section page and the category was DELETED from Admin, skip it!
            if (isCatPage && !catForPage) {
                return; // Category was deleted from Admin!
            }

            // If category is inactive, skip it!
            if (catForPage && catForPage.is_active === false) {
                return; // Skip inactive category page completely!
            }

            // Before rendering the final page (page_wine_shots), render any dynamic custom categories!
            if (page.id === 'page_wine_shots' && dynamicCats.length > 0) {
                dynamicCats.forEach(dCat => {
                    this.renderDynamicCategorySection(dCat, wrapper, baseWidth);
                });
            }

            // page_bites renders via standard Canvas renderer so Studio customizations, crimson cards & dish photos appear 100% faithfully!

            const pageContainer = document.createElement('div');
            pageContainer.id = page.id;
            pageContainer.className = 'paca-page-container relative overflow-hidden transition-all';
            pageContainer.style.width = '100%';
            pageContainer.style.maxWidth = `${baseWidth}px`;
            
            // Maintain aspect ratio box
            const ratioPercent = (page.height / baseWidth) * 100;
            pageContainer.style.paddingTop = `${ratioPercent}%`; // responsive aspect ratio container
            pageContainer.style.background = page.bg || '#f6dcaf';

            // Inner absolute content viewport
            const innerBox = document.createElement('div');
            innerBox.className = 'absolute inset-0 w-full h-full overflow-hidden';

            // Background image & overlay if present
            if (page.bgImage) {
                const bgImg = document.createElement('div');
                bgImg.className = 'absolute inset-0 bg-cover bg-center';
                bgImg.style.backgroundImage = `url('${page.bgImage}')`;
                innerBox.appendChild(bgImg);
            }
            if (page.bgOverlay) {
                const bgOverlay = document.createElement('div');
                bgOverlay.className = 'absolute inset-0';
                bgOverlay.style.backgroundColor = page.bgOverlay;
                innerBox.appendChild(bgOverlay);
            }

            // On Cover Page: dynamically filter active categories marked show_on_cover !== false
            if (page.id === 'page_cover') {
                const hasExplicitNavLinks = (page.elements || []).some(el => el.type === 'link_nav');
                if (hasExplicitNavLinks) {
                    const nonLinkElements = (page.elements || []).filter(el => el.type !== 'link_nav');
                    const rawNavLinks = (page.elements || []).filter(el => el.type === 'link_nav');

                    // Filter only links that belong to an ACTIVE, EXISTING category marked for cover
                    const activeNavLinks = rawNavLinks.filter(el => {
                        const targetId = el.props?.targetPageId || '';
                        const elId = el.id || '';
                        const text = (el.props?.text || '').trim().toLowerCase();

                        const matchedCat = allCategories.find(c => 
                            c.id === targetId ||
                            c.pageId === targetId ||
                            ('sec_cat_' + c.id) === targetId ||
                            ('page_' + c.id) === targetId ||
                            elId === ('nav_link_cat_' + c.id) ||
                            elId === ('nav_link_' + c.id) ||
                            (c.name && text.includes(c.name.trim().toLowerCase())) ||
                            (c.name_vi && text.includes(c.name_vi.trim().toLowerCase()))
                        );

                        // If linked to an existing category, check is_active and show_on_cover
                        if (matchedCat) {
                            return matchedCat.is_active !== false && matchedCat.show_on_cover !== false;
                        }

                        // Check if this link was created for a category (by ID prefix or targetPageId)
                        const isCategoryLink = targetId.startsWith('sec_cat_') || 
                                               elId.startsWith('nav_link_cat_') || 
                                               ['page_week', 'page_bites', 'page_cocktail', 'page_beer', 'page_wine_shots'].includes(targetId);

                        // If it IS a category link, but matchedCat is null, IT MEANS THE CATEGORY WAS DELETED!
                        if (isCategoryLink) {
                            return false; // Skip deleted category link!
                        }

                        // If not explicitly matched, check if text contains an inactive or deleted category name
                        const isInactiveCat = allCategories.some(c => 
                            c.is_active === false && (
                                (c.name && text.includes(c.name.trim().toLowerCase())) ||
                                (c.name_vi && text.includes(c.name_vi.trim().toLowerCase()))
                            )
                        );
                        if (isInactiveCat) return false;
                        return true;
                    });

                    // Render non-link elements first
                    nonLinkElements.forEach(el => {
                        const elNode = this.createCustomerElementNode(el, baseWidth, page.height);
                        if (elNode) innerBox.appendChild(elNode);
                    });

                    // Evenly distribute and render active nav links so there are no empty gaps
                    if (activeNavLinks.length > 0) {
                        const firstY = rawNavLinks[0]?.y || 220;
                        const availableHeight = Math.max(200, (page.height || 1000) - firstY - 140);
                        const spacing = Math.min(75, Math.max(48, Math.floor(availableHeight / activeNavLinks.length)));

                        activeNavLinks.forEach((el, idx) => {
                            const adjustedEl = {
                                ...el,
                                y: firstY + idx * spacing,
                                h: Math.min(el.h || 50, spacing - 10)
                            };
                            const elNode = this.createCustomerElementNode(adjustedEl, baseWidth, page.height);
                            if (elNode) innerBox.appendChild(elNode);
                        });
                    }
                } else {
                    // Fallback to dynamic cover category links if no link_nav elements placed
                    (page.elements || []).forEach(el => {
                        if (el.type !== 'link_nav') {
                            const elNode = this.createCustomerElementNode(el, baseWidth, page.height);
                            if (elNode) innerBox.appendChild(elNode);
                        }
                    });

                    const coverCats = allCategories.filter(c => c.is_active !== false && c.show_on_cover !== false);
                    if (coverCats.length > 0) {
                        const navContainer = document.createElement('div');
                        navContainer.id = 'coverDynamicNavContainer';
                        navContainer.className = 'absolute z-10 flex flex-col items-center justify-center space-y-2.5 sm:space-y-4';
                        navContainer.style.left = '5%';
                        navContainer.style.right = '5%';
                        navContainer.style.top = '24%';
                        navContainer.style.bottom = '8%';

                        coverCats.forEach(cat => {
                            const linkBtn = document.createElement('button');
                            linkBtn.className = 'group relative w-full max-w-lg text-center font-serif font-black tracking-wider uppercase text-white hover:text-amber-300 transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 py-1';
                            const targetId = cat.pageId || ('sec_cat_' + cat.id);
                            linkBtn.innerHTML = `
                                <span class="text-base sm:text-2xl">${cat.icon || '✦'}</span>
                                <span class="underline decoration-amber-400/60 decoration-2 underline-offset-4 text-sm sm:text-xl md:text-2xl drop-shadow-md">
                                    ${cat.name || cat.name_vi}
                                </span>
                            `;
                            linkBtn.onclick = (e) => {
                                e.preventDefault();
                                const targetEl = document.getElementById(targetId);
                                if (targetEl) {
                                    targetEl.scrollIntoView({ behavior: 'smooth' });
                                }
                            };
                            navContainer.appendChild(linkBtn);
                        });
                        innerBox.appendChild(navContainer);
                    }
                }
            } else {
                // Render all elements proportionally using percentage coordinates
                (page.elements || []).forEach(el => {
                    const elNode = this.createCustomerElementNode(el, baseWidth, page.height);
                    if (elNode) innerBox.appendChild(elNode);
                });
            }

            pageContainer.appendChild(innerBox);
            wrapper.appendChild(pageContainer);
        });

        // In case page_wine_shots was not present or dynamicCats were not added
        if (!pages.some(p => p.id === 'page_wine_shots') && dynamicCats.length > 0) {
            dynamicCats.forEach(dCat => {
                this.renderDynamicCategorySection(dCat, wrapper, baseWidth);
            });
        }

        this.container.appendChild(wrapper);
    }

    // --- DYNAMIC CATEGORY SECTION (For new/custom categories created in Admin) ---
    renderDynamicCategorySection(cat, wrapper, baseWidth) {
        if (!cat || cat.is_active === false) return;
        const deletedDishIds = new Set(window.paca?.getDeletedDishIds ? window.paca.getDeletedDishIds() : []);
        const dishes = (window.paca?.menu?.items || []).filter(i => i.category === cat.id && !deletedDishIds.has(i.id));
        const pageContainer = document.createElement('div');
        pageContainer.id = cat.pageId || ('sec_cat_' + cat.id);
        pageContainer.className = 'paca-page-container w-full max-w-[800px] overflow-visible bg-[#f9f2e7] pt-8 pb-16 px-4 sm:px-8 border-b-4 border-paca-navy shadow-sm relative transition-all';

        // Header
        const headerDiv = document.createElement('div');
        headerDiv.className = 'w-full text-center space-y-2 mb-6';
        headerDiv.innerHTML = `
            <div class="inline-block bg-paca-crimson text-white text-[10px] sm:text-xs font-black uppercase px-3 py-1 rounded-full tracking-widest shadow-sm">
                ${cat.icon ? cat.icon + ' ' : ''}${cat.name || cat.name_vi}
            </div>
            <h2 class="font-serif font-black text-2xl sm:text-4xl text-paca-crimson tracking-wider uppercase">
                ${cat.name_vi || cat.name}
            </h2>
            ${cat.description ? `
                <p class="font-serif italic text-xs sm:text-sm text-paca-navy font-semibold max-w-md mx-auto">
                    “${cat.description}”
                </p>
            ` : ''}
        `;
        pageContainer.appendChild(headerDiv);

        // Dishes Grid / List
        const isHighlight = cat.display_layout === 'highlight';
        const isList = cat.display_layout === 'card_list';
        const gridDiv = document.createElement('div');
        gridDiv.className = (isList || isHighlight) ? 'flex flex-col space-y-4 w-full' : 'grid grid-cols-1 sm:grid-cols-2 gap-5 w-full';

        if (dishes.length === 0) {
            gridDiv.innerHTML = `
                <div class="col-span-full py-8 text-center text-gray-500 italic text-sm bg-white/60 rounded-2xl border border-dashed border-gray-300">
                    Danh mục này đang được cập nhật món mới. Vui lòng quay lại sau nhé! ✨
                </div>
            `;
        } else {
            dishes.forEach(item => {
                const isSoldOut = item.is_available === false;
                const hasOptions = (item.variants && item.variants.length > 0) || (item.options && item.options.length > 0);
                
                const card = document.createElement('div');
                card.id = `dyn_card_${item.id}`;
                card.className = 'bg-white rounded-2xl border-2 border-paca-navy shadow-[4px_4px_0px_#10234d] hover:shadow-[6px_6px_0px_#10234d] transition-all overflow-hidden flex flex-col justify-between cursor-pointer active:scale-[0.99] h-auto';
                if (isSoldOut) card.style.opacity = '0.78';

                let mediaHtml = '';
                if (item.image) {
                    mediaHtml = `
                        <div class="h-44 sm:h-48 w-full relative overflow-hidden bg-amber-50 border-b-2 border-paca-navy flex-shrink-0">
                            <img src="${item.image}" class="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105" alt="${item.name}" loading="lazy">
                            ${item.badge ? `
                                <span class="absolute top-2.5 left-2.5 bg-paca-crimson text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow border border-white/50">
                                    ${item.badge}
                                </span>
                            ` : ''}
                        </div>
                    `;
                } else {
                    mediaHtml = `
                        <div class="h-32 sm:h-36 w-full bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100 border-b-2 border-paca-navy flex flex-col items-center justify-center p-3 text-center relative select-none flex-shrink-0">
                            <div class="text-3xl mb-1">${cat.icon || '🍹'}</div>
                            <div class="font-serif font-black text-xs sm:text-sm text-paca-navy uppercase tracking-wider">${item.name}</div>
                            ${item.badge ? `
                                <span class="absolute top-2.5 left-2.5 bg-paca-crimson text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow">
                                    ${item.badge}
                                </span>
                            ` : ''}
                        </div>
                    `;
                }

                let actionBtnHtml = '';
                if (isSoldOut) {
                    actionBtnHtml = `<span class="bg-gray-100 text-gray-400 text-xs font-bold px-3 py-1.5 rounded-xl cursor-not-allowed border border-gray-200">Hết món</span>`;
                } else if (hasOptions) {
                    actionBtnHtml = `<button onclick="event.stopPropagation(); if(window.openDetailModal) window.openDetailModal('${item.id}');" class="bg-paca-navy hover:bg-paca-dark text-paca-cream text-xs font-bold px-3.5 py-1.5 rounded-xl shadow active:scale-95">Tuỳ chọn ▾</button>`;
                } else {
                    actionBtnHtml = `<button onclick="event.stopPropagation(); if(window.quickAddToCart) window.quickAddToCart('${item.id}');" class="bg-paca-crimson hover:bg-paca-red text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow active:scale-95">+ Thêm</button>`;
                }

                card.innerHTML = `
                    <div>
                        ${mediaHtml}
                        <div class="p-3.5 sm:p-4 space-y-1.5">
                            <div class="flex items-start justify-between gap-2">
                                <h3 class="font-serif font-black text-sm sm:text-base text-paca-navy uppercase tracking-wide leading-tight">
                                    ${item.name}
                                </h3>
                                <span class="font-bold text-sm sm:text-base text-paca-crimson whitespace-nowrap">
                                    ${window.paca.formatMoney(item.price)}
                                </span>
                            </div>
                            ${item.name_vi ? `
                                <div class="text-[11px] sm:text-xs font-semibold text-gray-700 leading-tight">
                                    ${item.name_vi}
                                </div>
                            ` : ''}
                            ${item.ingredients && item.ingredients.length > 0 ? `
                                <div class="text-[10px] text-gray-500 font-mono leading-tight">
                                    ${item.ingredients.join(', ')}
                                </div>
                            ` : ''}
                            ${item.description_vi ? `
                                <p class="text-xs text-gray-600 italic leading-relaxed pt-1 border-t border-dashed border-gray-200">
                                    ${item.description_vi}
                                </p>
                            ` : ''}
                        </div>
                    </div>
                    <div class="p-3 sm:p-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <span class="text-[11px] text-gray-500">${cat.name_vi || cat.name}</span>
                        ${actionBtnHtml}
                    </div>
                `;

                card.onclick = (e) => {
                    if (isSoldOut) {
                        if (window.showToast) window.showToast("Món này tạm thời hết hàng, bạn vui lòng chọn món khác nhé! 🍹", "warning");
                        return;
                    }
                    if (hasOptions) {
                        if (window.openDetailModal) window.openDetailModal(item.id);
                    } else {
                        if (window.quickAddToCart) {
                            window.quickAddToCart(item.id);
                        } else if (window.openDetailModal) {
                            window.openDetailModal(item.id);
                        }
                    }
                };

                gridDiv.appendChild(card);
            });
        }

        pageContainer.appendChild(gridDiv);
        wrapper.appendChild(pageContainer);
    }

    // --- RESPONSIVE BITES PAGE (Natural card height, 1-col mobile / 2-col desktop, no text clipping) ---
    renderCustomerBitesPage(page, wrapper, baseWidth) {
        const pageContainer = document.createElement('div');
        pageContainer.id = page.id;
        pageContainer.className = 'paca-page-container w-full max-w-[800px] overflow-visible bg-[#f9f2e7] pt-8 pb-36 px-4 sm:px-8 border-b-4 border-paca-navy shadow-sm relative transition-all';

        // Header Section
        const headerDiv = document.createElement('div');
        headerDiv.className = 'w-full text-center space-y-2 mb-6';
        headerDiv.innerHTML = `
            <div class="inline-block bg-paca-crimson text-white text-[10px] sm:text-xs font-black uppercase px-3 py-1 rounded-full tracking-widest shadow-sm">
                SNACKS & FOOD MENU
            </div>
            <h2 class="font-serif font-black text-2xl sm:text-4xl text-paca-crimson tracking-wider uppercase">
                BITES & NHÂM NHI
            </h2>
            <p class="font-serif italic text-xs sm:text-sm text-paca-navy font-semibold">
                “Tasty bites to pair with your drinks”
            </p>
            <div class="w-full max-w-[320px] mx-auto py-2">
                <img src="assets/canva/0ed9724561aeefbf35f76b1414bc4841.png" 
                     class="w-full h-auto object-contain mx-auto drop-shadow-md select-none pointer-events-none" 
                     alt="PACA Bites Illustration">
            </div>
            <div class="inline-flex items-center gap-2 bg-amber-100/90 border border-amber-300 text-paca-navy text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-sm">
                <span>🍟</span>
                <span>Beauty comes in all shapes and sizes • Fried fresh to order</span>
            </div>
        `;
        pageContainer.appendChild(headerDiv);

        // Dishes Grid: 1 column on mobile (< 640px), 2 columns on desktop (>= 640px)
        const gridDiv = document.createElement('div');
        gridDiv.className = 'grid grid-cols-1 sm:grid-cols-2 gap-5 w-full';

        // Canonical Bites list (b01 to b08)
        const bitesItems = [
            { id: 'b01', defaultTitle: 'FRENCH FRIES WITH GARLIC FISH SAUCE', defaultPrice: 70000, defaultBadge: 'Best Seller', image: 'assets/canva/0e6ad945841bfc9bde3aefe8930e6839.png', desc: 'Khoai tây chiên giòn rụm xốc sốt nước mắm tỏi ớt đậm đà thơm lừng.' },
            { id: 'b02', defaultTitle: 'FRENCH FRIES WITH BACON & CHEESE', defaultPrice: 95000, defaultBadge: 'Must Try', image: 'assets/canva/c243f99dc58032a0f023c28ba843eac2.png', desc: 'Khoai tây chiên phủ ngập xốt phô mai béo ngậy và thịt xông khói giòn tan.' },
            { id: 'b03', defaultTitle: 'FRENCH FRIES WITH CHEESE', defaultPrice: 70000, defaultBadge: 'Cheesy', image: 'assets/canva/2478f97ef54304ee79763d99641719e0.png', desc: 'Khoai tây chiên vàng giòn rưới đẫm xốt phô mai cheddar tan chảy béo ngậy.' },
            { id: 'b04', defaultTitle: 'CLASSIC FRENCH FRIES', defaultPrice: 55000, defaultBadge: 'Classic', image: 'assets/canva/0e6ad945841bfc9bde3aefe8930e6839.png', desc: 'Khoai tây cọng truyền thống chiên ráo dầu, giòn lâu ăn kèm sốt.' },
            { id: 'b05', defaultTitle: 'FRIES WITH CREAMY ONION SAUCE', defaultPrice: 70000, defaultBadge: 'New', image: 'assets/canva/5dc4519f512c639864a5c59fcd450574.jpg', desc: 'Khoai tây chiên giòn phủ sốt kem chua hành tây thơm béo mịn màng đặc trưng.' },
            { id: 'b06', defaultTitle: 'FRIED WONTON CHIPS', defaultPrice: 55000, defaultBadge: 'Snack', image: 'assets/canva/192a266e9d811dc75d8647348854481c.jpg', desc: 'Lá hoành thánh chiên phồng giòn tan chấm tương ớt cay ngọt vui miệng.' },
            { id: 'b07', defaultTitle: 'CRISPY FRIED MACARONI & CHEESE', defaultPrice: 55000, defaultBadge: 'Popular', image: '', desc: 'Nui chiên phồng giòn rụm lắc bột phô mai mặn ngọt đậm đà, món nhắm lai rai cực dính.' },
            { id: 'b08', defaultTitle: 'POPCORN CHICKEN CHEESE', defaultPrice: 95000, defaultBadge: 'M/L Options', image: '', desc: 'Gà chiên giòn rụm áo sốt cay ngọt Hàn Quốc phủ ngập phô mai kéo sợi thơm phức.' }
        ];

        const deletedDishIds = new Set(window.paca?.getDeletedDishIds ? window.paca.getDeletedDishIds() : []);
        // Only keep bites that are NOT deleted and still exist in menu
        const activeBitesItems = bitesItems.filter(b => !deletedDishIds.has(b.id) && (window.paca?.menu?.items || []).some(it => it.id === b.id));

        // Include any custom new dishes added to Bites in Admin (e.g. t4ss)
        const customBites = (window.paca?.menu?.items || []).filter(i => 
            i.category === 'bites' && !activeBitesItems.some(b => b.id === i.id) && !deletedDishIds.has(i.id)
        );
        customBites.forEach(cItem => {
            activeBitesItems.push({
                id: cItem.id,
                defaultTitle: cItem.name,
                defaultPrice: cItem.price,
                defaultBadge: cItem.badge || 'Món Mới',
                image: cItem.image || '',
                desc: cItem.description_vi || cItem.description || 'Món nhắm mới chế biến tươi nóng phục vụ quý khách.'
            });
        });

        activeBitesItems.forEach(itemDef => {
            if (deletedDishIds.has(itemDef.id)) return;
            const boundProduct = window.paca?.menu?.items?.find(i => i.id === itemDef.id);
            if (!boundProduct) return;
            const isSoldOut = boundProduct && boundProduct.is_available === false;
            const hasOptions = boundProduct && ((boundProduct.variants && boundProduct.variants.length > 0) || (boundProduct.options && boundProduct.options.length > 0) || (boundProduct.toppings && boundProduct.toppings.length > 0));
            
            const card = document.createElement('div');
            card.id = `bite_card_${itemDef.id}`;
            card.className = 'bg-white rounded-2xl border-2 border-paca-navy shadow-[4px_4px_0px_#10234d] hover:shadow-[6px_6px_0px_#10234d] transition-all overflow-hidden flex flex-col justify-between cursor-pointer active:scale-[0.99] h-auto';
            if (isSoldOut) card.style.opacity = '0.78';

            const priceFormatted = boundProduct ? window.paca.formatMoney(boundProduct.price) : window.paca.formatMoney(itemDef.defaultPrice);
            const title = boundProduct?.name || itemDef.defaultTitle;
            const nameVi = boundProduct?.name_vi || '';
            const desc = boundProduct?.description_vi || itemDef.desc;
            const badge = boundProduct?.badge || itemDef.defaultBadge;

            // Media header: Real Canva Image OR Authentic PACA Retro Placeholder
            let mediaHtml = '';
            if (itemDef.image) {
                mediaHtml = `
                    <div class="h-44 sm:h-48 w-full relative overflow-hidden bg-amber-50 border-b-2 border-paca-navy flex-shrink-0">
                        <img src="${itemDef.image}" class="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105" alt="${title}" loading="lazy">
                        ${badge ? `
                            <span class="absolute top-2.5 left-2.5 bg-paca-crimson text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow border border-white/50">
                                ${badge}
                            </span>
                        ` : ''}
                    </div>
                `;
            } else if (itemDef.id === 'b07') {
                // b07: Macaroni retro placeholder (Crispy fried macaroni & cheese - No fake photo!)
                mediaHtml = `
                    <div class="h-44 sm:h-48 w-full bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100 border-b-2 border-paca-navy flex flex-col items-center justify-center p-4 text-center relative select-none flex-shrink-0">
                        <div class="w-12 h-12 rounded-2xl bg-amber-300/90 border border-amber-600 flex items-center justify-center text-2xl shadow-sm mb-1">
                            🧀
                        </div>
                        <div class="font-serif font-black text-xs sm:text-sm text-paca-navy uppercase tracking-wider">
                            Nui Lắc Phô Mai PACA
                        </div>
                        <div class="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-200/90 px-2.5 py-0.5 rounded-full mt-1 border border-amber-400 shadow-sm">
                            <span>📸</span>
                            <span>Đang cập nhật ảnh món</span>
                        </div>
                        <div class="text-[9px] text-amber-800/80 mt-1 italic">
                            Giòn rụm béo ngậy • Chuẩn vị snack quán
                        </div>
                        ${badge ? `
                            <span class="absolute top-2.5 left-2.5 bg-amber-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow border border-white/50">
                                ${badge}
                            </span>
                        ` : ''}
                    </div>
                `;
            } else {
                // b08: Popcorn Chicken Cheese retro placeholder (No fake photo!)
                mediaHtml = `
                    <div class="h-44 sm:h-48 w-full bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100 border-b-2 border-paca-navy flex flex-col items-center justify-center p-4 text-center relative select-none flex-shrink-0">
                        <div class="w-12 h-12 rounded-2xl bg-rose-300/90 border border-rose-600 flex items-center justify-center text-2xl shadow-sm mb-1">
                            🍗
                        </div>
                        <div class="font-serif font-black text-xs sm:text-sm text-paca-navy uppercase tracking-wider">
                            Gà Viên Phô Mai PACA
                        </div>
                        <div class="inline-flex items-center gap-1 text-[10px] font-bold text-rose-900 bg-rose-200/90 px-2.5 py-0.5 rounded-full mt-1 border border-rose-400 shadow-sm">
                            <span>📸</span>
                            <span>Đang cập nhật ảnh món</span>
                        </div>
                        <div class="text-[9px] text-rose-800/80 mt-1 italic">
                            Sốt cay ngọt & Phô mai kéo sợi
                        </div>
                        ${badge ? `
                            <span class="absolute top-2.5 left-2.5 bg-paca-crimson text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow border border-white/50">
                                ${badge}
                            </span>
                        ` : ''}
                    </div>
                `;
            }

            // Action button
            let actionBtn = '';
            if (isSoldOut) {
                actionBtn = `<span class="bg-gray-200 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-xl cursor-not-allowed">HẾT MÓN</span>`;
            } else if (hasOptions) {
                actionBtn = `<button class="bg-amber-400 hover:bg-amber-300 text-paca-navy text-xs font-black px-3.5 py-1.5 rounded-xl shadow-sm transition flex items-center gap-1"><span>Tuỳ chọn</span><span>▾</span></button>`;
            } else {
                actionBtn = `<button class="bg-amber-400 hover:bg-amber-300 text-paca-navy text-xs font-black px-3.5 py-1.5 rounded-xl shadow-sm transition flex items-center gap-1"><span>+</span><span>Thêm</span></button>`;
            }

            card.innerHTML = `
                ${mediaHtml}
                <div class="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
                    <div class="space-y-1">
                        <div class="flex items-start justify-between gap-2">
                            <h3 class="font-serif font-black text-sm sm:text-base text-paca-navy leading-snug uppercase">
                                ${title}
                            </h3>
                            <span class="font-black text-sm sm:text-base text-paca-crimson whitespace-nowrap">
                                ${priceFormatted}
                            </span>
                        </div>
                        ${nameVi ? `<p class="text-[11px] font-bold text-gray-500">${nameVi}</p>` : ''}
                        <p class="text-xs text-gray-700 leading-relaxed font-normal pt-1">
                            ${desc}
                        </p>
                    </div>

                    <div class="pt-2.5 border-t border-gray-100 flex items-center justify-between mt-auto">
                        <span class="text-[11px] font-semibold text-gray-400">🍳 Món Bếp Nóng</span>
                        <div class="action-btn-container pointer-events-auto">
                            ${actionBtn}
                        </div>
                    </div>
                </div>
            `;

            card.onclick = (e) => {
                if (isSoldOut) {
                    if (window.showToast) window.showToast("Món này tạm thời hết hàng, bạn vui lòng chọn món khác nhé! 🍹", "warning");
                    return;
                }
                if (hasOptions) {
                    if (window.openDetailModal) window.openDetailModal(itemDef.id);
                } else {
                    if (window.quickAddToCart) {
                        window.quickAddToCart(itemDef.id);
                    } else if (window.openDetailModal) {
                        window.openDetailModal(itemDef.id);
                    }
                }
            };

            gridDiv.appendChild(card);
        });

        pageContainer.appendChild(gridDiv);
        wrapper.appendChild(pageContainer);
    }

    createCustomerElementNode(el, baseW, baseH) {
        const node = document.createElement('div');
        node.id = `el_${el.id}`;
        node.className = 'absolute transition-transform';
        
        // Percent positioning ensures 100% precision regardless of device width
        const leftPct = (el.x / baseW) * 100;
        const topPct = (el.y / baseH) * 100;
        const widthPct = (el.w / baseW) * 100;
        const heightPct = (el.h / baseH) * 100;

        node.style.left = `${leftPct}%`;
        node.style.top = `${topPct}%`;
        node.style.width = `${widthPct}%`;
        node.style.height = `${heightPct}%`;
        node.style.zIndex = el.zIndex || 1;
        if (el.rotate) node.style.transform = `rotate(${el.rotate}deg)`;

        // Product Binding info
        let boundProduct = null;
        if (el.binding && el.binding.productId) {
            const deletedDishIds = new Set(window.paca?.getDeletedDishIds ? window.paca.getDeletedDishIds() : []);
            if (deletedDishIds.has(el.binding.productId)) {
                return null; // Omit dishes that were deleted!
            }
            if (window.paca?.menu?.items) {
                boundProduct = window.paca.menu.items.find(i => i.id === el.binding.productId);
                if (boundProduct) {
                    const allCats = window.paca?.getCategories ? window.paca.getCategories(true) : [];
                    const prodCat = allCats.find(c => c.id === boundProduct.category);
                    if (prodCat && prodCat.is_active === false) {
                        return null; // Omit dishes of hidden/inactive category!
                    }
                }
            }
        }

        // Element types
        if (el.type === 'link_nav') {
            node.className += ' cursor-pointer hover:scale-105 active:scale-95 transition-transform flex items-center justify-center';
            node.innerHTML = `
                <span style="
                    font-size: clamp(14px, 4vw, ${el.props.size || 24}px);
                    font-weight: ${el.props.weight || 'bold'};
                    color: ${el.props.color || '#fff'};
                    text-decoration: ${el.props.underline ? 'underline' : 'none'};
                    letter-spacing: 1px;
                ">
                    ${el.props.icon ? `<span class="mr-1">${el.props.icon}</span>` : ''}
                    ${el.props.text}
                </span>
            `;
            node.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const targetId = el.props.targetPageId;
                if (!targetId) return;
                const targetEl = document.getElementById(targetId);
                if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
            };
            return node;
        }

        if (el.type === 'text') {
            node.style.display = 'flex';
            node.style.alignItems = 'center';
            node.style.justifyContent = el.props.align === 'center' ? 'center' : (el.props.align === 'right' ? 'flex-end' : 'flex-start');
            node.style.textAlign = el.props.align || 'left';
            node.style.whiteSpace = 'pre-line';
            node.style.lineHeight = el.props.lineSpacing || 1.3;
            node.style.fontFamily = el.props.font || 'inherit';
            node.style.fontWeight = el.props.weight || 'normal';
            node.style.fontStyle = el.props.italic ? 'italic' : 'normal';
            node.style.color = el.props.color || '#000';
            node.style.letterSpacing = el.props.letterSpacing ? `${el.props.letterSpacing}px` : 'normal';
            // Responsive font size clamp
            const baseSize = el.props.size || 16;
            node.style.fontSize = `clamp(10px, ${(baseSize / baseW) * 100}vw, ${baseSize}px)`;
            node.innerText = el.props.text;

            if (el.props.targetPageId) {
                node.className += ' cursor-pointer hover:opacity-80 active:scale-[0.98] transition';
                node.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const targetEl = document.getElementById(el.props.targetPageId);
                    if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
                };
            }
            return node;
        }

        if (el.type === 'shape') {
            node.style.backgroundColor = el.props.fill || 'transparent';
            if (el.props.border) node.style.border = el.props.border;
            if (el.props.radius) node.style.borderRadius = `${el.props.radius}px`;
            if (el.props.shadow) node.style.boxShadow = el.props.shadow;
            if (el.props.targetPageId) {
                node.className += ' cursor-pointer hover:opacity-90 active:scale-[0.98] transition';
                node.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const targetEl = document.getElementById(el.props.targetPageId);
                    if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
                };
            }
            return node;
        }

        if (el.type === 'image') {
            const isBound = !!boundProduct;
            const isSoldOut = boundProduct && boundProduct.is_available === false;
            const hasOptions = boundProduct && ((boundProduct.variants && boundProduct.variants.length > 0) || (boundProduct.options && boundProduct.options.length > 0) || (boundProduct.toppings && boundProduct.toppings.length > 0));

            const img = document.createElement('img');
            img.src = el.props.src;
            img.className = 'w-full h-full object-cover pointer-events-none transition-transform duration-300';
            if (el.props.fit) img.style.objectFit = el.props.fit;
            if (el.props.radius) img.style.borderRadius = `${el.props.radius}px`;
            if (el.props.opacity) img.style.opacity = el.props.opacity;

            if (isBound) {
                node.className += ' cursor-pointer group overflow-hidden relative active:scale-[0.98] transition-all select-none shadow-md';
                node.style.borderRadius = el.props.radius ? `${el.props.radius}px` : '12px';
                if (isSoldOut) node.style.opacity = '0.85';

                node.appendChild(img);

                // Live price badge & title banner overlay
                const livePriceFormatted = window.paca?.formatMoney ? window.paca.formatMoney(boundProduct.price) : `${boundProduct.price}đ`;

                let actionBtnHtml = '';
                if (isSoldOut) {
                    actionBtnHtml = `<span class="bg-black/60 text-white/90 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full cursor-not-allowed">HẾT MÓN</span>`;
                } else if (hasOptions) {
                    actionBtnHtml = `<span class="bg-amber-400 text-paca-navy text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-full shadow hover:bg-amber-300">Tuỳ chọn ▾</span>`;
                } else {
                    actionBtnHtml = `<span class="bg-amber-400 text-paca-navy text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-full shadow hover:bg-amber-300">+ Thêm</span>`;
                }

                // Retro circular SOLD OUT stamp
                const soldOutBadgeHtml = isSoldOut ? `
                    <div class="absolute -top-2 -right-2 z-30 pointer-events-none select-none" style="transform: rotate(12deg); width: 56px; height: 56px;">
                        <img src="assets/canva/8bfa0742f6571d5384f3b5184c981ed2.png" class="w-full h-full object-contain drop-shadow-md" alt="SOLD OUT">
                    </div>
                ` : '';

                const overlay = document.createElement('div');
                overlay.className = 'absolute inset-0 flex flex-col justify-between pointer-events-none p-2';
                overlay.innerHTML = `
                    ${soldOutBadgeHtml}
                    <div class="flex justify-end">
                        <span class="bg-black/75 backdrop-blur-sm text-amber-300 font-extrabold text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full border border-amber-400/40 shadow-sm pointer-events-auto">
                            ${livePriceFormatted}
                        </span>
                    </div>
                    <div class="bg-gradient-to-t from-black/90 via-black/60 to-transparent -mx-2 -mb-2 p-2 pt-4 flex items-end justify-between gap-1 pointer-events-auto">
                        <div class="leading-tight text-white pr-1 overflow-hidden">
                            <div class="font-serif font-black text-[11px] sm:text-xs md:text-sm tracking-wide uppercase line-clamp-1 drop-shadow">
                                ${boundProduct.name}
                            </div>
                            <div class="text-[9px] text-amber-200 line-clamp-1 opacity-90 drop-shadow">
                                ${boundProduct.name_vi || ''}
                            </div>
                        </div>
                        <div class="flex-shrink-0">
                            ${actionBtnHtml}
                        </div>
                    </div>
                `;
                node.appendChild(overlay);

                node.onclick = (e) => {
                    e.stopPropagation();
                    if (isSoldOut) {
                        if (window.showToast) window.showToast("Món này tạm thời hết hàng, bạn vui lòng chọn món khác nhé! 🍹", "warning");
                        else alert("Món này tạm thời hết hàng, bạn vui lòng chọn món khác nhé!");
                        return;
                    }
                    const prodId = el.binding.productId;
                    if (hasOptions) {
                        if (window.openDetailModal) window.openDetailModal(prodId);
                    } else {
                        if (window.quickAddToCart) window.quickAddToCart(prodId);
                        else if (window.openDetailModal) window.openDetailModal(prodId);
                    }
                };
                return node;
            } else if (el.props.targetPageId) {
                // Image used as navigation banner
                node.className += ' cursor-pointer hover:opacity-90 active:scale-[0.98] transition';
                if (el.props.radius) node.style.borderRadius = `${el.props.radius}px`;
                node.appendChild(img);
                node.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const targetEl = document.getElementById(el.props.targetPageId);
                    if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
                };
                return node;
            } else {
                node.appendChild(img);
                return node;
            }
        }

        if (el.type === 'product_card') {
            const isSoldOut = boundProduct && boundProduct.is_available === false;
            const hasOptions = boundProduct && ((boundProduct.variants && boundProduct.variants.length > 0) || (boundProduct.options && boundProduct.options.length > 0) || (boundProduct.toppings && boundProduct.toppings.length > 0));
            let itemImage = el.props.image || boundProduct?.image;
            if (!itemImage && el.binding?.productId === 'b08') {
                itemImage = 'assets/canva/popcorn_chicken_cheese.jpg';
            }

            node.className += ' cursor-pointer active:scale-[0.98] transition-all p-2 sm:p-2.5 md:p-3 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md';
            node.style.backgroundColor = el.props.bg || '#940b05';
            node.style.color = el.props.color || '#fff';
            if (el.props.border) node.style.border = el.props.border;
            if (el.props.shadow) node.style.boxShadow = el.props.shadow;
            node.style.borderRadius = '8px';
            if (isSoldOut) {
                node.style.opacity = '0.78';
            }

            // Live Price
            const livePriceFormatted = boundProduct ? window.paca.formatMoney(boundProduct.price) : `${el.props.price || 180}k`;

            // Retro circular SOLD OUT stamp (Canva original stamp tilted ~12deg, top right)
            const soldOutBadgeHtml = isSoldOut ? `
                <div class="absolute -top-3.5 -right-3.5 z-30 pointer-events-none select-none" style="transform: rotate(12deg); width: 62px; height: 62px;">
                    <img src="assets/canva/8bfa0742f6571d5384f3b5184c981ed2.png" class="w-full h-full object-contain drop-shadow-md" alt="SOLD OUT">
                </div>
            ` : '';

            // Action Pill Button
            let actionBtnHtml = '';
            if (isSoldOut) {
                actionBtnHtml = `<span class="bg-black/40 text-white/80 text-[8px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full cursor-not-allowed">HẾT MÓN</span>`;
            } else if (hasOptions) {
                actionBtnHtml = `<span class="bg-amber-400 text-paca-navy text-[8px] sm:text-[10px] font-extrabold px-2 sm:px-2.5 py-0.5 rounded-full shadow-sm hover:bg-amber-300">Tuỳ chọn ▾</span>`;
            } else {
                actionBtnHtml = `<span class="bg-amber-400 text-paca-navy text-[8px] sm:text-[10px] font-extrabold px-2 sm:px-2.5 py-0.5 rounded-full shadow-sm hover:bg-amber-300">+ Thêm</span>`;
            }

            node.innerHTML = `
                ${soldOutBadgeHtml}
                <div class="space-y-1 overflow-hidden">
                    ${itemImage ? `
                        <div class="w-full h-16 sm:h-20 md:h-24 rounded-md overflow-hidden mb-1 bg-black/10 flex items-center justify-center flex-shrink-0">
                            <img src="${itemImage}" class="w-full h-full object-cover rounded-md" alt="${boundProduct ? boundProduct.name : el.props.title}" loading="lazy">
                        </div>
                    ` : ''}

                    <div class="flex items-start justify-between gap-1">
                        <div class="font-serif font-black text-[11px] sm:text-xs md:text-sm tracking-wider uppercase leading-tight line-clamp-1">
                            ${boundProduct ? boundProduct.name : el.props.title}
                        </div>
                        <div class="font-bold text-[11px] sm:text-xs md:text-sm whitespace-nowrap ml-1 ${el.props.bg === '#ffffff' ? 'text-paca-crimson' : 'text-amber-300'}">
                            ${livePriceFormatted}
                        </div>
                    </div>

                    ${el.props.badge ? `
                        <div class="inline-block bg-paca-cream text-paca-navy text-[7px] sm:text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border border-paca-navy leading-none">
                            ${el.props.badge}
                        </div>
                    ` : ''}

                    ${el.props.ingredients ? `
                        <div class="text-[8px] sm:text-[10px] opacity-85 font-mono leading-tight ${itemImage ? 'line-clamp-1' : 'line-clamp-2'}">
                            ${el.props.ingredients}
                        </div>
                    ` : ''}

                    ${(el.props.desc_vi && !itemImage) ? `
                        <div class="text-[8px] sm:text-[10px] leading-snug line-clamp-2 ${el.props.bg === '#ffffff' ? 'text-gray-700' : 'text-amber-200'}">
                            ${el.props.desc_vi}
                        </div>
                    ` : ''}
                </div>

                <div class="mt-1 pt-1 border-t border-white/15 flex items-center justify-between flex-shrink-0">
                    <span class="text-[7px] sm:text-[9px] opacity-75 truncate max-w-[60%]">${boundProduct?.name_vi || 'PACA Special'}</span>
                    ${actionBtnHtml}
                </div>
            `;

            node.onclick = (e) => {
                e.stopPropagation();
                if (isSoldOut) {
                    if (window.showToast) {
                        window.showToast("Món này tạm thời hết hàng, bạn vui lòng chọn món khác nhé! 🍹", "warning");
                    } else {
                        alert("Món này tạm thời hết hàng, bạn vui lòng chọn món khác nhé!");
                    }
                    return;
                }
                const prodId = el.binding?.productId;
                if (!prodId) return;

                if (hasOptions) {
                    if (window.openDetailModal) window.openDetailModal(prodId);
                } else {
                    if (window.quickAddToCart) {
                        window.quickAddToCart(prodId);
                    } else if (window.openDetailModal) {
                        window.openDetailModal(prodId);
                    }
                }
            };

            return node;
        }

        return node;
    }

    // --- 2. STUDIO MODE: DRAG & DROP EDITOR ---
    renderStudioCanvas() {
        const page = this.getActivePage();
        if (!page) return;

        const baseWidth = this.design.baseWidth || 800;

        // Canvas container box
        const canvasBox = document.createElement('div');
        canvasBox.id = 'studioCanvasSurface';
        canvasBox.className = 'relative bg-white shadow-2xl mx-auto transition-transform origin-top';
        canvasBox.style.width = `${baseWidth}px`;
        canvasBox.style.height = `${page.height}px`;
        canvasBox.style.backgroundColor = page.bg || '#f6dcaf';
        canvasBox.style.transform = `scale(${this.zoom})`;

        if (page.bgImage) {
            const bgImg = document.createElement('div');
            bgImg.className = 'absolute inset-0 bg-cover bg-center pointer-events-none';
            bgImg.style.backgroundImage = `url('${page.bgImage}')`;
            canvasBox.appendChild(bgImg);
        }
        if (page.bgOverlay) {
            const bgOverlay = document.createElement('div');
            bgOverlay.className = 'absolute inset-0 pointer-events-none';
            bgOverlay.style.backgroundColor = page.bgOverlay;
            canvasBox.appendChild(bgOverlay);
        }

        // Render elements
        (page.elements || []).forEach(el => {
            const elNode = this.createStudioElementNode(el);
            canvasBox.appendChild(elNode);
        });

        // Click outside to deselect
        canvasBox.onmousedown = (e) => {
            if (e.target === canvasBox) {
                this.selectElement(null);
            }
        };

        this.container.appendChild(canvasBox);
    }

    createStudioElementNode(el) {
        const node = document.createElement('div');
        node.id = `studio_el_${el.id}`;
        node.className = 'absolute select-none cursor-move group';
        node.style.left = `${el.x}px`;
        node.style.top = `${el.y}px`;
        node.style.width = `${el.w}px`;
        node.style.height = `${el.h}px`;
        node.style.zIndex = el.zIndex || 1;
        if (el.rotate) node.style.transform = `rotate(${el.rotate}deg)`;

        const isSelected = this.selectedElementId === el.id;

        if (isSelected) {
            node.classList.add('ring-2', 'ring-blue-500', 'ring-offset-1');
        }

        // Content
        if (el.type === 'text') {
            node.style.display = 'flex';
            node.style.alignItems = 'center';
            node.style.justifyContent = el.props.align === 'center' ? 'center' : (el.props.align === 'right' ? 'flex-end' : 'flex-start');
            node.style.textAlign = el.props.align || 'left';
            node.style.whiteSpace = 'pre-line';
            node.style.lineHeight = el.props.lineSpacing || 1.3;
            node.style.fontFamily = el.props.font || 'inherit';
            node.style.fontSize = `${el.props.size || 16}px`;
            node.style.fontWeight = el.props.weight || 'normal';
            node.style.fontStyle = el.props.italic ? 'italic' : 'normal';
            node.style.color = el.props.color || '#000';
            node.innerText = el.props.text;
            if (el.props.targetPageId) {
                const navBadge = document.createElement('span');
                navBadge.className = 'absolute -top-2.5 -right-2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-blue-400 shadow z-20 pointer-events-none';
                navBadge.innerText = `🔗 ${el.props.targetPageId}`;
                node.appendChild(navBadge);
            }
        } else if (el.type === 'link_nav') {
            node.style.display = 'flex';
            node.style.alignItems = 'center';
            node.style.justifyContent = 'center';
            node.innerHTML = `
                <span style="
                    font-size: ${el.props.size || 22}px;
                    font-weight: ${el.props.weight || 'bold'};
                    color: ${el.props.color || '#fff'};
                    text-decoration: ${el.props.underline ? 'underline' : 'none'};
                    font-family: ${el.props.font || 'Playfair Display, serif'};
                    letter-spacing: 1px;
                ">
                    ${el.props.icon ? `<span class="mr-1">${el.props.icon}</span>` : ''}
                    ${el.props.text || 'Liên kết'}
                </span>
                <span class="absolute -top-2.5 -right-2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-blue-400 shadow z-20 pointer-events-none">
                    🔗 ${el.props.targetPageId || 'Chưa gắn'}
                </span>
            `;
        } else if (el.type === 'shape') {
            node.style.backgroundColor = el.props.fill || 'transparent';
            if (el.props.border) node.style.border = el.props.border;
            if (el.props.radius) node.style.borderRadius = `${el.props.radius}px`;
            if (el.props.shadow) node.style.boxShadow = el.props.shadow;
            if (el.props.targetPageId) {
                const navBadge = document.createElement('span');
                navBadge.className = 'absolute -top-2.5 -right-2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-blue-400 shadow z-20 pointer-events-none';
                navBadge.innerText = `🔗 ${el.props.targetPageId}`;
                node.appendChild(navBadge);
            }
        } else if (el.type === 'image') {
            const img = document.createElement('img');
            img.src = el.props.src;
            img.className = 'w-full h-full object-contain pointer-events-none';
            if (el.props.radius) img.style.borderRadius = `${el.props.radius}px`;
            node.appendChild(img);

            let boundProduct = null;
            if (el.binding && el.binding.productId && window.paca?.menu?.items) {
                boundProduct = window.paca.menu.items.find(i => i.id === el.binding.productId);
            }
            if (boundProduct || el.binding?.productId) {
                const badge = document.createElement('div');
                badge.className = 'absolute bottom-1 left-1 right-1 bg-black/90 text-white px-1.5 py-0.5 rounded text-[10px] flex items-center justify-between border border-amber-400/70 pointer-events-none z-10 shadow';
                badge.innerHTML = `
                    <span class="font-bold text-amber-300 truncate max-w-[65%]">🏷️ ${boundProduct ? boundProduct.name : el.binding.productId}</span>
                    <span class="font-mono text-emerald-400 font-bold">${boundProduct && window.paca?.formatMoney ? window.paca.formatMoney(boundProduct.price) : ''}</span>
                `;
                node.appendChild(badge);
            } else if (el.props.targetPageId) {
                const navBadge = document.createElement('span');
                navBadge.className = 'absolute -top-2.5 -right-2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-blue-400 shadow z-20 pointer-events-none';
                navBadge.innerText = `🔗 ${el.props.targetPageId}`;
                node.appendChild(navBadge);
            }
        } else if (el.type === 'product_card') {
            const boundProduct = el.binding?.productId ? (window.paca?.menu?.items || []).find(i => i.id === el.binding.productId) : null;
            const itemImage = el.props.image || boundProduct?.image;
            const bgVal = (el.props.bg || '#940b05').toLowerCase();
            const isWhiteBg = bgVal === '#ffffff' || bgVal === '#fff' || bgVal === 'white';
            node.style.backgroundColor = el.props.bg || '#940b05';
            node.style.color = el.props.color || (isWhiteBg ? '#10234d' : '#ffffff');
            if (el.props.border) node.style.border = el.props.border;
            if (el.props.shadow) node.style.boxShadow = el.props.shadow;
            node.style.borderRadius = '8px';
            node.className += ' p-2.5 sm:p-3 flex flex-col justify-between overflow-hidden';
            
            node.innerHTML = `
                <div class="flex flex-col h-full justify-between">
                    <div>
                        <div class="flex justify-between items-start font-serif font-black text-sm">
                            <span class="line-clamp-2">${el.props.title || (boundProduct ? boundProduct.name : 'Món')}</span>
                            <span class="${isWhiteBg ? 'text-paca-crimson font-black' : 'text-amber-300 font-bold'} whitespace-nowrap ml-1">${el.props.price || (boundProduct ? Math.round(boundProduct.price / 1000) : 180)}k</span>
                        </div>
                        <div class="text-[10px] ${isWhiteBg ? 'text-gray-600' : 'opacity-80'} mt-0.5 line-clamp-1">${el.props.ingredients || ''}</div>
                        <div class="text-xs ${isWhiteBg ? 'text-gray-800 font-medium' : 'text-amber-200'} mt-0.5 line-clamp-1">${el.props.desc_vi || ''}</div>
                    </div>

                    ${itemImage ? `
                        <div class="w-full flex-1 my-1.5 rounded-lg overflow-hidden bg-black/10 flex items-center justify-center min-h-[110px] max-h-[190px] border border-black/10">
                            <img src="${itemImage}" class="w-full h-full object-cover rounded-lg pointer-events-none select-none" alt="${el.props.title}">
                        </div>
                    ` : `
                        <div class="w-full flex-1 my-1.5 rounded-lg border-2 border-dashed ${isWhiteBg ? 'border-gray-300 bg-gray-50' : 'border-white/20 bg-white/5'} flex flex-col items-center justify-center min-h-[60px] text-center p-2 select-none pointer-events-none">
                            <span class="text-base opacity-60">📸</span>
                            <span class="text-[9px] ${isWhiteBg ? 'text-gray-400' : 'text-white/40'}">Chưa có ảnh món</span>
                        </div>
                    `}

                    <div class="flex items-center justify-between gap-1 mt-1 pt-1 border-t ${isWhiteBg ? 'border-gray-200' : 'border-white/10'}">
                        ${el.props.badge ? `<span class="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-sm">${el.props.badge}</span>` : '<span></span>'}
                        <span class="${isWhiteBg ? 'bg-paca-navy text-paca-cream' : 'bg-amber-400 text-paca-navy'} text-[10px] font-black px-2 py-0.5 rounded shadow-sm">+ GẮN: ${el.binding?.productId || 'Chưa gắn'}</span>
                    </div>
                </div>
            `;
        }

        // Selection & Drag handling (Mouse + Touch)
        node.onmousedown = (e) => {
            e.stopPropagation();
            this.selectElement(el.id);
            this.startElementDrag(e, el);
        };

        node.ontouchstart = (e) => {
            e.stopPropagation();
            this.selectElement(el.id);
            if (e.touches && e.touches.length === 1) {
                this.startElementDrag(e.touches[0], el, true);
            }
        };

        // Resize Handles if selected
        if (isSelected && !el.locked) {
            const handles = ['nw', 'ne', 'se', 'sw'];
            handles.forEach(pos => {
                const h = document.createElement('div');
                h.className = `absolute w-3 h-3 bg-blue-600 border border-white rounded-full z-50`;
                if (pos === 'nw') { h.style.top = '-6px'; h.style.left = '-6px'; h.style.cursor = 'nw-resize'; }
                if (pos === 'ne') { h.style.top = '-6px'; h.style.right = '-6px'; h.style.cursor = 'ne-resize'; }
                if (pos === 'se') { h.style.bottom = '-6px'; h.style.right = '-6px'; h.style.cursor = 'se-resize'; }
                if (pos === 'sw') { h.style.bottom = '-6px'; h.style.left = '-6px'; h.style.cursor = 'sw-resize'; }

                h.onmousedown = (e) => {
                    e.stopPropagation();
                    this.startElementResize(e, el, pos);
                };
                node.appendChild(h);
            });
        }

        return node;
    }

    startElementDrag(e, el, isTouch = false) {
        if (el.locked) return;
        this.recordState();

        const startX = e.clientX;
        const startY = e.clientY;
        const initialElX = el.x;
        const initialElY = el.y;

        const onMove = (moveEvent) => {
            const point = isTouch ? (moveEvent.touches && moveEvent.touches[0]) : moveEvent;
            if (!point) return;
            const dx = (point.clientX - startX) / this.zoom;
            const dy = (point.clientY - startY) / this.zoom;
            el.x = Math.round(initialElX + dx);
            el.y = Math.round(initialElY + dy);
            
            const node = document.getElementById(`studio_el_${el.id}`);
            if (node) {
                node.style.left = `${el.x}px`;
                node.style.top = `${el.y}px`;
            }
        };

        const onEnd = () => {
            if (isTouch) {
                document.removeEventListener('touchmove', onMove);
                document.removeEventListener('touchend', onEnd);
            } else {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onEnd);
            }
            this.saveDraft();
            if (this.onSelectionChange) this.onSelectionChange(el);
        };

        if (isTouch) {
            document.addEventListener('touchmove', onMove, { passive: false });
            document.addEventListener('touchend', onEnd);
        } else {
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onEnd);
        }
    }

    startElementResize(e, el, handle) {
        this.recordState();
        const startX = e.clientX;
        const startY = e.clientY;
        const startW = el.w;
        const startH = el.h;
        const startElX = el.x;
        const startElY = el.y;

        const onMouseMove = (moveEvent) => {
            const dx = (moveEvent.clientX - startX) / this.zoom;
            const dy = (moveEvent.clientY - startY) / this.zoom;

            if (handle === 'se') {
                el.w = Math.max(20, Math.round(startW + dx));
                el.h = Math.max(20, Math.round(startH + dy));
            } else if (handle === 'sw') {
                el.w = Math.max(20, Math.round(startW - dx));
                el.x = Math.round(startElX + dx);
                el.h = Math.max(20, Math.round(startH + dy));
            } else if (handle === 'ne') {
                el.w = Math.max(20, Math.round(startW + dx));
                el.h = Math.max(20, Math.round(startH - dy));
                el.y = Math.round(startElY + dy);
            } else if (handle === 'nw') {
                el.w = Math.max(20, Math.round(startW - dx));
                el.x = Math.round(startElX + dx);
                el.h = Math.max(20, Math.round(startH - dy));
                el.y = Math.round(startElY + dy);
            }

            const node = document.getElementById(`studio_el_${el.id}`);
            if (node) {
                node.style.left = `${el.x}px`;
                node.style.top = `${el.y}px`;
                node.style.width = `${el.w}px`;
                node.style.height = `${el.h}px`;
            }
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            this.render();
            this.saveDraft();
            if (this.onSelectionChange) this.onSelectionChange(el);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    selectElement(elementId) {
        this.selectedElementId = elementId;
        const el = this.getSelectedElement();
        this.render();
        if (this.onSelectionChange) this.onSelectionChange(el);
    }

    getActivePage() {
        if (!this.design || !this.design.pages) return null;
        return this.design.pages.find(p => p.id === this.activePageId) || this.design.pages[0];
    }

    getSelectedElement() {
        const page = this.getActivePage();
        if (!page) return null;
        return (page.elements || []).find(e => e.id === this.selectedElementId);
    }

    // --- ELEMENT MANIPULATION ---
    addElement(type, props = {}, binding = null) {
        this.recordState();
        const page = this.getActivePage();
        if (!page) return;

        const id = 'el_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);

        let elW = type === 'text' ? 300 : (type === 'product_card' ? 340 : 200);
        let elH = type === 'text' ? 50 : (type === 'product_card' ? 240 : 200);
        let posX = 50;
        let posY = 180;

        if (type === 'product_card' || type === 'image') {
            // Find existing cards or major elements on this page
            const existingCards = (page.elements || []).filter(e => 
                (e.type === 'product_card' || e.type === 'image' || (e.binding && e.binding.productId)) && (e.y >= 120)
            );

            if (existingCards.length > 0) {
                // Sort by bottom Y coordinate descending
                existingCards.sort((a, b) => ((b.y || 0) + (b.h || 200)) - ((a.y || 0) + (a.h || 200)));
                const bottomMost = existingCards[0];
                const lowestBottom = (bottomMost.y || 0) + (bottomMost.h || 240);

                if (type === 'product_card' && bottomMost.type === 'product_card') {
                    if (bottomMost.w) elW = bottomMost.w;
                    if (bottomMost.h) elH = bottomMost.h;
                }

                // Match existing left and right column X positions
                const leftCard = existingCards.find(c => (c.x || 0) < 250);
                const rightCard = existingCards.find(c => (c.x || 0) >= 250);
                const colLeftX = leftCard ? leftCard.x : 30;
                const colRightX = rightCard ? rightCard.x : 415;

                // Check 2-column layout (Left column: x < 250, Right column: x >= 250)
                const isLeftCol = (bottomMost.x || 0) < 250;
                const prevCard = existingCards[1];
                const hasCompanionOnRight = prevCard && Math.abs((prevCard.y || 0) - (bottomMost.y || 0)) < 60 && (prevCard.x || 0) >= 250;

                if (isLeftCol && !hasCompanionOnRight) {
                    // Place next to the last card on the right column at same row!
                    posX = colRightX;
                    posY = bottomMost.y || 180;
                } else {
                    // Start a new row at the very bottom!
                    posX = colLeftX;
                    posY = lowestBottom + 25;
                }
            } else {
                // If no cards yet, check bottom of all existing elements except quote
                let maxBottom = 160;
                (page.elements || []).forEach(e => {
                    const b = (e.y || 0) + (e.h || 0);
                    if (b > maxBottom && e.id !== 'cov_quote') maxBottom = b;
                });
                posY = maxBottom + 25;
                posX = 50;
            }

            // AUTO-STRETCH PAGE HEIGHT SO IT NEVER CLIPS OR RUNS OUT OF ROOM!
            const requiredHeight = posY + elH + 130;
            if (requiredHeight > (page.height || 1000)) {
                page.height = requiredHeight;
            }
        }

        const newEl = {
            id,
            type,
            x: posX,
            y: posY,
            w: elW,
            h: elH,
            rotate: 0,
            zIndex: (page.elements.length || 0) + 1,
            props,
            binding: binding || null
        };

        page.elements.push(newEl);
        this.selectElement(id);
        this.render();
        this.saveDraft();
        return newEl;
    }

    deleteSelectedElement() {
        if (!this.selectedElementId) return;
        this.recordState();
        const page = this.getActivePage();
        if (!page) return;

        page.elements = page.elements.filter(e => e.id !== this.selectedElementId);
        this.selectElement(null);
        this.saveDraft();
    }

    duplicateSelectedElement() {
        const el = this.getSelectedElement();
        if (!el) return;
        this.recordState();
        const page = this.getActivePage();
        if (!page) return;

        const clone = JSON.parse(JSON.stringify(el));
        clone.id = 'el_' + Date.now().toString(36);
        clone.x += 20;
        clone.y += 20;
        clone.zIndex = (page.elements.length || 0) + 1;
        page.elements.push(clone);
        this.selectElement(clone.id);
        this.saveDraft();
    }

    updateSelectedProps(newProps) {
        const el = this.getSelectedElement();
        if (!el) return;
        el.props = { ...el.props, ...newProps };
        const node = document.getElementById(`studio_el_${el.id}`);
        if (node && (el.type === 'text' || el.type === 'link_nav') && newProps.text !== undefined) {
            if (el.type === 'link_nav') {
                const span = node.querySelector('span');
                if (span) span.innerText = (el.props.icon ? el.props.icon + ' ' : '') + newProps.text;
            } else {
                node.innerText = newProps.text;
            }
        } else if (node && el.type === 'text' && newProps.size !== undefined) {
            node.style.fontSize = `${newProps.size}px`;
        } else if (node && el.type === 'text' && newProps.color !== undefined) {
            node.style.color = newProps.color;
        } else {
            this.render();
        }
        this.saveDraft();
    }

    bindSelectedToProduct(productId, actionType = 'open_modal') {
        const el = this.getSelectedElement();
        if (!el) return;
        this.recordState();
        el.binding = { productId, action: actionType };
        this.render();
        this.saveDraft();
        if (this.onSelectionChange) this.onSelectionChange(el);
    }

    setPageBg(color, image = null, overlay = null) {
        this.recordState();
        const page = this.getActivePage();
        if (!page) return;
        if (color) page.bg = color;
        if (image !== undefined) page.bgImage = image;
        if (overlay !== undefined) page.bgOverlay = overlay;
        this.render();
        this.saveDraft();
    }

    setZoom(z) {
        this.zoom = Math.min(2, Math.max(0.3, z));
        this.render();
    }
}

window.PacaCanvasEngine = PacaCanvasEngine;
