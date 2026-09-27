/**
 * PACA CORE SYSTEM MODULE (V2 - UPGRADED)
 * Central state, storage, order management, VietQR, Web/ESC-POS printing, Bill Templates & Audit
 */

const PACA_STORAGE_KEYS = {
    MENU: 'paca_menu_data_v1',
    TABLES: 'paca_tables_data_v1',
    CONFIG: 'paca_config_data_v1',
    ORDERS: 'paca_orders_data_v1',
    BILL_TEMPLATES: 'paca_bill_templates_v1'
};

const VIETQR_BANKS = [
    { code: "MB", name: "MBBank (Ngân hàng Quân Đội)", bin: "970422" },
    { code: "VCB", name: "Vietcombank (Ngoại thương VN)", bin: "970436" },
    { code: "TCB", name: "Techcombank (Kỹ thương)", bin: "970407" },
    { code: "ACB", name: "ACB (Á Châu)", bin: "970416" },
    { code: "VPB", name: "VPBank (Việt Nam Thịnh Vượng)", bin: "970432" },
    { code: "ICB", name: "VietinBank (Công thương)", bin: "970415" },
    { code: "BIDV", name: "BIDV (Đầu tư & Phát triển)", bin: "970418" },
    { code: "TPB", name: "TPBank (Tiên Phong)", bin: "970423" },
    { code: "STB", name: "Sacombank (Sài Gòn Thương Tín)", bin: "970403" },
    { code: "HDB", name: "HDBank (Phát triển TP.HCM)", bin: "970437" },
    { code: "OCB", name: "OCB (Phương Đông)", bin: "970448" },
    { code: "VIB", name: "VIB (Quốc tế)", bin: "970441" },
    { code: "MSB", name: "MSB (Hàng Hải)", bin: "970426" },
    { code: "SHB", name: "SHB (Sài Gòn - Hà Nội)", bin: "970443" }
];

const DEFAULT_BILL_TEMPLATES = {
    cashier: {
        paper_size: "k80", // "k80" (72mm) or "k58" (48mm)
        font_size: "normal", // "small" (11px), "normal" (12px), "large" (14px)
        title: "PHIẾU THANH TOÁN",
        title_align: "center", // "center", "left"
        divider_style: "dashed", // "dashed", "solid", "double"
        
        // Header
        show_logo: true,
        store_name: "PACA BAR",
        show_address: true,
        store_address: "5A Pasteur, Phường 4, TP. Đà Lạt",
        show_phone: true,
        store_phone: "09xx xxx xxx",
        show_outlet: true,
        outlet_name: "Quầy Thu Ngân",

        // Order Meta
        show_order_id: true,
        order_id_label: "Mã đơn",
        show_table: true,
        table_label: "Bàn/Vị trí",
        show_time: true,
        time_label: "Thời gian",
        show_staff: true,
        staff_label: "Thu ngân",
        show_pax: true,
        pax_label: "Số khách",

        // Item Table
        show_items: true,
        show_unit_price: true,
        show_subtotal: true,
        show_item_notes: true,

        // Totals
        show_calc_subtotal: true,
        show_discount: true,
        show_surcharge: true,
        show_total: true,
        show_payment_status: true,
        show_note: true,

        // VietQR
        show_qr: true,
        show_bank_info: true,

        // Footer
        show_thanks: true,
        thanks_text: "Cảm ơn quý khách & Hẹn gặp lại!",
        thanks_quote: "Good drinks, good vibes, good stories"
    },
    kitchen: {
        paper_size: "k80",
        font_size: "normal",
        title: "PHIẾU BẾP (ĐỒ ĂN)",
        title_align: "center",
        divider_style: "solid",
        show_logo: false,
        store_name: "",
        show_address: false,
        store_address: "",
        show_phone: false,
        store_phone: "",
        show_outlet: true,
        outlet_name: "Khu Vực Bếp",
        show_order_id: true,
        order_id_label: "Mã đơn",
        show_table: true,
        table_label: "Bàn/Vị trí",
        show_time: true,
        time_label: "Giờ nhận",
        show_staff: true,
        staff_label: "Nhân viên",
        show_pax: true,
        pax_label: "Số khách",
        show_items: true,
        show_unit_price: false, // Bếp TUYỆT ĐỐI không xem giá
        show_subtotal: false,
        show_item_notes: true,
        show_calc_subtotal: false,
        show_discount: false,
        show_surcharge: false,
        show_total: false,      // Bếp TUYỆT ĐỐI không in tiền
        show_payment_status: false,
        show_note: true,
        show_qr: false,
        show_bank_info: false,
        show_thanks: false,
        thanks_text: "",
        thanks_quote: ""
    },
    bar: {
        paper_size: "k80",
        font_size: "normal",
        title: "PHIẾU BAR (PHA CHẾ)",
        title_align: "center",
        divider_style: "solid",
        show_logo: false,
        store_name: "",
        show_address: false,
        store_address: "",
        show_phone: false,
        store_phone: "",
        show_outlet: true,
        outlet_name: "Quầy Pha Chế",
        show_order_id: true,
        order_id_label: "Mã đơn",
        show_table: true,
        table_label: "Bàn/Vị trí",
        show_time: true,
        time_label: "Giờ nhận",
        show_staff: true,
        staff_label: "Bartender/Phục vụ",
        show_pax: true,
        pax_label: "Số khách",
        show_items: true,
        show_unit_price: false, // Bar TUYỆT ĐỐI không xem giá
        show_subtotal: false,
        show_item_notes: true,
        show_calc_subtotal: false,
        show_discount: false,
        show_surcharge: false,
        show_total: false,      // Bar TUYỆT ĐỐI không in tiền
        show_payment_status: false,
        show_note: true,
        show_qr: false,
        show_bank_info: false,
        show_thanks: false,
        thanks_text: "",
        thanks_quote: ""
    }
};

class PacaService {
    constructor() {
        this.menu = null;
        this.tables = [];
        this.config = null;
        this.orders = [];
        this.billTemplates = null;
        this.broadcastChannel = null;
        this.cloudSyncTopic = 'paca_orders_live_da_lat_2025';
        this.cloudEventSource = null;
        this.cloudSyncTimer = null;
        this.initBroadcast();
    }

    initBroadcast() {
        if ('BroadcastChannel' in window) {
            this.broadcastChannel = new BroadcastChannel('paca_order_events');
        }
    }

    // --- INITIALIZATION ---
    async init() {
        await this.loadConfig();
        await this.loadMenu();
        await this.loadTables();
        this.loadBillTemplates();
        this.loadOrders();
    }

    // --- CONFIG ---
    async loadConfig() {
        const local = localStorage.getItem(PACA_STORAGE_KEYS.CONFIG);
        if (local) {
            try {
                this.config = JSON.parse(local);
                return this.config;
            } catch (e) {
                console.warn("Invalid local config, fallback to default", e);
            }
        }
        try {
            const res = await fetch('data/config.json');
            this.config = await res.json();
            this.saveConfig(this.config);
        } catch (e) {
            this.config = {
                shop_name: "PACA - TINY COZY BAR",
                shop_address: "5A (10-1) Pasteur, TP. Đà Lạt",
                shop_phone: "09xx xxx xxx",
                shop_open_hours: "16:00 - 23:00 Hàng Ngày",
                currency: "đ",
                admin_pin: "1234",
                bank_config: { bank_id: "MB", account_no: "", account_name: "" },
                printer_config: { paper_size: "k80", print_mode: "web_dialog" },
                telegram_config: { bot_token: "", chat_id: "", is_enabled: false }
            };
        }
        return this.config;
    }

    saveConfig(cfg) {
        this.config = { ...this.config, ...cfg };
        localStorage.setItem(PACA_STORAGE_KEYS.CONFIG, JSON.stringify(this.config));
        return this.config;
    }

    // --- BILL TEMPLATES ---
    loadBillTemplates() {
        const local = localStorage.getItem(PACA_STORAGE_KEYS.BILL_TEMPLATES);
        if (local) {
            try {
                this.billTemplates = JSON.parse(local);
                return this.billTemplates;
            } catch (e) {}
        }
        this.billTemplates = JSON.parse(JSON.stringify(DEFAULT_BILL_TEMPLATES));
        this.saveBillTemplates(this.billTemplates);
        return this.billTemplates;
    }

    saveBillTemplates(templates) {
        this.billTemplates = templates;
        localStorage.setItem(PACA_STORAGE_KEYS.BILL_TEMPLATES, JSON.stringify(this.billTemplates));
    }

    // --- MENU ---
    async loadMenu() {
        const local = localStorage.getItem(PACA_STORAGE_KEYS.MENU);
        if (local) {
            try {
                this.menu = JSON.parse(local);
                if (this.menu && this.menu.categories && this.menu.categories.length > 0) {
                    this.normalizeCategories();
                    return this.menu;
                }
            } catch (e) {
                console.warn("Invalid local menu", e);
            }
        }
        try {
            const res = await fetch('data/menu.json');
            this.menu = await res.json();
            this.normalizeCategories();
            this.saveMenu(this.menu);
        } catch (e) {
            console.error("Failed to load menu", e);
            this.menu = { categories: [], items: [] };
        }
        return this.menu;
    }

    normalizeCategories() {
        if (!this.menu || !this.menu.categories) return;
        this.menu.categories.forEach((c, idx) => {
            if (c.order === undefined) c.order = idx + 1;
            if (c.is_active === undefined) c.is_active = true;
            if (c.show_on_cover === undefined) c.show_on_cover = true;
            if (c.show_on_nav === undefined) c.show_on_nav = true;
            if (!c.default_station) c.default_station = c.station || 'bar';
            if (!c.display_layout) c.display_layout = 'grid';
            if (!c.pageId) {
                if (c.id === 'week') c.pageId = 'page_week';
                else if (c.id === 'bites') c.pageId = 'page_bites';
                else if (c.id === 'cocktail') c.pageId = 'page_cocktail';
                else if (c.id === 'beer') c.pageId = 'page_beer';
                else if (c.id === 'wine_shot') c.pageId = 'page_wine_shots';
                else c.pageId = `sec_cat_${c.id}`;
            }
        });
        this.menu.categories.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    saveMenu(menuData) {
        this.menu = menuData;
        localStorage.setItem(PACA_STORAGE_KEYS.MENU, JSON.stringify(this.menu));
    }

    toggleItemAvailability(itemId, isAvailable) {
        if (!this.menu) return;
        const item = this.menu.items.find(i => i.id === itemId);
        if (item) {
            item.is_available = isAvailable;
            this.saveMenu(this.menu);
            if (this.broadcastChannel) {
                this.broadcastChannel.postMessage({ type: 'ITEM_AVAILABILITY_CHANGED', itemId, isAvailable });
            }
        }
    }

    saveMenuItem(itemData) {
        if (!this.menu) return;
        const idx = this.menu.items.findIndex(i => i.id === itemData.id);
        if (idx >= 0) {
            this.menu.items[idx] = { ...this.menu.items[idx], ...itemData };
        } else {
            if (!itemData.id) itemData.id = 'paca_' + Date.now().toString(36);
            this.menu.items.push(itemData);
        }
        this.saveMenu(this.menu);
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({ type: 'MENU_ITEM_SAVED', item: itemData });
        }
        return itemData;
    }

    deleteMenuItem(itemId) {
        if (!this.menu || !this.menu.items) return;
        const idx = this.menu.items.findIndex(i => i.id === itemId);
        if (idx >= 0) {
            const removed = this.menu.items.splice(idx, 1)[0];
            this.saveMenu(this.menu);
            if (this.broadcastChannel) {
                this.broadcastChannel.postMessage({ type: 'MENU_ITEM_DELETED', itemId });
            }
            return removed;
        }
    }

    // --- CATEGORIES MANAGEMENT (NEW DYNAMIC FLOW) ---
    getCategories(includeInactive = true) {
        this.normalizeCategories();
        if (!this.menu || !this.menu.categories) return [];
        let cats = [...this.menu.categories];
        if (!includeInactive) {
            cats = cats.filter(c => c.is_active !== false);
        }
        return cats;
    }

    getCategoryById(catId) {
        if (!this.menu || !this.menu.categories) return null;
        return this.menu.categories.find(c => c.id === catId) || null;
    }

    saveCategory(catData) {
        if (!this.menu) this.menu = { categories: [], items: [] };
        if (!this.menu.categories) this.menu.categories = [];

        // Generate or clean stable ID
        let id = catData.id ? catData.id.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_') : '';
        if (!id) {
            // Slugify Vietnamese name if available
            const baseStr = catData.name_vi || catData.name || 'cat';
            const cleanSlug = baseStr.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '_')
                .replace(/^_+|_+$/g, '');
            id = (cleanSlug ? cleanSlug : 'cat') + '_' + Date.now().toString(36).substr(-4);
        }

        const existingIdx = this.menu.categories.findIndex(c => c.id === id);
        
        let targetPageId = catData.pageId;
        if (!targetPageId) {
            if (id === 'week') targetPageId = 'page_week';
            else if (id === 'bites') targetPageId = 'page_bites';
            else if (id === 'cocktail') targetPageId = 'page_cocktail';
            else if (id === 'beer') targetPageId = 'page_beer';
            else if (id === 'wine_shot') targetPageId = 'page_wine_shots';
            else targetPageId = `sec_cat_${id}`;
        }

        const categoryRecord = {
            id: id,
            name: catData.name ? catData.name.trim() : (catData.name_vi || 'New Category'),
            name_vi: catData.name_vi ? catData.name_vi.trim() : (catData.name || 'Danh mục mới'),
            icon: catData.icon ? catData.icon.trim() : '✨',
            image: catData.image || '',
            description: catData.description ? catData.description.trim() : '',
            order: parseInt(catData.order) || (this.menu.categories.length + 1),
            is_active: catData.is_active !== false,
            show_on_cover: catData.show_on_cover !== false,
            show_on_nav: catData.show_on_nav !== false,
            display_layout: catData.display_layout || 'grid',
            default_station: catData.default_station || 'bar',
            parent_id: catData.parent_id || null,
            pageId: targetPageId
        };

        if (existingIdx >= 0) {
            this.menu.categories[existingIdx] = { ...this.menu.categories[existingIdx], ...categoryRecord };
        } else {
            this.menu.categories.push(categoryRecord);
        }

        this.normalizeCategories();
        this.saveMenu(this.menu);

        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({ type: 'CATEGORIES_CHANGED', category: categoryRecord });
        }
        return categoryRecord;
    }

    deleteCategory(catId, transferToCatId = null) {
        if (!this.menu || !this.menu.categories) return { success: false, message: 'Dữ liệu menu chưa tải' };

        const catIdx = this.menu.categories.findIndex(c => c.id === catId);
        if (catIdx < 0) return { success: false, message: 'Không tìm thấy danh mục' };

        // Check dishes belonging to this category
        const attachedItems = (this.menu.items || []).filter(i => i.category === catId);
        if (attachedItems.length > 0 && !transferToCatId) {
            return {
                success: false,
                requiresTransfer: true,
                attachedCount: attachedItems.length,
                message: `Danh mục này đang có ${attachedItems.length} món ăn/đồ uống. Bạn cần chuyển món sang danh mục khác trước khi xóa!`
            };
        }

        // Transfer attached items
        if (attachedItems.length > 0 && transferToCatId) {
            attachedItems.forEach(it => {
                it.category = transferToCatId;
            });
        }

        const removed = this.menu.categories.splice(catIdx, 1)[0];
        this.normalizeCategories();
        this.saveMenu(this.menu);

        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({ type: 'CATEGORIES_CHANGED', deletedCatId: catId, transferToCatId });
        }
        return { success: true, removedCategory: removed, transferredCount: attachedItems.length };
    }

    reorderCategories(orderedIds) {
        if (!this.menu || !this.menu.categories) return;
        orderedIds.forEach((id, idx) => {
            const cat = this.menu.categories.find(c => c.id === id);
            if (cat) cat.order = idx + 1;
        });
        this.normalizeCategories();
        this.saveMenu(this.menu);
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({ type: 'CATEGORIES_CHANGED' });
        }
    }

    // --- TABLES ---
    async loadTables() {
        const local = localStorage.getItem(PACA_STORAGE_KEYS.TABLES);
        if (local) {
            try {
                this.tables = JSON.parse(local);
                return this.tables;
            } catch (e) {
                console.warn("Invalid local tables", e);
            }
        }
        try {
            const res = await fetch('data/tables.json');
            this.tables = await res.json();
            this.saveTables(this.tables);
        } catch (e) {
            this.tables = [
                { id: "B01", name: "Bàn 01", zone: "Trong Nhà", active: true },
                { id: "BAR01", name: "Quầy Bar 01", zone: "Quầy Bar", active: true }
            ];
        }
        return this.tables;
    }

    saveTables(tables) {
        this.tables = tables;
        localStorage.setItem(PACA_STORAGE_KEYS.TABLES, JSON.stringify(this.tables));
    }

    addTable(tableData) {
        const id = tableData.id ? tableData.id.toUpperCase().trim() : 'B' + (this.tables.length + 1).toString().padStart(2, '0');
        const existing = this.tables.find(t => t.id === id);
        if (existing) {
            Object.assign(existing, tableData);
        } else {
            this.tables.push({ id, ...tableData, active: true });
        }
        this.saveTables(this.tables);
        return id;
    }

    deleteTable(tableId) {
        this.tables = this.tables.filter(t => t.id !== tableId);
        this.saveTables(this.tables);
    }

    // --- ORDERS ---
    loadOrders() {
        const local = localStorage.getItem(PACA_STORAGE_KEYS.ORDERS);
        if (local) {
            try {
                this.orders = JSON.parse(local);
            } catch (e) {
                this.orders = [];
            }
        } else {
            this.orders = [];
        }
        return this.orders;
    }

    saveOrders() {
        localStorage.setItem(PACA_STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
    }

    createOrder({
        tableId,
        tableName,
        items,
        note = "",
        customerPhone = "",
        source = "qr_customer", // "qr_customer" or "manual_admin"
        discount = { amount: 0, reason: "", authorizedBy: "" },
        surcharge = { amount: 0, reason: "" },
        priceOverrides = []
    }) {
        const now = new Date();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const orderId = `PACA-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}-${randomNum}`;

        let rawSubtotal = 0;
        const processedItems = items.map(item => {
            const subtotal = item.price * item.quantity;
            rawSubtotal += subtotal;
            return {
                id: item.id,
                productId: item.productId || item.id,
                name: item.name,
                name_vi: item.name_vi || item.name,
                price: item.price,
                originalPrice: item.originalPrice || item.price,
                quantity: item.quantity,
                subtotal: subtotal,
                station: item.station || 'bar',
                variant: item.variant || null,
                options: item.options || [],
                itemNote: item.itemNote || ''
            };
        });

        // Compute total amount with discount and surcharge
        const discountAmount = Math.min(rawSubtotal, Math.max(0, discount.amount || 0));
        const surchargeAmount = Math.max(0, surcharge.amount || 0);
        const finalTotal = Math.max(0, rawSubtotal - discountAmount + surchargeAmount);

        const newOrder = {
            id: orderId,
            tableId: tableId || "MANG_VE",
            tableName: tableName || (tableId ? `Bàn ${tableId}` : "Đơn Mang Về"),
            customerPhone,
            source,
            items: processedItems,
            rawSubtotal,
            discount: {
                amount: discountAmount,
                reason: discount.reason || "",
                authorizedBy: discount.authorizedBy || ""
            },
            surcharge: {
                amount: surchargeAmount,
                reason: surcharge.reason || ""
            },
            totalAmount: finalTotal,
            note: note || "",
            // Payment states: "unpaid" -> "awaiting_check" -> "paid"
            paymentStatus: "unpaid",
            paymentMethod: "vietqr",
            paidAt: null,
            confirmedBy: null,
            // Order operational status: "pending" -> "preparing" -> "served" -> "completed" -> "cancelled"
            status: "pending",
            // Printer status per destination
            printerStatus: {
                cashier: { status: "pending", time: null, error: null },
                kitchen: { status: "pending", time: null, error: null },
                bar: { status: "pending", time: null, error: null }
            },
            printLogs: [],
            priceOverrides: priceOverrides || [],
            reprintCount: 0,
            createdAt: now.toISOString(),
            createdAtFormatted: this.formatDateTime(now)
        };

        this.orders.unshift(newOrder);
        this.saveOrders();

        // Broadcast to all admin windows/tabs locally
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({ type: 'NEW_ORDER', order: newOrder });
        }

        // Broadcast to Cloud Sync (so all admin phones/screens receive immediately across internet)
        this.pushOrderToCloud(newOrder, 'CREATE_ORDER');

        // Trigger Telegram notification
        this.sendTelegramOrder(newOrder);

        return newOrder;
    }

    // --- REALTIME CLOUD ORDER SYNC ---
    async pushOrderToCloud(order, action = 'CREATE_ORDER') {
        try {
            const payload = JSON.stringify({ action, order, timestamp: Date.now() });
            await fetch(`https://ntfy.sh/${this.cloudSyncTopic}`, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
                body: payload
            });
        } catch (e) {
            console.warn("Failed to push order to cloud sync", e);
        }
    }

    async syncCloudOrders(onUpdateCallback) {
        try {
            const res = await fetch(`https://ntfy.sh/${this.cloudSyncTopic}/json?poll=1&since=24h`, { cache: 'no-store' });
            const text = await res.text();
            if (!text) return;
            const lines = text.trim().split('\n');
            let hasChanges = false;
            for (const line of lines) {
                try {
                    const item = JSON.parse(line);
                    if (item.event === 'message' && item.message) {
                        const payload = JSON.parse(item.message);
                        if (payload.action === 'CREATE_ORDER' && payload.order) {
                            const existingIdx = this.orders.findIndex(o => o.id === payload.order.id);
                            if (existingIdx === -1) {
                                this.orders.unshift(payload.order);
                                hasChanges = true;
                            }
                        } else if (payload.action === 'UPDATE_ORDER' && payload.order) {
                            const existingIdx = this.orders.findIndex(o => o.id === payload.order.id);
                            if (existingIdx !== -1) {
                                this.orders[existingIdx] = { ...this.orders[existingIdx], ...payload.order };
                                hasChanges = true;
                            } else {
                                this.orders.unshift(payload.order);
                                hasChanges = true;
                            }
                        }
                    }
                } catch (err) {}
            }
            if (hasChanges) {
                this.saveOrders();
                if (onUpdateCallback) onUpdateCallback();
            }
        } catch (e) {
            console.warn("Cloud sync poll error:", e);
        }
    }

    startCloudOrderSync(onNewOrderCallback, onUpdateCallback) {
        // 1. Initial catch-up for past 24h
        this.syncCloudOrders(() => {
            if (onUpdateCallback) onUpdateCallback();
        });

        // 2. Realtime SSE connection (instant live push)
        if (this.cloudEventSource) {
            try { this.cloudEventSource.close(); } catch(e){}
        }
        try {
            this.cloudEventSource = new EventSource(`https://ntfy.sh/${this.cloudSyncTopic}/sse`);
            this.cloudEventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.event === 'message' && data.message) {
                        const payload = JSON.parse(data.message);
                        if (payload.action === 'CREATE_ORDER' && payload.order) {
                            const existingIdx = this.orders.findIndex(o => o.id === payload.order.id);
                            if (existingIdx === -1) {
                                this.orders.unshift(payload.order);
                                this.saveOrders();
                                if (onNewOrderCallback) onNewOrderCallback(payload.order);
                            }
                        } else if (payload.action === 'UPDATE_ORDER' && payload.order) {
                            const existingIdx = this.orders.findIndex(o => o.id === payload.order.id);
                            if (existingIdx !== -1) {
                                this.orders[existingIdx] = { ...this.orders[existingIdx], ...payload.order };
                            } else {
                                this.orders.unshift(payload.order);
                            }
                            this.saveOrders();
                            if (onUpdateCallback) onUpdateCallback(payload.order);
                        }
                    }
                } catch (err) {}
            };
        } catch (e) {
            console.warn("Cloud EventSource init error", e);
        }

        // 3. Fallback poll interval every 5 seconds
        if (!this.cloudSyncTimer) {
            this.cloudSyncTimer = setInterval(() => {
                this.syncCloudOrders(() => {
                    if (onUpdateCallback) onUpdateCallback();
                });
            }, 5000);
        }
    }

    // --- PAYMENT CONFIRMATION (IDEMPOTENT) ---
    confirmPayment(orderId, confirmedBy = "Admin", paymentMethod = "vietqr") {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return null;

        // Idempotency: Avoid double confirmation or duplicate revenue calculation
        if (order.paymentStatus === 'paid') {
            console.warn(`Order ${orderId} already confirmed paid.`);
            return order;
        }

        order.paymentStatus = 'paid';
        order.paidAt = new Date().toISOString();
        order.confirmedBy = confirmedBy;
        order.paymentMethod = paymentMethod;
        if (order.status === 'pending') order.status = 'preparing';

        this.saveOrders();

        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({ type: 'ORDER_PAYMENT_CONFIRMED', orderId, order });
        }
        this.pushOrderToCloud(order, 'UPDATE_ORDER');

        return order;
    }

    setAwaitingPaymentCheck(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order || order.paymentStatus === 'paid') return order;

        order.paymentStatus = 'awaiting_check';
        this.saveOrders();
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({ type: 'ORDER_STATUS_CHANGED', orderId, status: order.status });
        }
        this.pushOrderToCloud(order, 'UPDATE_ORDER');
        return order;
    }

    updateOrderStatus(orderId, newStatus) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            order.updatedAt = new Date().toISOString();
            this.saveOrders();
            if (this.broadcastChannel) {
                this.broadcastChannel.postMessage({ type: 'ORDER_STATUS_CHANGED', orderId, status: newStatus });
            }
            this.pushOrderToCloud(order, 'UPDATE_ORDER');
            return order;
        }
        return null;
    }

    // --- REPRINT & PRINTER LOGGING ---
    recordPrintAttempt(orderId, targetStation, status, errorMsg = null, user = "Admin") {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        const now = new Date();
        if (!order.printerStatus) {
            order.printerStatus = {
                cashier: { status: "pending", time: null, error: null },
                kitchen: { status: "pending", time: null, error: null },
                bar: { status: "pending", time: null, error: null }
            };
        }

        order.printerStatus[targetStation] = {
            status: status, // "printed" | "error" | "pending"
            time: now.toISOString(),
            error: errorMsg
        };

        if (!order.printLogs) order.printLogs = [];
        order.reprintCount = (order.reprintCount || 0) + (status === 'printed' ? 1 : 0);

        order.printLogs.push({
            time: now.toISOString(),
            target: targetStation,
            status,
            error: errorMsg,
            reprintCount: order.reprintCount,
            user
        });

        this.saveOrders();
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({ type: 'ORDER_PRINT_UPDATED', orderId, printerStatus: order.printerStatus });
        }
    }

    // --- VIETQR GENERATOR ---
    generateVietQRUrl(amount, orderId, customNote = "") {
        const bank = this.config?.bank_config;
        if (!bank || !bank.bank_id || !bank.account_no) {
            return null;
        }
        const bankId = bank.bank_id;
        const accNo = bank.account_no.trim();
        const accName = encodeURIComponent(bank.account_name || "PACA BAR");
        const memo = encodeURIComponent(`${orderId} ${customNote}`.trim());
        const template = bank.template || "compact2";
        
        // vietqr.io API
        return `https://img.vietqr.io/image/${bankId}-${accNo}-${template}.png?amount=${amount}&addInfo=${memo}&accountName=${accName}`;
    }

    // --- TELEGRAM NOTIFICATIONS ---
    async sendTelegramOrder(order) {
        const tg = this.config?.telegram_config;
        if (!tg || !tg.is_enabled || !tg.bot_token || !tg.chat_id) {
            return;
        }

        const itemsList = order.items.map(it => {
            const stationTag = it.station === 'kitchen' ? '🍳' : '🍸';
            let line = `${stationTag} *${it.name}* (x${it.quantity}) - ${this.formatMoney(it.subtotal)}`;
            if (it.itemNote) line += `\n   └ 📝 _${it.itemNote}_`;
            return line;
        }).join('\n');

        let discountLine = '';
        if (order.discount && order.discount.amount > 0) {
            discountLine = `\n🎁 *Giảm giá:* -${this.formatMoney(order.discount.amount)} _(${order.discount.reason || 'Ưu đãi'})_`;
        }

        const message = 
`🔔 *ĐƠN HÀNG MỚI - PACA BAR* 🔔
━━━━━━━━━━━━━━━━━━━━
🏷️ *Mã đơn:* \`${order.id}\`
🪑 *Vị trí:* *${order.tableName}* (${order.source === 'manual_admin' ? 'Tạo thủ công' : 'Khách quét QR'})
⏰ *Thời gian:* ${order.createdAtFormatted}
━━━━━━━━━━━━━━━━━━━━
${itemsList}
━━━━━━━━━━━━━━━━━━━━
${discountLine}
💰 *TỔNG TIỀN:* *${this.formatMoney(order.totalAmount)}*
${order.note ? `📝 *Ghi chú:* _${order.note}_\n` : ''}
⚡ *Trạng thái:* ${order.paymentStatus === 'paid' ? 'ĐÃ THANH TOÁN ✓' : 'Chưa thanh toán'}`;

        try {
            const url = `https://api.telegram.org/bot${tg.bot_token}/sendMessage`;
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: tg.chat_id,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });
        } catch (e) {
            console.warn("Telegram send error:", e);
        }
    }

    async testTelegramConnection(botToken, chatId) {
        if (!botToken || !chatId) throw new Error("Chưa nhập Bot Token hoặc Chat ID");
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const testText = `🍸 *PACA BAR* - KẾT NỐI TELEGRAM THÀNH CÔNG!\n⏰ ${this.formatDateTime(new Date())}\nSẵn sàng nhận thông báo đơn hàng trực tiếp.`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: testText,
                parse_mode: 'Markdown'
            })
        });
        const data = await res.json();
        if (!data.ok) {
            throw new Error(data.description || "Lỗi gửi Telegram");
        }
        return true;
    }

    // --- BILL & TICKET GENERATION (CUSTOMIZABLE TEMPLATES) ---
    getDividerCss(style) {
        if (style === 'solid') return 'border-top: 1px solid #000; margin: 6px 0;';
        if (style === 'double') return 'border-top: 3px double #000; margin: 6px 0;';
        return 'border-top: 1px dashed #000; margin: 6px 0;'; // dashed default
    }

    generateCashierBillHtml(order, isReprint = false, reprintInfo = null) {
        const cfg = this.config || {};
        const tpl = (this.billTemplates && this.billTemplates.cashier) ? this.billTemplates.cashier : DEFAULT_BILL_TEMPLATES.cashier;
        const qrUrl = tpl.show_qr ? this.generateVietQRUrl(order.totalAmount, order.id, order.tableName) : null;

        const paperWidth = tpl.paper_size === 'k58' ? '48mm' : '72mm';
        const pageSize = tpl.paper_size === 'k58' ? '58mm' : '80mm';

        let fontSizeBase = '12px';
        if (tpl.font_size === 'small') fontSizeBase = '11px';
        if (tpl.font_size === 'large') fontSizeBase = '14px';

        const dividerCss = this.getDividerCss(tpl.divider_style);

        const itemsHtml = (order.items || []).map((it, idx) => `
            <tr>
                <td style="padding: 4px 0; font-weight: 600; word-break: break-word; line-height: 1.25;">
                    ${idx + 1}. ${it.name}
                    ${it.variant ? `<div style="font-size: 10px; color: #444;">└ Size/Loại: ${it.variant.name}</div>` : ''}
                    ${it.options && it.options.length > 0 ? it.options.map(o => `<div style="font-size: 10px; color: #444;">└ ${o.name}</div>`).join('') : ''}
                    ${tpl.show_item_notes && it.itemNote ? `<div style="font-size: 10px; color: #333; font-style: italic;">└ Ghi chú: ${it.itemNote}</div>` : ''}
                </td>
                <td style="padding: 4px 0; text-align: center; vertical-align: top; width: 26px;">${it.quantity}</td>
                ${tpl.show_unit_price ? `<td style="padding: 4px 0; text-align: right; vertical-align: top; white-space: nowrap;">${this.formatMoney(it.unitPrice || it.price)}</td>` : ''}
                ${tpl.show_subtotal ? `<td style="padding: 4px 0; text-align: right; vertical-align: top; font-weight: bold; white-space: nowrap;">${this.formatMoney(it.subtotal || (it.price * it.quantity))}</td>` : ''}
            </tr>
        `).join('');

        let reprintHeader = '';
        if (isReprint) {
            reprintHeader = `
            <div style="background: #000; color: #fff; text-align: center; font-weight: 900; font-size: 13px; padding: 4px 0; margin-bottom: 6px; letter-spacing: 1px;">
                *** BẢN IN LẠI (LẦN ${order.reprintCount || 1}) ***
            </div>
            <div style="font-size: 10px; text-align: center; margin-bottom: 6px; color: #333;">
                Giờ in gốc: ${order.createdAtFormatted} | In lại: ${this.formatDateTime(new Date())} (${reprintInfo?.user || 'Admin'})
            </div>
            `;
        }

        const storeName = tpl.store_name || cfg.shop_name || 'PACA BAR';
        const storeAddr = tpl.store_address || cfg.shop_address || '5A Pasteur, Phường 4, TP. Đà Lạt';
        const storePhone = tpl.store_phone || cfg.shop_phone || '09xx xxx xxx';
        const alignStyle = tpl.title_align === 'left' ? 'text-align: left;' : 'text-align: center;';

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Bill Thu Ngan - ${order.id}</title>
            <style>
                @page { size: ${pageSize} auto; margin: 0; }
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                    width: ${paperWidth};
                    margin: 0 auto;
                    padding: 8px 4px;
                    color: #000;
                    font-size: ${fontSizeBase};
                    line-height: 1.35;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .font-bold { font-weight: bold; }
                .divider { ${dividerCss} }
                .title { font-size: 18px; font-weight: 900; letter-spacing: 1px; }
                table { width: 100%; border-collapse: collapse; font-size: inherit; }
                .qr-container { text-align: center; margin: 8px 0; }
                .qr-container img { width: 160px; height: 160px; object-fit: contain; }
                @media print {
                    .no-print { display: none !important; }
                    body { width: 100%; }
                }
            </style>
        </head>
        <body>
            ${reprintHeader}

            <div style="${alignStyle}">
                ${tpl.show_logo ? `<div class="title">${storeName}</div>` : ''}
                ${tpl.show_address ? `<div style="font-size: 11px;">${storeAddr}</div>` : ''}
                ${tpl.show_phone ? `<div style="font-size: 11px;">Hotline: ${storePhone}</div>` : ''}
                <div style="font-size: 15px; font-weight: 900; margin-top: 6px; letter-spacing: 0.5px;">${tpl.title || 'PHIẾU THANH TOÁN'}</div>
            </div>

            <div class="divider"></div>
            
            <div style="font-size: 11px; line-height: 1.45;">
                ${tpl.show_order_id ? `<div>${tpl.order_id_label || 'Mã đơn'}: <b style="font-size: 13px;">${order.id}</b></div>` : ''}
                ${tpl.show_outlet ? `<div>Outlet: <b>${tpl.outlet_name || 'Main Bar'}</b></div>` : ''}
                ${tpl.show_table ? `<div>${tpl.table_label || 'Bàn/Vị trí'}: <b style="font-size: 14px;">${order.tableName}</b></div>` : ''}
                ${tpl.show_pax ? `<div>${tpl.pax_label || 'Số khách'}: <b>${order.pax || 2} Pax</b></div>` : ''}
                ${tpl.show_time ? `<div>${tpl.time_label || 'Thời gian'}: ${order.createdAtFormatted}</div>` : ''}
                ${tpl.show_staff ? `<div>${tpl.staff_label || 'Thu ngân'}: ${order.confirmedBy || order.creator || 'PACA Team'}</div>` : ''}
            </div>

            <div class="divider"></div>

            <table>
                <thead>
                    <tr style="border-bottom: 1px solid #000; font-size: 11px;">
                        <th style="text-align: left; padding-bottom: 4px;">Món</th>
                        <th style="text-align: center; padding-bottom: 4px; width: 26px;">SL</th>
                        ${tpl.show_unit_price ? `<th style="text-align: right; padding-bottom: 4px; white-space: nowrap;">Đ.Giá</th>` : ''}
                        ${tpl.show_subtotal ? `<th style="text-align: right; padding-bottom: 4px; white-space: nowrap;">T.Tiền</th>` : ''}
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <div class="divider"></div>
            
            ${tpl.show_calc_subtotal && order.subtotalAmount ? `
                <div style="display: flex; justify-content: space-between; font-size: 12px; padding: 2px 0;">
                    <span>Tạm tính:</span>
                    <span>${this.formatMoney(order.subtotalAmount)}</span>
                </div>
            ` : ''}

            ${order.discount && order.discount.amount > 0 && tpl.show_discount ? `
                <div style="display: flex; justify-content: space-between; font-size: 12px; padding: 2px 0;">
                    <span>Giảm giá (${order.discount.reason || 'Ưu đãi'}):</span>
                    <span style="font-weight: bold;">-${this.formatMoney(order.discount.amount)}</span>
                </div>
            ` : ''}

            ${order.surcharge && order.surcharge.amount > 0 && tpl.show_surcharge ? `
                <div style="display: flex; justify-content: space-between; font-size: 12px; padding: 2px 0;">
                    <span>Phụ thu (${order.surcharge.reason || 'Dịch vụ'}):</span>
                    <span style="font-weight: bold;">+${this.formatMoney(order.surcharge.amount)}</span>
                </div>
            ` : ''}

            ${tpl.show_total ? `
                <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 900; padding: 4px 0; border-top: 1px dashed #777; margin-top: 3px;">
                    <span>TỔNG TIỀN:</span>
                    <span style="font-size: 17px;">${this.formatMoney(order.totalAmount)}</span>
                </div>
            ` : ''}

            ${tpl.show_payment_status ? `
                <div style="text-align: right; font-size: 11px; margin-top: 2px;">
                    Trạng thái: <b>${order.paymentStatus === 'paid' ? 'ĐÃ THANH TOÁN ✓' : 'CHƯA THANH TOÁN'}</b>
                </div>
            ` : ''}

            ${order.note && tpl.show_note ? `
                <div style="font-size: 11px; margin-top: 6px; padding: 4px; background: #f4f4f4; border: 1px solid #ddd; border-radius: 4px;">
                    <b>Ghi chú đơn:</b> ${order.note}
                </div>
            ` : ''}

            ${qrUrl ? `
            <div class="divider"></div>
            <div class="qr-container">
                <div style="font-weight: bold; font-size: 12px; margin-bottom: 3px;">QUÉT MÃ VIETQR ĐỂ THANH TOÁN</div>
                <img src="${qrUrl}" alt="VietQR Payment">
                ${tpl.show_bank_info ? `
                <div style="font-size: 11px; margin-top: 3px;">
                    <div>${cfg.bank_config?.bank_id} - ${cfg.bank_config?.account_no}</div>
                    <div><b>${cfg.bank_config?.account_name}</b></div>
                </div>
                ` : ''}
            </div>
            ` : ''}

            ${tpl.show_thanks ? `
            <div class="divider"></div>
            <div class="text-center" style="font-size: 11px; margin-top: 6px;">
                <div>${tpl.thanks_text || 'Cảm ơn quý khách & Hẹn gặp lại!'}</div>
                ${tpl.thanks_quote ? `<div style="font-style: italic; color: #444; margin-top: 2px;">"${tpl.thanks_quote}"</div>` : ''}
            </div>
            ` : ''}
        </body>
        </html>
        `;
    }

    generateKitchenTicketHtml(order, targetStation = "kitchen", isReprint = false, reprintInfo = null) {
        const tplKey = targetStation === 'bar' ? 'bar' : 'kitchen';
        const tpl = (this.billTemplates && this.billTemplates[tplKey]) ? this.billTemplates[tplKey] : DEFAULT_BILL_TEMPLATES[tplKey];

        const paperWidth = tpl.paper_size === 'k58' ? '48mm' : '72mm';
        const pageSize = tpl.paper_size === 'k58' ? '58mm' : '80mm';
        const dividerCss = this.getDividerCss(tpl.divider_style);

        let filteredItems = order.items || [];
        if (targetStation === 'kitchen') {
            filteredItems = filteredItems.filter(i => (i.station || 'bar') === 'kitchen');
        } else if (targetStation === 'bar') {
            filteredItems = filteredItems.filter(i => (i.station || 'bar') === 'bar');
        }

        if (filteredItems.length === 0) {
            return null; // Không có món nào cho trạm này
        }

        const itemsHtml = filteredItems.map((it, idx) => `
            <tr style="border-bottom: 1px dashed #777;">
                <td style="padding: 6px 0; font-size: 13px; font-weight: bold; word-break: break-word;">
                    ${idx + 1}. ${it.name}
                    ${it.variant ? `<div style="font-size: 11px; color: #ce1126; font-weight: bold;">▶ ${it.variant.name}</div>` : ''}
                    ${it.options && it.options.length > 0 ? it.options.map(o => `<div style="font-size: 11px; color: #ce1126;">+ ${o.name}</div>`).join('') : ''}
                    ${it.itemNote ? `<div style="font-size: 11px; font-weight: bold; color: #000; margin-top: 2px;">⚠️ Ghi chú: ${it.itemNote}</div>` : ''}
                </td>
                <td style="padding: 6px 0; text-align: right; vertical-align: top; font-size: 18px; font-weight: 900; width: 45px;">
                    x${it.quantity}
                </td>
            </tr>
        `).join('');

        let reprintHeader = '';
        if (isReprint) {
            reprintHeader = `
            <div style="background: #000; color: #fff; text-align: center; font-weight: 900; font-size: 13px; padding: 4px 0; margin-bottom: 6px; letter-spacing: 1px;">
                *** BẢN IN LẠI (LẦN ${order.reprintCount || 1}) ***
            </div>
            `;
        }

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Ticket ${targetStation} - ${order.id}</title>
            <style>
                @page { size: ${pageSize} auto; margin: 0; }
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                    width: ${paperWidth};
                    margin: 0 auto;
                    padding: 8px 4px;
                    color: #000;
                    font-size: 13px;
                    line-height: 1.35;
                }
                .text-center { text-align: center; }
                .divider { ${dividerCss} }
                .title { font-size: 16px; font-weight: 900; }
                table { width: 100%; border-collapse: collapse; }
                @media print {
                    .no-print { display: none !important; }
                    body { width: 100%; }
                }
            </style>
        </head>
        <body>
            ${reprintHeader}

            <div class="text-center">
                <div class="title">${tpl.title || (targetStation === 'kitchen' ? 'PHIẾU BẾP' : 'PHIẾU BAR')}</div>
                <div style="font-size: 20px; font-weight: 900; margin: 4px 0; background: #000; color: #fff; padding: 3px 0;">
                    ${order.tableName}
                </div>
            </div>

            <div class="divider"></div>
            <div style="font-size: 11px;">
                ${tpl.show_order_id ? `<div>${tpl.order_id_label || 'Mã đơn'}: <b>${order.id}</b></div>` : ''}
                ${tpl.show_time ? `<div>${tpl.time_label || 'Giờ nhận'}: <b>${order.createdAtFormatted}</b></div>` : ''}
                ${tpl.show_staff ? `<div>${tpl.staff_label || 'Nhân viên'}: ${order.confirmedBy || order.creator || 'PACA'}</div>` : ''}
                ${tpl.show_pax ? `<div>${tpl.pax_label || 'Số khách'}: ${order.pax || 2} Pax</div>` : ''}
            </div>
            ${order.note && tpl.show_note ? `<div style="margin-top: 4px; background: #eee; padding: 4px; font-weight: bold; font-size: 11px;">⚠️ LƯU Ý: ${order.note}</div>` : ''}
            <div class="divider"></div>

            <table>
                <thead>
                    <tr style="border-bottom: 2px solid #000; font-size: 12px;">
                        <th style="text-align: left; padding-bottom: 4px;">MÓN CẦN CHẾ BIẾN</th>
                        <th style="text-align: right; padding-bottom: 4px; width: 45px;">SL</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <div class="divider"></div>
            <div class="text-center" style="font-size: 11px; margin-top: 8px; color: #555;">
                (Phiếu chế biến nội bộ - Tuyệt đối không hiển thị giá)
            </div>
        </body>
        </html>
        `;
    }

    generateBarTicketHtml(order, isReprint = false, reprintInfo = null) {
        return this.generateKitchenTicketHtml(order, 'bar', isReprint, reprintInfo);
    }

    // In ra trình duyệt
    printHtml(htmlContent) {
        const printWindow = window.open('', '_blank', 'width=450,height=650');
        if (!printWindow) {
            alert("Trình duyệt đã chặn cửa sổ in pop-up. Vui lòng bật quyền cho phép pop-up.");
            return false;
        }
        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 350);
        return true;
    }

    // --- REVENUE REPORTS ---
    getRevenueStats() {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfThisWeek = startOfToday - ((now.getDay() === 0 ? 6 : now.getDay() - 1) * 86400000);
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        let todayRevenue = 0, todayOrders = 0;
        let weekRevenue = 0, weekOrders = 0;
        let monthRevenue = 0, monthOrders = 0;
        let totalRevenue = 0, totalOrders = 0;

        const itemSalesMap = {};

        this.orders.forEach(ord => {
            // Chỉ tính doanh thu của các đơn ĐÃ XÁC NHẬN THANH TOÁN ("paid")
            if (ord.status === 'cancelled' || ord.paymentStatus !== 'paid') return;

            const ordTime = new Date(ord.createdAt).getTime();
            totalRevenue += ord.totalAmount;
            totalOrders += 1;

            if (ordTime >= startOfToday) {
                todayRevenue += ord.totalAmount;
                todayOrders += 1;
            }
            if (ordTime >= startOfThisWeek) {
                weekRevenue += ord.totalAmount;
                weekOrders += 1;
            }
            if (ordTime >= startOfThisMonth) {
                monthRevenue += ord.totalAmount;
                monthOrders += 1;
            }

            ord.items.forEach(it => {
                if (!itemSalesMap[it.name]) {
                    itemSalesMap[it.name] = { name: it.name, quantity: 0, revenue: 0 };
                }
                itemSalesMap[it.name].quantity += it.quantity;
                itemSalesMap[it.name].revenue += it.subtotal;
            });
        });

        const topItems = Object.values(itemSalesMap)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        return {
            today: { revenue: todayRevenue, count: todayOrders },
            week: { revenue: weekRevenue, count: weekOrders },
            month: { revenue: monthRevenue, count: monthOrders },
            total: { revenue: totalRevenue, count: totalOrders },
            topItems
        };
    }

    // --- SOUND NOTIFICATION ---
    playNotificationSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime);
            osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.12);
            osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.25);

            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

            osc.start();
            osc.stop(ctx.currentTime + 0.65);
        } catch (e) {
            console.log("AudioContext not triggered", e);
        }
    }

    // --- UTILITIES ---
    formatMoney(num) {
        if (!num) return "0 đ";
        return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
    }

    formatDateTime(dateObj) {
        const d = new Date(dateObj);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const hours = d.getHours().toString().padStart(2, '0');
        const mins = d.getMinutes().toString().padStart(2, '0');
        return `${hours}:${mins} - ${day}/${month}`;
    }
}

// Global instance
window.paca = new PacaService();
