/**
 * PACA CORE SYSTEM MODULE (V2 - UPGRADED)
 * Central state, storage, order management, VietQR, Web/ESC-POS printing, Bill Templates & Audit
 */

const PACA_STORAGE_KEYS = {
    MENU: 'paca_menu_data_v1',
    TABLES: 'paca_tables_data_v1',
    CONFIG: 'paca_config_data_v1',
    ORDERS: 'paca_orders_data_v1',
    BILL_TEMPLATES: 'paca_bill_templates_v1',
    USERS: 'paca_users_data_v1',
    CURRENT_USER: 'paca_current_user_v1',
    INVENTORY_LOGS: 'paca_inventory_logs_v1'
};

const DEFAULT_UNITS = ['Ly', 'Chai', 'Lon', 'Phần', 'Đĩa', 'Gói', 'Set', 'Shot', 'Thùng', 'Két', 'Bình', 'Tháp'];

const DEFAULT_USERS = [
    { id: 'usr_admin', name: 'Quản Lý (Admin)', pin: '8888', role: 'admin', createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'usr_staff_1', name: 'Thu Ngân 1', pin: '1111', role: 'staff', createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'usr_staff_2', name: 'Bar 1', pin: '2222', role: 'staff', createdAt: '2026-01-01T00:00:00.000Z' }
];

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
        this.users = [];
        this.currentUser = null;
        this.inventoryLogs = [];
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
        this.loadUsers();
        await this.loadMenu();
        await this.loadTables();
        this.loadBillTemplates();
        this.loadOrders();
        this.loadInventoryLogs();
    }

    // --- CONFIG ---
    async loadConfig() {
        let serverConfig = null;
        try {
            const res = await fetch('data/config.json?v=' + Date.now());
            if (res.ok) serverConfig = await res.json();
        } catch (e) {}

        const local = localStorage.getItem(PACA_STORAGE_KEYS.CONFIG);
        if (local) {
            try {
                this.config = JSON.parse(local);
                if (serverConfig) {
                    // Always ensure valid telegram_config from server if local is empty/disabled
                    if ((!this.config.telegram_config?.bot_token || !this.config.telegram_config?.chat_id) && serverConfig.telegram_config?.bot_token) {
                        this.config.telegram_config = serverConfig.telegram_config;
                        this.saveConfig(this.config);
                    }
                }
                return this.config;
            } catch (e) {
                console.warn("Invalid local config, fallback to default", e);
            }
        }
        if (serverConfig) {
            this.config = serverConfig;
            this.saveConfig(this.config);
            return this.config;
        }

        this.config = {
            shop_name: "PACA - TINY COZY BAR",
            shop_address: "5A (10-1) Pasteur, TP. Đà Lạt",
            shop_phone: "09xx xxx xxx",
            shop_open_hours: "16:00 - 23:00 Hàng Ngày",
            currency: "đ",
            admin_pin: "1234",
            bank_config: { bank_id: "MB", account_no: "", account_name: "" },
            printer_config: { paper_size: "k80", print_mode: "web_dialog" },
            telegram_config: {
                bot_token: "8939279124:AAEj46DdHIjiVz-VQKBipqsPvrKIzvj45Rw",
                chat_id: "-5304065828",
                is_enabled: true
            }
        };
        this.saveConfig(this.config);
        return this.config;
    }

    saveConfig(cfg) {
        this.config = { ...this.config, ...cfg };
        localStorage.setItem(PACA_STORAGE_KEYS.CONFIG, JSON.stringify(this.config));
        return this.config;
    }

    // --- USER MANAGEMENT & PIN RBAC ---
    loadUsers() {
        const local = localStorage.getItem(PACA_STORAGE_KEYS.USERS);
        if (local) {
            try {
                this.users = JSON.parse(local);
                if (Array.isArray(this.users) && this.users.length > 0) {
                    if (!this.users.some(u => u.role === 'admin')) {
                        this.users.unshift(DEFAULT_USERS[0]);
                        this.saveUsers(this.users);
                    }
                } else {
                    this.users = JSON.parse(JSON.stringify(DEFAULT_USERS));
                    this.saveUsers(this.users);
                }
            } catch (e) {
                this.users = JSON.parse(JSON.stringify(DEFAULT_USERS));
                this.saveUsers(this.users);
            }
        } else {
            this.users = JSON.parse(JSON.stringify(DEFAULT_USERS));
            this.saveUsers(this.users);
        }

        // Active user session
        const activeLocal = localStorage.getItem(PACA_STORAGE_KEYS.CURRENT_USER);
        if (activeLocal) {
            try {
                const u = JSON.parse(activeLocal);
                const found = this.users.find(x => x.id === u.id);
                this.currentUser = found || this.users[0];
            } catch (e) {
                this.currentUser = this.users[0];
            }
        } else {
            this.currentUser = this.users[0];
            this.saveCurrentUser(this.currentUser);
        }
        return this.users;
    }

    saveUsers(users) {
        this.users = users;
        localStorage.setItem(PACA_STORAGE_KEYS.USERS, JSON.stringify(this.users));
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({ type: 'USERS_UPDATED', users: this.users });
        }
    }

    getCurrentUser() {
        if (!this.currentUser && this.users.length > 0) {
            this.currentUser = this.users[0];
        }
        return this.currentUser;
    }

    saveCurrentUser(user) {
        this.currentUser = user;
        if (user) {
            localStorage.setItem(PACA_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        } else {
            localStorage.removeItem(PACA_STORAGE_KEYS.CURRENT_USER);
        }
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({ type: 'CURRENT_USER_CHANGED', user });
        }
    }

    loginWithPin(pin) {
        const cleanPin = String(pin || '').trim();
        const found = this.users.find(u => String(u.pin).trim() === cleanPin);
        if (found) {
            this.saveCurrentUser(found);
            return { success: true, user: found };
        }
        return { success: false, message: 'Mã PIN không đúng, vui lòng kiểm tra lại!' };
    }

    logoutUser() {
        this.saveCurrentUser(null);
    }

    isAdmin() {
        const u = this.getCurrentUser();
        return u && u.role === 'admin';
    }

    addUser({ name, pin, role = 'staff' }) {
        const cleanName = String(name || '').trim();
        const cleanPin = String(pin || '').trim();
        if (!cleanName) throw new Error('Tên nhân viên không được để trống.');
        if (!cleanPin || cleanPin.length < 4) throw new Error('Mã PIN phải từ 4 số trở lên.');
        if (this.users.some(u => String(u.pin).trim() === cleanPin)) {
            throw new Error(`Mã PIN ${cleanPin} đã được sử dụng bởi nhân viên khác.`);
        }
        const newUser = {
            id: 'usr_' + Date.now().toString(36),
            name: cleanName,
            pin: cleanPin,
            role: role === 'admin' ? 'admin' : 'staff',
            createdAt: new Date().toISOString()
        };
        this.users.push(newUser);
        this.saveUsers(this.users);
        return newUser;
    }

    updateUser(userId, { name, pin, role }) {
        const user = this.users.find(u => u.id === userId);
        if (!user) throw new Error('Không tìm thấy nhân viên.');
        if (name) user.name = String(name).trim();
        if (pin) {
            const cleanPin = String(pin).trim();
            if (cleanPin.length < 4) throw new Error('Mã PIN phải từ 4 số trở lên.');
            const dup = this.users.find(u => u.id !== userId && String(u.pin).trim() === cleanPin);
            if (dup) throw new Error(`Mã PIN ${cleanPin} đã bị trùng.`);
            user.pin = cleanPin;
        }
        if (role) {
            if (user.role === 'admin' && role !== 'admin') {
                const adminCount = this.users.filter(u => u.role === 'admin').length;
                if (adminCount <= 1) throw new Error('Không thể chuyển vai trò của Quản Lý cuối cùng.');
            }
            user.role = role === 'admin' ? 'admin' : 'staff';
        }
        this.saveUsers(this.users);
        if (this.currentUser?.id === userId) {
            this.saveCurrentUser(user);
        }
        return user;
    }

    deleteUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) throw new Error('Không tìm thấy nhân viên.');
        if (user.role === 'admin') {
            const adminCount = this.users.filter(u => u.role === 'admin').length;
            if (adminCount <= 1) throw new Error('Không thể xóa tài khoản Quản Lý (Admin) cuối cùng.');
        }
        this.users = this.users.filter(u => u.id !== userId);
        this.saveUsers(this.users);
        if (this.currentUser?.id === userId) {
            const admin = this.users.find(u => u.role === 'admin') || this.users[0];
            this.saveCurrentUser(admin);
        }
        return user;
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
        let serverMenu = null;
        try {
            const res = await fetch('data/menu.json?v=' + Date.now());
            if (res.ok) serverMenu = await res.json();
        } catch (e) {}

        const local = localStorage.getItem(PACA_STORAGE_KEYS.MENU);
        if (local) {
            try {
                this.menu = JSON.parse(local);
                if (this.menu && this.menu.categories && this.menu.categories.length > 0) {
                    if (serverMenu && serverMenu.items) {
                        let hasChanges = false;
                        serverMenu.items.forEach(sIt => {
                            let localIt = this.menu.items.find(i => i.id === sIt.id || i.name === sIt.name);
                            if (!localIt) {
                                this.menu.items.push(JSON.parse(JSON.stringify(sIt)));
                                hasChanges = true;
                            } else {
                                if (localIt.cost_price === undefined || localIt.cost_price === null) {
                                    localIt.cost_price = sIt.cost_price;
                                    localIt.costPrice = sIt.cost_price;
                                    hasChanges = true;
                                }
                                if (localIt.unit === undefined) { localIt.unit = sIt.unit || 'Ly'; hasChanges = true; }
                                if (localIt.stock_quantity === undefined) { localIt.stock_quantity = sIt.stock_quantity !== undefined ? sIt.stock_quantity : 30; hasChanges = true; }
                                if (localIt.low_stock_threshold === undefined) { localIt.low_stock_threshold = sIt.low_stock_threshold || 5; hasChanges = true; }
                                if (localIt.track_stock === undefined) { localIt.track_stock = sIt.track_stock !== false; hasChanges = true; }
                                if (localIt.item_type === undefined) { localIt.item_type = sIt.item_type || 'standard'; hasChanges = true; }
                                if (localIt.sku === undefined) { localIt.sku = sIt.sku || `PACA-${localIt.id.toUpperCase()}`; hasChanges = true; }
                                if ((!localIt.options || localIt.options.length === 0) && sIt.options && sIt.options.length > 0) {
                                    localIt.options = sIt.options;
                                    hasChanges = true;
                                }
                            }
                        });
                        if (hasChanges) {
                            this.saveMenu(this.menu);
                        }
                    }
                    this.normalizeCategories();
                    return this.menu;
                }
            } catch (e) {
                console.warn("Invalid local menu", e);
            }
        }
        if (serverMenu) {
            this.menu = serverMenu;
            this.normalizeCategories();
            this.saveMenu(this.menu);
            return this.menu;
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

    getDishCostPrice(item) {
        if (!item) return 0;
        if (item.costPrice !== undefined && item.costPrice !== null && !isNaN(item.costPrice)) return Number(item.costPrice);
        if (item.cost_price !== undefined && item.cost_price !== null && !isNaN(item.cost_price)) return Number(item.cost_price);
        const itemId = item.productId || item.id;
        const found = (this.menu?.items || []).find(d => d.id === itemId || d.name === item.name);
        if (found && (found.cost_price !== undefined || found.costPrice !== undefined)) {
            return Number(found.cost_price || found.costPrice || 0);
        }
        return 0;
    }

    saveBatchCostPrices(itemsCostMap) {
        if (!this.menu || !this.menu.items) return 0;
        let changeCount = 0;
        this.menu.items.forEach(item => {
            if (itemsCostMap[item.id] !== undefined) {
                const val = Math.max(0, parseInt(itemsCostMap[item.id]) || 0);
                item.cost_price = val;
                item.costPrice = val;
                changeCount++;
            }
        });
        this.saveMenu(this.menu);
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({ type: 'MENU_BATCH_COST_SAVED' });
        }
        return changeCount;
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

    // --- INVENTORY MANAGEMENT & UNITS ---
    getUnitsList() {
        const custom = this.config?.custom_units || [];
        const combined = [...DEFAULT_UNITS, ...custom];
        return Array.from(new Set(combined));
    }

    addCustomUnit(unitName) {
        const clean = String(unitName || '').trim();
        if (!clean) return this.getUnitsList();
        if (!this.config.custom_units) this.config.custom_units = [];
        if (!this.config.custom_units.includes(clean)) {
            this.config.custom_units.push(clean);
            this.saveConfig(this.config);
        }
        return this.getUnitsList();
    }

    loadInventoryLogs() {
        const local = localStorage.getItem(PACA_STORAGE_KEYS.INVENTORY_LOGS);
        if (local) {
            try { this.inventoryLogs = JSON.parse(local); } catch (e) { this.inventoryLogs = []; }
        } else {
            this.inventoryLogs = [];
        }
        return this.inventoryLogs;
    }

    saveInventoryLogs() {
        if (this.inventoryLogs.length > 200) this.inventoryLogs = this.inventoryLogs.slice(0, 200);
        localStorage.setItem(PACA_STORAGE_KEYS.INVENTORY_LOGS, JSON.stringify(this.inventoryLogs));
    }

    logInventoryAction(itemId, change, oldStock, newStock, reason = '', staff = '') {
        const item = this.menu?.items.find(i => i.id === itemId);
        const logEntry = {
            id: 'inv_' + Date.now().toString(36),
            itemId,
            itemName: item ? (item.name_vi || item.name) : itemId,
            change,
            oldStock,
            newStock,
            reason,
            staff: staff || this.getCurrentUser()?.name || 'Hệ thống',
            timestamp: new Date().toISOString()
        };
        if (!this.inventoryLogs) this.inventoryLogs = [];
        this.inventoryLogs.unshift(logEntry);
        this.saveInventoryLogs();
    }

    getInventoryStats() {
        if (!this.menu || !this.menu.items) {
            return { totalItems: 0, trackedCount: 0, inStockCount: 0, lowStockCount: 0, outOfStockCount: 0, totalInventoryValue: 0 };
        }
        let totalItems = this.menu.items.length;
        let trackedCount = 0;
        let inStockCount = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;
        let totalInventoryValue = 0;

        this.menu.items.forEach(it => {
            if (it.track_stock !== false) {
                trackedCount++;
                const qty = parseInt(it.stock_quantity) || 0;
                const threshold = parseInt(it.low_stock_threshold) || 5;
                const cost = parseInt(it.cost_price || it.costPrice) || 0;
                totalInventoryValue += (qty * cost);

                if (qty <= 0) {
                    outOfStockCount++;
                } else if (qty <= threshold) {
                    lowStockCount++;
                } else {
                    inStockCount++;
                }
            }
        });

        return {
            totalItems,
            trackedCount,
            inStockCount,
            lowStockCount,
            outOfStockCount,
            totalInventoryValue
        };
    }

    quickAdjustStock(itemId, deltaOrVal, isAbsolute = false, reason = 'Cập nhật kho', staffName = '') {
        if (!this.menu || !this.menu.items) return null;
        const item = this.menu.items.find(i => i.id === itemId);
        if (!item) return null;

        const oldStock = parseInt(item.stock_quantity) || 0;
        let newStock = isAbsolute ? Math.max(0, parseInt(deltaOrVal) || 0) : Math.max(0, oldStock + (parseInt(deltaOrVal) || 0));
        item.stock_quantity = newStock;
        item.track_stock = true;

        if (newStock <= 0) {
            item.is_available = false;
        } else if (newStock > 0 && item.is_available === false && reason.includes('Nhập')) {
            item.is_available = true;
        }

        this.saveMenu(this.menu);
        this.logInventoryAction(itemId, newStock - oldStock, oldStock, newStock, reason, staffName);

        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({ type: 'INVENTORY_UPDATED', itemId, stock: newStock });
            this.broadcastChannel.postMessage({ type: 'ITEM_AVAILABILITY_CHANGED', itemId, isAvailable: item.is_available });
        }
        return item;
    }

    deductOrderStock(order) {
        if (!order || order.inventoryDeducted) return;
        if (!this.menu || !this.menu.items || !order.items) return;

        let hasChanged = false;
        order.items.forEach(it => {
            const itemId = it.productId || it.id;
            const dish = this.menu.items.find(d => d.id === itemId || d.name === it.name);
            if (dish && dish.track_stock !== false) {
                const oldStock = parseInt(dish.stock_quantity) || 0;
                const qtyToDeduct = parseInt(it.quantity) || 1;
                const newStock = Math.max(0, oldStock - qtyToDeduct);
                dish.stock_quantity = newStock;

                if (newStock <= 0) {
                    dish.is_available = false;
                }
                hasChanged = true;
                this.logInventoryAction(dish.id, -qtyToDeduct, oldStock, newStock, `Bán đơn ${order.id} (${order.tableName})`, order.confirmedBy);
            }
        });

        order.inventoryDeducted = true;
        this.saveOrders();

        if (hasChanged) {
            this.saveMenu(this.menu);
            if (this.broadcastChannel) {
                this.broadcastChannel.postMessage({ type: 'INVENTORY_UPDATED', orderId: order.id });
            }
        }
    }

    restoreOrderStock(order) {
        if (!order || !order.inventoryDeducted) return;
        if (!this.menu || !this.menu.items || !order.items) return;

        let hasChanged = false;
        order.items.forEach(it => {
            const itemId = it.productId || it.id;
            const dish = this.menu.items.find(d => d.id === itemId || d.name === it.name);
            if (dish && dish.track_stock !== false) {
                const oldStock = parseInt(dish.stock_quantity) || 0;
                const qtyToRestore = parseInt(it.quantity) || 1;
                const newStock = oldStock + qtyToRestore;
                dish.stock_quantity = newStock;
                if (newStock > 0 && dish.is_available === false) {
                    dish.is_available = true;
                }
                hasChanged = true;
                this.logInventoryAction(dish.id, qtyToRestore, oldStock, newStock, `Hoàn kho huỷ đơn ${order.id}`, this.getCurrentUser()?.name);
            }
        });

        order.inventoryDeducted = false;
        this.saveOrders();

        if (hasChanged) {
            this.saveMenu(this.menu);
            if (this.broadcastChannel) {
                this.broadcastChannel.postMessage({ type: 'INVENTORY_UPDATED', orderId: order.id });
            }
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
        let totalCost = 0;
        const processedItems = items.map(item => {
            const itemPrice = item.price !== undefined ? Number(item.price) : (item.unitPrice !== undefined ? Number(item.unitPrice) : 0);
            const itemQty = Number(item.quantity) || 1;
            const subtotal = item.subtotal !== undefined ? Number(item.subtotal) : (itemPrice * itemQty);
            rawSubtotal += subtotal;
            const costPrice = this.getDishCostPrice(item);
            const itemTotalCost = costPrice * itemQty;
            totalCost += itemTotalCost;
            return {
                id: item.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                productId: item.productId || item.id,
                name: item.name,
                name_vi: item.name_vi || item.name,
                price: itemPrice,
                unitPrice: itemPrice,
                costPrice: costPrice,
                cost_price: costPrice,
                totalCost: itemTotalCost,
                originalPrice: item.originalPrice !== undefined ? item.originalPrice : itemPrice,
                quantity: itemQty,
                subtotal: subtotal,
                station: item.station || 'bar',
                variant: item.variant || null,
                options: item.options || item.selectedOptions || [],
                selectedOptions: item.selectedOptions || item.options || [],
                isOverridden: !!item.isOverridden,
                overrideReason: item.overrideReason || '',
                authorizedBy: item.authorizedBy || '',
                itemNote: item.itemNote || ''
            };
        });

        // Compute total amount with discount and surcharge
        const discountAmount = Math.min(rawSubtotal, Math.max(0, discount.amount || 0));
        const surchargeAmount = Math.max(0, surcharge.amount || 0);
        const finalTotal = Math.max(0, rawSubtotal - discountAmount + surchargeAmount);
        const grossProfit = Math.max(0, finalTotal - totalCost);
        const profitMargin = finalTotal > 0 ? Math.round((grossProfit / finalTotal) * 100) : 0;

        const newOrder = {
            id: orderId,
            tableId: tableId || "MANG_VE",
            tableName: tableName || (tableId ? `Bàn ${tableId}` : "Đơn Mang Về"),
            customerPhone,
            source,
            items: processedItems,
            rawSubtotal,
            totalCost,
            grossProfit,
            profitMargin,
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

    createManualOrder(params) {
        return this.createOrder({
            ...params,
            source: params.source || "manual_admin"
        });
    }

    deleteOrder(orderId) {
        const idx = this.orders.findIndex(o => o.id === orderId);
        if (idx !== -1) {
            const removed = this.orders.splice(idx, 1)[0];
            if (removed && removed.inventoryDeducted) {
                this.restoreOrderStock(removed);
            }
            this.saveOrders();
            if (this.broadcastChannel) {
                this.broadcastChannel.postMessage({ type: 'ORDER_DELETED', orderId });
            }
            this.pushOrderToCloud({ id: orderId }, 'DELETE_ORDER');
            return removed;
        }
        return null;
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
                        } else if (payload.action === 'DELETE_ORDER') {
                            const targetId = payload.order?.id || payload.orderId;
                            if (targetId) {
                                const existingIdx = this.orders.findIndex(o => o.id === targetId);
                                if (existingIdx !== -1) {
                                    this.orders.splice(existingIdx, 1);
                                    hasChanges = true;
                                }
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
                        } else if (payload.action === 'DELETE_ORDER') {
                            const targetId = payload.order?.id || payload.orderId;
                            if (targetId) {
                                const existingIdx = this.orders.findIndex(o => o.id === targetId);
                                if (existingIdx !== -1) {
                                    this.orders.splice(existingIdx, 1);
                                    this.saveOrders();
                                    if (onUpdateCallback) onUpdateCallback();
                                }
                            }
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

        // Auto deduct inventory on payment confirmation
        this.deductOrderStock(order);

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

            if (newStatus === 'completed') {
                this.deductOrderStock(order);
            } else if (newStatus === 'cancelled') {
                this.restoreOrderStock(order);
            }

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
            if (it.options && it.options.length > 0) {
                const optNames = it.options.map(o => typeof o === 'string' ? o : (o.name + (o.price ? ` (+${this.formatMoney(o.price)})` : ''))).join(', ');
                line += `\n   └ ✨ _Vị: ${optNames}_`;
            }
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

    // --- VIETNAMESE ACCENT REMOVER FOR THERMAL PRINTERS ---
    removeVietnameseTones(str) {
        if (!str || typeof str !== 'string') return str || '';
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
        str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
        str = str.replace(/Đ/g, "D");
        // Combining diacritical marks
        str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        // Currency symbol đ -> d
        str = str.replace(/đ/g, "d").replace(/Đ/g, "D");
        return str;
    }

    convertHtmlToUnaccented(html) {
        if (!html) return html;
        if (typeof window !== 'undefined' && window.DOMParser) {
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const walk = (node) => {
                    if (node.nodeType === 3) { // Node.TEXT_NODE
                        node.nodeValue = this.removeVietnameseTones(node.nodeValue);
                    } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
                        for (let child of node.childNodes) {
                            walk(child);
                        }
                    }
                };
                if (doc.body) walk(doc.body);
                return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
            } catch (e) {
                console.warn("DOMParser unaccent fallback:", e);
            }
        }
        return html.replace(/>([^<]+)</g, (m, txt) => '>' + this.removeVietnameseTones(txt) + '<');
    }

    // In ra máy in nhiệt (tự động bỏ dấu tiếng Việt khi in thật để chống lỗi font máy in POS)
    printHtml(htmlContent, autoStripAccents = true) {
        let finalHtml = htmlContent;
        if (autoStripAccents) {
            finalHtml = this.convertHtmlToUnaccented(htmlContent);
        }

        const printWindow = window.open('', '_blank', 'width=450,height=650');
        if (!printWindow) {
            alert("Trình duyệt đã chặn cửa sổ in pop-up. Vui lòng bật quyền cho phép pop-up.");
            return false;
        }
        printWindow.document.open();
        printWindow.document.write(finalHtml);
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

    getFilteredRevenueReport(filters = {}) {
        const now = new Date();
        const curYear = now.getFullYear();
        const curMonth = String(now.getMonth() + 1).padStart(2, '0');
        const curDay = String(now.getDate()).padStart(2, '0');

        // Mặc định từ ngày 1 đầu tháng đến ngày hiện tại
        const defaultFrom = `${curYear}-${curMonth}-01`;
        const defaultTo = `${curYear}-${curMonth}-${curDay}`;

        const fromDateStr = filters.fromDate || defaultFrom;
        const toDateStr = filters.toDate || defaultTo;
        const paymentMethod = filters.paymentMethod || 'all'; // 'all', 'vietqr', 'cash'
        const tableId = filters.tableId || 'all'; // 'all', tableId
        const statusFilter = filters.status || 'paid'; // 'paid', 'all', 'unpaid', 'cancelled', 'all_except_cancelled'

        const startTime = new Date(fromDateStr + 'T00:00:00').getTime();
        const endTime = new Date(toDateStr + 'T23:59:59.999').getTime();

        let filteredOrders = [];
        let paidRevenue = 0;
        let paidCost = 0;
        let paidOrdersCount = 0;
        let unpaidAmount = 0;
        let unpaidOrdersCount = 0;
        let cancelledAmount = 0;
        let cancelledOrdersCount = 0;
        let totalRawSubtotal = 0;
        let totalDiscount = 0;
        let totalSurcharge = 0;

        const itemSalesMap = {};
        const dailyBreakdown = {};

        this.orders.forEach(ord => {
            const ordTime = new Date(ord.createdAt).getTime();
            if (isNaN(ordTime)) return;
            if (ordTime < startTime || ordTime > endTime) return;

            // Filter Table
            if (tableId !== 'all') {
                if (tableId === 'MANG_VE' || tableId === 'takeaway') {
                    if (ord.tableId !== 'MANG_VE' && ord.tableId !== 'takeaway') return;
                } else if (ord.tableId !== tableId) {
                    return;
                }
            }

            // Filter Payment Method
            if (paymentMethod !== 'all') {
                const method = ord.paymentMethod || 'vietqr';
                if (method !== paymentMethod) return;
            }

            // Match Status Filter
            let isStatusMatch = true;
            if (statusFilter === 'paid') {
                isStatusMatch = (ord.paymentStatus === 'paid' && ord.status !== 'cancelled');
            } else if (statusFilter === 'unpaid') {
                isStatusMatch = (ord.paymentStatus !== 'paid' && ord.status !== 'cancelled');
            } else if (statusFilter === 'cancelled') {
                isStatusMatch = (ord.status === 'cancelled');
            } else if (statusFilter === 'all_except_cancelled') {
                isStatusMatch = (ord.status !== 'cancelled');
            } else if (statusFilter === 'all') {
                isStatusMatch = true;
            }

            // Calculate Order Cost & Profit
            let orderTotalCost = 0;
            (ord.items || []).forEach(it => {
                const itemCostPrice = this.getDishCostPrice(it);
                const itemCostTotal = itemCostPrice * (it.quantity || 1);
                orderTotalCost += itemCostTotal;

                if (ord.paymentStatus === 'paid' && ord.status !== 'cancelled') {
                    const key = it.name;
                    if (!itemSalesMap[key]) {
                        itemSalesMap[key] = {
                            name: it.name,
                            name_vi: it.name_vi || it.name,
                            quantity: 0,
                            revenue: 0,
                            costPrice: itemCostPrice,
                            totalCost: 0,
                            profit: 0,
                            profitMargin: 0,
                            station: it.station || 'bar'
                        };
                    }
                    const itRev = (it.subtotal || (it.price * it.quantity));
                    itemSalesMap[key].quantity += (it.quantity || 1);
                    itemSalesMap[key].revenue += itRev;
                    itemSalesMap[key].totalCost += itemCostTotal;
                    itemSalesMap[key].profit = itemSalesMap[key].revenue - itemSalesMap[key].totalCost;
                    itemSalesMap[key].profitMargin = itemSalesMap[key].revenue > 0
                        ? Math.round((itemSalesMap[key].profit / itemSalesMap[key].revenue) * 100)
                        : 0;
                }
            });

            ord.calculatedTotalCost = orderTotalCost;
            ord.calculatedGrossProfit = Math.max(0, (ord.totalAmount || 0) - orderTotalCost);
            ord.calculatedProfitMargin = (ord.totalAmount > 0)
                ? Math.round((ord.calculatedGrossProfit / ord.totalAmount) * 100)
                : 0;

            // Record overall metrics for period
            if (ord.status === 'cancelled') {
                cancelledAmount += (ord.totalAmount || 0);
                cancelledOrdersCount += 1;
            } else if (ord.paymentStatus === 'paid') {
                paidRevenue += (ord.totalAmount || 0);
                paidCost += orderTotalCost;
                paidOrdersCount += 1;
                totalRawSubtotal += (ord.rawSubtotal || ord.totalAmount || 0);
                totalDiscount += (ord.discount?.amount || 0);
                totalSurcharge += (ord.surcharge?.amount || 0);

                // Group daily
                const d = new Date(ord.createdAt);
                const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                if (!dailyBreakdown[dayKey]) {
                    dailyBreakdown[dayKey] = { date: dayKey, revenue: 0, cost: 0, profit: 0, count: 0 };
                }
                dailyBreakdown[dayKey].revenue += (ord.totalAmount || 0);
                dailyBreakdown[dayKey].cost += orderTotalCost;
                dailyBreakdown[dayKey].profit += Math.max(0, (ord.totalAmount || 0) - orderTotalCost);
                dailyBreakdown[dayKey].count += 1;
            } else {
                unpaidAmount += (ord.totalAmount || 0);
                unpaidOrdersCount += 1;
            }

            if (isStatusMatch) {
                filteredOrders.push(ord);
            }
        });

        const grossProfit = Math.max(0, paidRevenue - paidCost);
        const profitMargin = paidRevenue > 0 ? Math.round((grossProfit / paidRevenue) * 100) : 0;

        const topItems = Object.values(itemSalesMap)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);

        const topProfitableItems = Object.values(itemSalesMap)
            .sort((a, b) => b.profit - a.profit)
            .slice(0, 10);

        const aov = paidOrdersCount > 0 ? Math.round(paidRevenue / paidOrdersCount) : 0;

        return {
            fromDate: fromDateStr,
            toDate: toDateStr,
            paymentMethod,
            tableId,
            statusFilter,
            paidRevenue,
            paidCost,
            grossProfit,
            profitMargin,
            paidOrdersCount,
            averageOrderValue: aov,
            unpaidAmount,
            unpaidOrdersCount,
            cancelledAmount,
            cancelledOrdersCount,
            totalRawSubtotal,
            totalDiscount,
            totalSurcharge,
            topItems,
            topProfitableItems,
            dailyBreakdown: Object.values(dailyBreakdown).sort((a, b) => b.date.localeCompare(a.date)),
            filteredOrders
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
