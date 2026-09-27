import json

template = {
    "version": "1.0",
    "title": "PACA 2025 Online Menu Poster",
    "baseWidth": 800,
    "pages": [
        # PAGE 1: COVER
        {
            "id": "page_cover",
            "title": "Trang Mở Đầu",
            "width": 800,
            "height": 900,
            "bg": "#6d100c",
            "bgImage": "assets/canva/a353b44b4ccd31adfc7f396cd09c4e6d.jpg",
            "bgOverlay": "rgba(109, 16, 12, 0.82)",
            "elements": [
                {
                    "id": "cov_star1",
                    "type": "text",
                    "x": 120, "y": 90, "w": 40, "h": 40, "rotate": 0, "zIndex": 2,
                    "props": { "text": "✦", "size": 36, "color": "#f6dcaf" }
                },
                {
                    "id": "cov_star2",
                    "type": "text",
                    "x": 640, "y": 140, "w": 40, "h": 40, "rotate": 0, "zIndex": 2,
                    "props": { "text": "✦", "size": 28, "color": "#f6dcaf" }
                },
                {
                    "id": "cov_title",
                    "type": "text",
                    "x": 80, "y": 70, "w": 640, "h": 70, "rotate": 0, "zIndex": 3,
                    "props": { "text": "PACA", "font": "Playfair Display", "size": 52, "weight": "900", "color": "#f6dcaf", "align": "center", "letterSpacing": 6 }
                },
                {
                    "id": "cov_subtitle",
                    "type": "text",
                    "x": 80, "y": 140, "w": 640, "h": 30, "rotate": 0, "zIndex": 3,
                    "props": { "text": "TINY COZY BAR IN THE HEART OF DALAT", "size": 13, "weight": "700", "color": "#ffffff", "align": "center", "letterSpacing": 2 }
                },
                # Nav links
                {
                    "id": "nav_link_1",
                    "type": "link_nav",
                    "x": 150, "y": 240, "w": 500, "h": 50, "rotate": 0, "zIndex": 3,
                    "props": { "text": "MENU OF THE WEEK", "targetPageId": "page_week", "size": 32, "weight": "800", "color": "#ffffff", "align": "center", "underline": True, "icon": "🍸" }
                },
                {
                    "id": "nav_link_2",
                    "type": "link_nav",
                    "x": 200, "y": 340, "w": 400, "h": 50, "rotate": 0, "zIndex": 3,
                    "props": { "text": "BITES", "targetPageId": "page_bites", "size": 32, "weight": "800", "color": "#ffffff", "align": "center", "underline": True, "icon": "🍟" }
                },
                {
                    "id": "nav_link_3",
                    "type": "link_nav",
                    "x": 200, "y": 440, "w": 400, "h": 50, "rotate": 0, "zIndex": 3,
                    "props": { "text": "COCKTAIL", "targetPageId": "page_cocktail", "size": 32, "weight": "800", "color": "#ffffff", "align": "center", "underline": True, "icon": "🍹" }
                },
                {
                    "id": "nav_link_4",
                    "type": "link_nav",
                    "x": 120, "y": 540, "w": 560, "h": 50, "rotate": 0, "zIndex": 3,
                    "props": { "text": "BEER (Craft Beer & Bottle)", "targetPageId": "page_beer", "size": 30, "weight": "800", "color": "#ffffff", "align": "center", "underline": True, "icon": "🍺" }
                },
                {
                    "id": "nav_link_5",
                    "type": "link_nav",
                    "x": 200, "y": 640, "w": 400, "h": 50, "rotate": 0, "zIndex": 3,
                    "props": { "text": "WINE", "targetPageId": "page_beer", "size": 32, "weight": "800", "color": "#ffffff", "align": "center", "underline": True, "icon": "🍷" }
                },
                {
                    "id": "cov_quote",
                    "type": "text",
                    "x": 100, "y": 790, "w": 600, "h": 40, "rotate": 0, "zIndex": 3,
                    "props": { "text": "First come, first served. Everyone’s welcome. Always.", "size": 15, "weight": "600", "color": "#f6dcaf", "align": "center", "italic": True }
                }
            ]
        },

        # PAGE 2: INTRO
        {
            "id": "page_intro",
            "title": "Lời Chào & Giới Thiệu",
            "width": 800,
            "height": 780,
            "bg": "#f6dcaf",
            "elements": [
                {
                    "id": "intro_logo",
                    "type": "text",
                    "x": 200, "y": 40, "w": 400, "h": 120, "rotate": 0, "zIndex": 2,
                    "props": { "text": "paca", "font": "Playfair Display", "size": 96, "weight": "900", "color": "#10234d", "align": "center" }
                },
                {
                    "id": "intro_text_en",
                    "type": "text",
                    "x": 100, "y": 180, "w": 600, "h": 120, "rotate": 0, "zIndex": 2,
                    "props": {
                        "text": "Hey there — welcome to our tiny, cozy bar in the heart of Đà Lạt!\nWe’re all about good drinks, good vibes, and swapping stories.\nFrom signature cocktails to rotating craft beers and tasty bites, we’ve got just enough to keep things fun and flavorful.",
                        "size": 16, "weight": "500", "color": "#10234d", "align": "center", "lineSpacing": 1.5
                    }
                },
                {
                    "id": "intro_text_vi",
                    "type": "text",
                    "x": 100, "y": 320, "w": 600, "h": 130, "rotate": 0, "zIndex": 2,
                    "props": {
                        "text": "Hi, thiệt vui khi bạn ghé thăm khu vườn phức hợp bé xíu của tụi mình.\nTụi mình có đủ từ mocktail ngon muốn xỉu, cocktail riêng khiến bạn gật gù, tới bia craft on-tap thay đổi theo mùa.\nThêm vài món nhâm nhi vui miệng — đủ cho một buổi gặp gỡ chill chill, rôm rả.\nAi cũng được chào đón. Tới trước có chỗ trước nha.",
                        "size": 15, "weight": "600", "color": "#10234d", "align": "center", "lineSpacing": 1.5
                    }
                },
                # Blue callout block
                {
                    "id": "intro_callout_box",
                    "type": "shape",
                    "x": 120, "y": 500, "w": 560, "h": 130, "rotate": 0, "zIndex": 2,
                    "props": { "shapeType": "rect", "fill": "#afd8f8", "border": "2px solid #10234d", "radius": 16, "shadow": "4px 4px 0px #10234d" }
                },
                {
                    "id": "intro_callout_text",
                    "type": "text",
                    "x": 140, "y": 525, "w": 520, "h": 80, "rotate": 0, "zIndex": 3,
                    "props": {
                        "text": "Our cocktails are carefully crafted by a single bartender, so good things might take a little time.\nThanks for your patience.",
                        "size": 16, "weight": "700", "color": "#10234d", "align": "center", "lineSpacing": 1.4
                    }
                },
                {
                    "id": "intro_star_dec",
                    "type": "text",
                    "x": 630, "y": 485, "w": 40, "h": 40, "rotate": 12, "zIndex": 4,
                    "props": { "text": "✦", "size": 32, "color": "#ce1126" }
                }
            ]
        },

        # PAGE 3: MENU OF THE WEEK
        {
            "id": "page_week",
            "title": "Menu of the Week",
            "width": 800,
            "height": 1750,
            "bg": "#f6dcaf",
            "elements": [
                {
                    "id": "week_title",
                    "type": "text",
                    "x": 80, "y": 40, "w": 640, "h": 70, "rotate": 0, "zIndex": 2,
                    "props": { "text": "MENU OF THE WEEK", "size": 52, "weight": "900", "color": "#ce1126", "align": "center", "letterSpacing": 2 }
                },
                {
                    "id": "week_badge",
                    "type": "shape",
                    "x": 260, "y": 120, "w": 280, "h": 36, "rotate": 0, "zIndex": 2,
                    "props": { "shapeType": "rect", "fill": "#afd8f8", "border": "2px solid #10234d", "radius": 18, "shadow": "3px 3px 0px #10234d" }
                },
                {
                    "id": "week_badge_text",
                    "type": "text",
                    "x": 270, "y": 127, "w": 260, "h": 24, "rotate": 0, "zIndex": 3,
                    "props": { "text": "ALL COCKTAILS -10K FROM ROUND 2", "size": 11, "weight": "800", "color": "#10234d", "align": "center" }
                },

                # Row 1: SCARLET BLOOM (w01 - Red) & ASTRAL STAR (w02 - Navy)
                {
                    "id": "card_w01",
                    "type": "product_card",
                    "x": 30, "y": 180, "w": 355, "h": 280, "rotate": 0, "zIndex": 2,
                    "binding": { "productId": "w01", "action": "open_modal" },
                    "props": {
                        "bg": "#940b05", "color": "#ffffff", "border": "2px solid #10234d", "shadow": "4px 4px 0px #10234d",
                        "title": "SCARLET BLOOM", "price": "180", "badge": "Signature",
                        "ingredients": "Tequila • Lychee Cordial • Campari • Choco Bitter • Sour Water",
                        "desc_en": "A striking balance of vibrant tequila and bittersweet Campari, softened by sweet lychee notes.",
                        "desc_vi": "Tequila và Campari đắng nhẹ, cân bằng bởi vị vải ngọt thanh và hương hoa dịu nhẹ."
                    }
                },
                {
                    "id": "card_w02",
                    "type": "product_card",
                    "x": 415, "y": 180, "w": 355, "h": 280, "rotate": 0, "zIndex": 2,
                    "binding": { "productId": "w02", "action": "open_modal" },
                    "props": {
                        "bg": "#10234d", "color": "#ffffff", "border": "2px solid #10234d", "shadow": "4px 4px 0px #10234d",
                        "title": "ASTRAL STAR", "price": "180", "badge": "Refreshing",
                        "ingredients": "Gin • Home-made Limecello • Starfruit Cordial • Juniper Liqueur",
                        "desc_en": "A crisp, botanical fusion of classic gin and refreshing starfruit, brightened with zesty limecello.",
                        "desc_vi": "Gin thảo mộc tươi mát kết hợp cùng cordial khế và limecello chua thanh sảng khoái."
                    }
                },

                # Row 2: HOP & PEAR (w03 - Navy) & NOCTURNE CACAO (w04 - Red)
                {
                    "id": "card_w03",
                    "type": "product_card",
                    "x": 30, "y": 480, "w": 355, "h": 280, "rotate": 0, "zIndex": 2,
                    "binding": { "productId": "w03", "action": "open_modal" },
                    "props": {
                        "bg": "#10234d", "color": "#ffffff", "border": "2px solid #10234d", "shadow": "4px 4px 0px #10234d",
                        "title": "HOP & PEAR", "price": "180", "badge": "Highball",
                        "ingredients": "Whisky • Pear Cordial • Soda",
                        "desc_en": "A light, effervescent whiskey highball infused with sweet pear cordial and a lively fizzy finish.",
                        "desc_vi": "Thanh nhẹ, bừng sáng vị lê ngọt dịu quyện cùng whisky và sủi bọt soda đã miệng."
                    }
                },
                {
                    "id": "card_w04",
                    "type": "product_card",
                    "x": 415, "y": 480, "w": 355, "h": 280, "rotate": 0, "zIndex": 2,
                    "binding": { "productId": "w04", "action": "open_modal" },
                    "props": {
                        "bg": "#940b05", "color": "#ffffff", "border": "2px solid #10234d", "shadow": "4px 4px 0px #10234d",
                        "title": "NOCTURNE CACAO", "price": "180", "badge": "Nightcap",
                        "ingredients": "Gin • Coffee Liqueur • Cherry Cordial • Orangecello",
                        "desc_en": "A sophisticated nightcap blending sharp gin, rich coffee, and bright citrus with sweet cherry.",
                        "desc_vi": "Cà phê đắng nhẹ quyện cùng gin, vị cam tươi và anh đào mọng nước cho đêm sâu lắng."
                    }
                },

                # Row 3: COLD DRIFT (w05 - Red) & HEATWAVE GOLD (w06 - Navy)
                {
                    "id": "card_w05",
                    "type": "product_card",
                    "x": 30, "y": 780, "w": 355, "h": 280, "rotate": 0, "zIndex": 2,
                    "binding": { "productId": "w05", "action": "open_modal" },
                    "props": {
                        "bg": "#940b05", "color": "#ffffff", "border": "2px solid #10234d", "shadow": "4px 4px 0px #10234d",
                        "title": "COLD DRIFT", "price": "180", "badge": "Easy Sip",
                        "ingredients": "Rum • Apple Cordial • Home-made Lemoncello",
                        "desc_en": "A refreshing, citrus-forward rum mix driven by crisp green apple and bright lemoncello.",
                        "desc_vi": "Rum mượt mà hòa cùng vị táo xanh giòn ngọt và lemoncello chua mát, cực dễ uống."
                    }
                },
                {
                    "id": "card_w06",
                    "type": "product_card",
                    "x": 415, "y": 780, "w": 355, "h": 280, "rotate": 0, "zIndex": 2,
                    "binding": { "productId": "w06", "action": "open_modal" },
                    "props": {
                        "bg": "#10234d", "color": "#ffffff", "border": "2px solid #10234d", "shadow": "4px 4px 0px #10234d",
                        "title": "HEATWAVE GOLD", "price": "180", "badge": "Tropical & Spicy",
                        "ingredients": "Whiskey • Mango Cordial • Spicy Bitter",
                        "desc_en": "A tropical, vibrant whiskey cocktail featuring juicy mango cordial balanced by a warm spicy kick.",
                        "desc_vi": "Vị xoài nhiệt đới chín mọng trên nền whisky, nhấn nhá chút cay nồng kích thích."
                    }
                },

                # Row 4: VELVET BANANE (w07 - Navy) & SILK SONIC (w08 - Red)
                {
                    "id": "card_w07",
                    "type": "product_card",
                    "x": 30, "y": 1080, "w": 355, "h": 280, "rotate": 0, "zIndex": 2,
                    "binding": { "productId": "w07", "action": "open_modal" },
                    "props": {
                        "bg": "#10234d", "color": "#ffffff", "border": "2px solid #10234d", "shadow": "4px 4px 0px #10234d",
                        "title": "VELVET BANANE", "price": "180", "badge": "Creamy & Tart",
                        "ingredients": "Whisky • Banana Liqueur • Cranberry Soda",
                        "desc_en": "A playful yet refined blend of smooth whisky, rich banana liqueur, and tart cranberry soda.",
                        "desc_vi": "Biến tấu giữa whisky, chuối béo dịu và cranberry soda chua nhẹ sủi bọt."
                    }
                },
                {
                    "id": "card_w08",
                    "type": "product_card",
                    "x": 415, "y": 1080, "w": 355, "h": 280, "rotate": 0, "zIndex": 2,
                    "binding": { "productId": "w08", "action": "open_modal" },
                    "props": {
                        "bg": "#940b05", "color": "#ffffff", "border": "2px solid #10234d", "shadow": "4px 4px 0px #10234d",
                        "title": "SILK SONIC", "price": "180", "badge": "Crisp G&T",
                        "ingredients": "Gin • Pear Cordial • Lemoncello • Tonic",
                        "desc_en": "A crisp, effervescent twist on Gin & Tonic, combining sweet pear with bright lemoncello.",
                        "desc_vi": "Biến tấu Gin & Tonic kinh điển, hòa quyện vị lê ngọt dịu cùng lemoncello mát lạnh."
                    }
                },

                # Row 5: ONYX (w09 - Red) & BOTANICAL FLORA (w10 - Navy)
                {
                    "id": "card_w09",
                    "type": "product_card",
                    "x": 30, "y": 1380, "w": 355, "h": 280, "rotate": 0, "zIndex": 2,
                    "binding": { "productId": "w09", "action": "open_modal" },
                    "props": {
                        "bg": "#940b05", "color": "#ffffff", "border": "2px solid #10234d", "shadow": "4px 4px 0px #10234d",
                        "title": "ONYX", "price": "180", "badge": "Spirit-Forward",
                        "ingredients": "Aged Whisky • Cacao Liqueur • Cardamom Liqueur",
                        "desc_en": "A bold blend of aged whiskies and dark cacao, deepened with homemade cardamom.",
                        "desc_vi": "Whisky đậm đà hòa quyện cacao đắng nhẹ, thảo mộc bạch đậu khấu hậu vị khói êm."
                    }
                },
                {
                    "id": "card_w10",
                    "type": "product_card",
                    "x": 415, "y": 1380, "w": 355, "h": 280, "rotate": 0, "zIndex": 2,
                    "binding": { "productId": "w10", "action": "open_modal" },
                    "props": {
                        "bg": "#10234d", "color": "#ffffff", "border": "2px solid #10234d", "shadow": "4px 4px 0px #10234d",
                        "title": "BOTANICAL FLORA", "price": "180", "badge": "Dry & Elegant",
                        "ingredients": "Gin • White Wine • Home-made Lemoncello",
                        "desc_en": "An elegant, dry aperitif pairing aromatic gin with home-made lemoncello and crisp white wine.",
                        "desc_vi": "Thanh lịch và khô nhẹ, kết hợp gin thảo mộc, vang trắng cùng lemoncello thơm ngát."
                    }
                }
            ]
        },

        # PAGE 4: BITES & SNACKS
        {
            "id": "page_bites",
            "title": "Món Nhắm (Bites)",
            "width": 800,
            "height": 1300,
            "bg": "#f6dcaf",
            "elements": [
                {
                    "id": "bites_title",
                    "type": "text",
                    "x": 80, "y": 40, "w": 640, "h": 70, "rotate": 0, "zIndex": 2,
                    "props": { "text": "BITES", "size": 56, "weight": "900", "color": "#ce1126", "align": "center", "letterSpacing": 3 }
                },
                {
                    "id": "bites_sub",
                    "type": "text",
                    "x": 100, "y": 115, "w": 600, "h": 30, "rotate": 0, "zIndex": 2,
                    "props": { "text": "Món nhâm nhi vui miệng cho buổi gặp gỡ chill chill", "size": 15, "weight": "600", "color": "#10234d", "align": "center" }
                },
                # Món 1: Khoai tây mắm tỏi
                {
                    "id": "bite_card_1",
                    "type": "product_card",
                    "x": 30, "y": 170, "w": 355, "h": 220, "rotate": 0, "zIndex": 2,
                    "binding": { "productId": "b01", "action": "open_modal" },
                    "props": {
                        "bg": "#ffffff", "color": "#10234d", "border": "2px solid #10234d", "shadow": "4px 4px 0px #10234d",
                        "title": "FRENCH FRIES GARLIC FISH SAUCE", "name_vi": "Khoai tây chiên xốc mắm tỏi", "price": "70", "badge": "Best Seller",
                        "desc_vi": "Khoai tây chiên vàng giòn ráo dầu xốc nước mắm tỏi thơm lừng, đậm đà bắt vị."
                    }
                },
                # Món 2: Khoai tây bacon phô mai
                {
                    "id": "bite_card_2",
                    "type": "product_card",
                    "x": 415, "y": 170, "w": 355, "h": 220, "rotate": 0, "zIndex": 2,
                    "binding": { "productId": "b02", "action": "open_modal" },
                    "props": {
                        "bg": "#ffffff", "color": "#10234d", "border": "2px solid #10234d", "shadow": "4px 4px 0px #10234d",
                        "title": "FRIES WITH BACON & CHEESE", "name_vi": "Khoai tây chiên bacon & phô mai", "price": "95", "badge": "Loaded",
                        "desc_vi": "Khoai chiên ngập sốt cheddar phô mai béo ngậy cùng vụn thịt bacon xông khói giòn rụm."
                    }
                },
                # Món 3: Gà viên sốt cay phủ phô mai (Có biến thể Size M / Size L)
                {
                    "id": "bite_card_3",
                    "type": "product_card",
                    "x": 30, "y": 420, "w": 740, "h": 250, "rotate": 0, "zIndex": 2,
                    "binding": { "productId": "b08", "action": "open_modal" },
                    "props": {
                        "bg": "#940b05", "color": "#ffffff", "border": "2px solid #10234d", "shadow": "4px 4px 0px #10234d",
                        "title": "POPCORN CHICKEN + SWEET SPICY SAUCE + MELTED CHEESE", "name_vi": "GÀ VIÊN SỐT CAY PHỦ PHÔ MAI",
                        "price": "95", "badge": "Size M 95k • Size L 125k • Extra Cheese +30k",
                        "desc_vi": "Gà viên chiên giòn tan ngập trong sốt cay ngọt Hàn Quốc, phủ lớp phô mai Mozzarella dẻo dai kéo sợi nóng hổi."
                    }
                },
                # Món 4: Nui chiên giòn phô mai
                {
                    "id": "bite_card_4",
                    "type": "product_card",
                    "x": 30, "y": 700, "w": 355, "h": 220, "rotate": 0, "zIndex": 2,
                    "binding": { "productId": "b06", "action": "open_modal" },
                    "props": {
                        "bg": "#ffffff", "color": "#10234d", "border": "2px solid #10234d", "shadow": "4px 4px 0px #10234d",
                        "title": "CRISPY FRIED MACARONI & CHEESE", "name_vi": "Nui chiên giòn phô mai", "price": "55", "badge": "Crunchy",
                        "desc_vi": "Nui chiên giòn rụm xốc bột phô mai mặn ngọt béo thơm, món nhắm nhâm nhi bia rượu cực dính."
                    }
                },
                # Món 5: Hoành thánh chiên
                {
                    "id": "bite_card_5",
                    "type": "product_card",
                    "x": 415, "y": 700, "w": 355, "h": 220, "rotate": 0, "zIndex": 2,
                    "binding": { "productId": "b07", "action": "open_modal" },
                    "props": {
                        "bg": "#ffffff", "color": "#10234d", "border": "2px solid #10234d", "shadow": "4px 4px 0px #10234d",
                        "title": "FRIED WONTON CHIPS", "name_vi": "Lá hoành thánh chiên giòn", "price": "50", "badge": "Snack",
                        "desc_vi": "Lá hoành thánh tươi chiên phồng hổ phách giòn tan, chấm sốt xí muội chua ngọt."
                    }
                },
                # Món 6: Khoai tây sốt kem hành
                {
                    "id": "bite_card_6",
                    "type": "product_card",
                    "x": 30, "y": 950, "w": 355, "h": 220, "rotate": 0, "zIndex": 2,
                    "binding": { "productId": "b05", "action": "open_modal" },
                    "props": {
                        "bg": "#ffffff", "color": "#10234d", "border": "2px solid #10234d", "shadow": "4px 4px 0px #10234d",
                        "title": "FRIES WITH CREAMY ONION SAUCE", "name_vi": "Khoai tây sốt kem hành", "price": "85", "badge": "Chef Twist",
                        "desc_vi": "Khoai tây cọng giòn rưới sốt sour cream & hành tây tươi béo thanh ngậy mát."
                    }
                },
                # Món 7: Khoai tây truyền thống
                {
                    "id": "bite_card_7",
                    "type": "product_card",
                    "x": 415, "y": 950, "w": 355, "h": 220, "rotate": 0, "zIndex": 2,
                    "binding": { "productId": "b04", "action": "open_modal" },
                    "props": {
                        "bg": "#ffffff", "color": "#10234d", "border": "2px solid #10234d", "shadow": "4px 4px 0px #10234d",
                        "title": "FRENCH FRIES CLASSIC", "name_vi": "Khoai tây cọng chiên giòn", "price": "55", "badge": "Classic",
                        "desc_vi": "Khoai tây chiên muối tiêu truyền thống, giòn rụm ráo dầu chấm tương ớt."
                    }
                }
            ]
        },

        # PAGE 5: FOOTER & SOCIAL
        {
            "id": "page_footer",
            "title": "Chân Trang & Thông Tin",
            "width": 800,
            "height": 450,
            "bg": "#10234d",
            "elements": [
                {
                    "id": "foo_logo",
                    "type": "text",
                    "x": 200, "y": 40, "w": 400, "h": 70, "rotate": 0, "zIndex": 2,
                    "props": { "text": "PACA", "font": "Playfair Display", "size": 48, "weight": "900", "color": "#f6dcaf", "align": "center", "letterSpacing": 4 }
                },
                {
                    "id": "foo_hours",
                    "type": "text",
                    "x": 100, "y": 130, "w": 600, "h": 40, "rotate": 0, "zIndex": 2,
                    "props": { "text": "OPEN DAILY • 4:00 PM - 11:00 PM", "size": 16, "weight": "800", "color": "#ffffff", "align": "center", "letterSpacing": 2 }
                },
                {
                    "id": "foo_address",
                    "type": "text",
                    "x": 100, "y": 180, "w": 600, "h": 40, "rotate": 0, "zIndex": 2,
                    "props": { "text": "5A (10-1) Pasteur, Đà Lạt (Inside EM Koffie)", "size": 14, "weight": "500", "color": "#afd8f8", "align": "center" }
                },
                {
                    "id": "foo_slogan",
                    "type": "text",
                    "x": 100, "y": 250, "w": 600, "h": 40, "rotate": 0, "zIndex": 2,
                    "props": { "text": "Tiny bar, cozy vibes, good stories.", "size": 15, "weight": "600", "color": "#f6dcaf", "align": "center", "italic": True }
                },
                {
                    "id": "foo_copy",
                    "type": "text",
                    "x": 100, "y": 360, "w": 600, "h": 30, "rotate": 0, "zIndex": 2,
                    "props": { "text": "© 2025 PACA BAR • All rights reserved.", "size": 11, "weight": "400", "color": "#64748b", "align": "center" }
                }
            ]
        }
    ]
}

with open(r'D:\paca\data\default_canvas_template.json', 'w', encoding='utf-8') as f:
    json.dump(template, f, ensure_ascii=False, indent=2)

print("Created data/default_canvas_template.json with", len(template["pages"]), "pages.")
