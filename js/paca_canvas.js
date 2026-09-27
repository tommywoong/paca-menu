/**
 * PACA CANVA ENGINE
 * Visual Interactive Long-Poster & Drag-and-Drop Canvas Engine
 * Supports Multi-Page, Layers, Product Binding, Dynamic Price Tags, and Responsive Scaling
 */

const PACA_CANVAS_KEYS = {
    PUBLISHED_DESIGN: 'paca_published_canvas_v2',
    DRAFT_DESIGN: 'paca_draft_canvas_v2',
    SETTINGS: 'paca_canvas_settings_v2'
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

    // --- INITIALIZATION ---
    async init() {
        await this.loadDesign();
        if (this.design && this.design.pages && this.design.pages.length > 0) {
            this.activePageId = this.design.pages[0].id;
        }
        if (this.container) {
            this.render();
        }
    }

    async loadDesign() {
        // Priority 1: Check published design (or draft if edit mode)
        const storageKey = this.mode === 'edit' ? PACA_CANVAS_KEYS.DRAFT_DESIGN : PACA_CANVAS_KEYS.PUBLISHED_DESIGN;
        const local = localStorage.getItem(storageKey);
        if (local) {
            try {
                const parsed = JSON.parse(local);
                if (parsed && Array.isArray(parsed.pages) && parsed.pages.length > 0) {
                    this.design = parsed;
                    return this.design;
                }
            } catch (e) {
                console.warn("Invalid local canvas design", e);
            }
        }

        // Priority 2: Fetch default 7-page template
        try {
            const res = await fetch('data/default_canvas_template.json?v=' + Date.now());
            this.design = await res.json();
            // Save as draft initially
            localStorage.setItem(PACA_CANVAS_KEYS.DRAFT_DESIGN, JSON.stringify(this.design));
            localStorage.setItem(PACA_CANVAS_KEYS.PUBLISHED_DESIGN, JSON.stringify(this.design));
        } catch (e) {
            console.error("Failed to load default template", e);
            this.design = {
                version: "1.0",
                title: "PACA Canvas",
                baseWidth: 800,
                pages: [
                    { id: "page_1", title: "Trang 1", width: 800, height: 1000, bg: "#f6dcaf", elements: [] }
                ]
            };
        }
        return this.design;
    }

    // --- SAVE & PUBLISH ---
    saveDraft() {
        if (!this.design) return;
        localStorage.setItem(PACA_CANVAS_KEYS.DRAFT_DESIGN, JSON.stringify(this.design));
        if (this.onDesignChange) this.onDesignChange(this.design);
    }

    publish() {
        if (!this.design) return;
        this.saveDraft();
        localStorage.setItem(PACA_CANVAS_KEYS.PUBLISHED_DESIGN, JSON.stringify(this.design));
        // Also broadcast event to update client views
        if (window.paca && window.paca.broadcastChannel) {
            window.paca.broadcastChannel.postMessage({ type: 'CANVAS_PUBLISHED', timestamp: Date.now() });
        }
        return true;
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
        const dynamicCats = allCategories.filter(c => c.is_active !== false && !bakedPageIds.has(c.pageId) && !bakedPageIds.has('page_' + c.id));

        pages.forEach((page, pageIdx) => {
            // Check if page belongs to an inactive category
            const catForPage = allCategories.find(c => c.pageId === page.id || ('page_' + c.id) === page.id);
            if (catForPage && catForPage.is_active === false) {
                return; // Skip inactive category page
            }

            // Before rendering the final page (page_wine_shots), render any dynamic custom categories!
            if (page.id === 'page_wine_shots' && dynamicCats.length > 0) {
                dynamicCats.forEach(dCat => {
                    this.renderDynamicCategorySection(dCat, wrapper, baseWidth);
                });
            }

            if (page.id === 'page_bites') {
                this.renderCustomerBitesPage(page, wrapper, baseWidth);
                return;
            }

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

            // On Cover Page: dynamically render active categories marked show_on_cover !== false
            if (page.id === 'page_cover') {
                // Render non-nav elements (title, subtitle, decorative stars)
                (page.elements || []).forEach(el => {
                    if (el.type !== 'link_nav') {
                        const elNode = this.createCustomerElementNode(el, baseWidth, page.height);
                        if (elNode) innerBox.appendChild(elNode);
                    }
                });

                // Render dynamic cover category links
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
        const dishes = (window.paca?.menu?.items || []).filter(i => i.category === cat.id);
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

        bitesItems.forEach(itemDef => {
            const boundProduct = window.paca?.menu?.items?.find(i => i.id === itemDef.id);
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
        if (el.binding && el.binding.productId && window.paca?.menu?.items) {
            boundProduct = window.paca.menu.items.find(i => i.id === el.binding.productId);
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
            node.onclick = () => {
                const targetEl = document.getElementById(el.props.targetPageId);
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
            return node;
        }

        if (el.type === 'shape') {
            node.style.backgroundColor = el.props.fill || 'transparent';
            if (el.props.border) node.style.border = el.props.border;
            if (el.props.radius) node.style.borderRadius = `${el.props.radius}px`;
            if (el.props.shadow) node.style.boxShadow = el.props.shadow;
            return node;
        }

        if (el.type === 'image') {
            const img = document.createElement('img');
            img.src = el.props.src;
            img.className = 'w-full h-full object-contain pointer-events-none';
            if (el.props.fit) img.style.objectFit = el.props.fit;
            if (el.props.radius) img.style.borderRadius = `${el.props.radius}px`;
            if (el.props.opacity) img.style.opacity = el.props.opacity;
            node.appendChild(img);
            return node;
        }

        if (el.type === 'product_card') {
            // Interactive product card on poster
            const isSoldOut = boundProduct && boundProduct.is_available === false;
            const hasOptions = boundProduct && ((boundProduct.variants && boundProduct.variants.length > 0) || (boundProduct.options && boundProduct.options.length > 0) || (boundProduct.toppings && boundProduct.toppings.length > 0));
            const itemImage = el.props.image;

            node.className += ' cursor-pointer active:scale-[0.98] transition-all p-2 sm:p-3 flex flex-col justify-between overflow-visible';
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
                actionBtnHtml = `<span class="bg-black/40 text-white/80 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full cursor-not-allowed">HẾT MÓN</span>`;
            } else if (hasOptions) {
                actionBtnHtml = `<span class="bg-amber-400 text-paca-navy text-[9px] sm:text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm hover:bg-amber-300">Tuỳ chọn ▾</span>`;
            } else {
                actionBtnHtml = `<span class="bg-amber-400 text-paca-navy text-[9px] sm:text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm hover:bg-amber-300">+ Thêm</span>`;
            }

            node.innerHTML = `
                ${soldOutBadgeHtml}
                <div class="space-y-1">
                    ${itemImage ? `
                        <div class="w-full h-20 sm:h-24 rounded-md overflow-hidden mb-1.5 bg-black/10 flex items-center justify-center flex-shrink-0">
                            <img src="${itemImage}" class="w-full h-full object-cover rounded-md" alt="${boundProduct ? boundProduct.name : el.props.title}" loading="lazy">
                        </div>
                    ` : ''}

                    <div class="flex items-start justify-between gap-1">
                        <div class="font-serif font-black text-[11px] sm:text-xs md:text-sm tracking-wider uppercase leading-tight line-clamp-2">
                            ${boundProduct ? boundProduct.name : el.props.title}
                        </div>
                        <div class="font-bold text-[11px] sm:text-xs md:text-sm whitespace-nowrap ml-1 ${el.props.bg === '#ffffff' ? 'text-paca-crimson' : 'text-amber-300'}">
                            ${livePriceFormatted}
                        </div>
                    </div>

                    ${el.props.badge ? `
                        <div class="inline-block bg-paca-cream text-paca-navy text-[8px] sm:text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border border-paca-navy">
                            ${el.props.badge}
                        </div>
                    ` : ''}

                    ${el.props.ingredients ? `
                        <div class="text-[8px] sm:text-[10px] opacity-85 font-mono leading-tight line-clamp-2">
                            ${el.props.ingredients}
                        </div>
                    ` : ''}

                    ${el.props.desc_vi ? `
                        <div class="text-[8px] sm:text-[10px] leading-snug line-clamp-2 ${el.props.bg === '#ffffff' ? 'text-gray-700' : 'text-amber-200'}">
                            ${el.props.desc_vi}
                        </div>
                    ` : ''}
                </div>

                <div class="mt-1.5 pt-1 border-t border-white/15 flex items-center justify-between">
                    <span class="text-[8px] sm:text-[9px] opacity-75">${boundProduct?.name_vi || 'PACA Special'}</span>
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
            `;
        } else if (el.type === 'shape') {
            node.style.backgroundColor = el.props.fill || 'transparent';
            if (el.props.border) node.style.border = el.props.border;
            if (el.props.radius) node.style.borderRadius = `${el.props.radius}px`;
            if (el.props.shadow) node.style.boxShadow = el.props.shadow;
        } else if (el.type === 'image') {
            const img = document.createElement('img');
            img.src = el.props.src;
            img.className = 'w-full h-full object-contain pointer-events-none';
            if (el.props.radius) img.style.borderRadius = `${el.props.radius}px`;
            node.appendChild(img);
        } else if (el.type === 'product_card') {
            node.style.backgroundColor = el.props.bg || '#940b05';
            node.style.color = el.props.color || '#fff';
            if (el.props.border) node.style.border = el.props.border;
            if (el.props.shadow) node.style.boxShadow = el.props.shadow;
            node.style.borderRadius = '4px';
            node.className += ' p-3 flex flex-col justify-between';
            node.innerHTML = `
                <div>
                    <div class="flex justify-between items-start font-serif font-black text-sm">
                        <span>${el.props.title || 'Món'}</span>
                        <span class="text-amber-300 font-bold">${el.props.price || 180}k</span>
                    </div>
                    <div class="text-[10px] opacity-80 mt-1">${el.props.ingredients || ''}</div>
                    <div class="text-xs text-amber-200 mt-1">${el.props.desc_vi || ''}</div>
                </div>
                <div class="mt-2 text-right">
                    <span class="bg-amber-400 text-paca-navy text-[10px] font-black px-2 py-0.5 rounded">+ GẮN: ${el.binding?.productId || 'Chưa gắn'}</span>
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
        const newEl = {
            id,
            type,
            x: 200,
            y: 200,
            w: type === 'text' ? 300 : (type === 'product_card' ? 350 : 200),
            h: type === 'text' ? 50 : (type === 'product_card' ? 250 : 200),
            rotate: 0,
            zIndex: (page.elements.length || 0) + 1,
            props,
            binding: binding || null
        };

        page.elements.push(newEl);
        this.selectElement(id);
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
