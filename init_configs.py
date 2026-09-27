import json

config_data = {
    "shop_name": "PACA - TINY COZY BAR",
    "shop_address": "5A (10-1) Pasteur, TP. Đà Lạt",
    "shop_phone": "09xx xxx xxx",
    "shop_open_hours": "16:00 - 23:00 Hàng Ngày",
    "welcome_quote": "Tiny bar, cozy vibes, good stories.",
    "currency": "đ",
    "bank_config": {
        "bank_id": "MB",
        "bank_name": "MBBank (Quân Đội)",
        "account_no": "",
        "account_name": "",
        "template": "compact2"
    },
    "printer_config": {
        "paper_size": "k80",
        "cashier_printer_ip": "192.168.1.200",
        "cashier_printer_port": 9100,
        "kitchen_printer_ip": "192.168.1.201",
        "kitchen_printer_port": 9100,
        "auto_print": False,
        "print_mode": "web_dialog"
    },
    "telegram_config": {
        "bot_token": "",
        "chat_id": "",
        "is_enabled": False
    }
}

tables_data = [
    {"id": "B01", "name": "Bàn 01", "zone": "Trong Nhà", "active": True},
    {"id": "B02", "name": "Bàn 02", "zone": "Trong Nhà", "active": True},
    {"id": "B03", "name": "Bàn 03", "zone": "Trong Nhà", "active": True},
    {"id": "B04", "name": "Bàn 04", "zone": "Trong Nhà", "active": True},
    {"id": "B05", "name": "Bàn 05", "zone": "Trong Nhà", "active": True},
    {"id": "B06", "name": "Bàn 06", "zone": "Trong Nhà", "active": True},
    {"id": "BAR01", "name": "Quầy Bar 01", "zone": "Quầy Bar", "active": True},
    {"id": "BAR02", "name": "Quầy Bar 02", "zone": "Quầy Bar", "active": True},
    {"id": "BAR03", "name": "Quầy Bar 03", "zone": "Quầy Bar", "active": True},
    {"id": "BAR04", "name": "Quầy Bar 04", "zone": "Quầy Bar", "active": True},
    {"id": "BAR05", "name": "Quầy Bar 05", "zone": "Quầy Bar", "active": True},
    {"id": "V01", "name": "Vườn 01", "zone": "Sân Vườn", "active": True},
    {"id": "V02", "name": "Vườn 02", "zone": "Sân Vườn", "active": True},
    {"id": "V03", "name": "Vườn 03", "zone": "Sân Vườn", "active": True}
]

with open(r'D:\paca\data\config.json', 'w', encoding='utf-8') as f:
    json.dump(config_data, f, ensure_ascii=False, indent=2)

with open(r'D:\paca\data\tables.json', 'w', encoding='utf-8') as f:
    json.dump(tables_data, f, ensure_ascii=False, indent=2)

print("Created config.json and tables.json successfully.")
