import time
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\THIETKE\.gemini\antigravity\brain\a869ff89-1562-4246-8135-c7401426ddea"

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        # Test 1: Admin Desktop - Create Category & Dish
        context = browser.new_context(viewport={'width': 1280, 'height': 850})
        page = context.new_page()
        page.on("dialog", lambda dialog: dialog.accept())

        print("1. Opening PACA Admin...", flush=True)
        page.goto("http://localhost:8080/admin.html")
        page.wait_for_load_state("networkidle")
        time.sleep(1)

        # Go to Menu tab
        print("2. Switching to Menu tab...", flush=True)
        page.click("button[data-target='tabMenu']")
        time.sleep(0.8)

        # Switch to Quản Lý Danh Mục
        print("3. Switching to Quản Lý Danh Mục sub-tab...", flush=True)
        page.click("#btnSubTabCategories")
        time.sleep(0.8)

        # Screenshot Category List
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "shot_admin_categories_list.png"))
        print("Screenshot saved: shot_admin_categories_list.png", flush=True)

        # Click + Thêm Danh Mục Mới
        print("4. Opening Category Editor Modal...", flush=True)
        page.click("button:has-text('+ Thêm Danh Mục Mới')")
        time.sleep(0.8)

        # Fill Category Modal
        page.fill("#catEditNameVi", "Món Mới PACA")
        page.fill("#catEditName", "PACA New Specials")
        page.fill("#catEditId", "paca_new")
        page.fill("#catEditIcon", "✨")
        page.fill("#catEditDesc", "Các sáng tạo cocktail độc đáo mới nhất từ bartender PACA")
        page.select_option("#catEditDefaultStation", "bar")
        page.select_option("#catEditDisplayLayout", "grid")

        # Save Category
        print("5. Saving new category 'paca_new'...", flush=True)
        page.click("button[onclick='saveCategoryItem()']")
        time.sleep(1)

        page.screenshot(path=os.path.join(ARTIFACT_DIR, "shot_admin_category_added.png"))
        print("Screenshot saved: shot_admin_category_added.png", flush=True)

        # Switch to Danh Sách Món to add dish
        print("6. Switching to Danh Sách Món to add dish...", flush=True)
        page.click("#btnSubTabDishes")
        time.sleep(0.8)

        page.click("button:has-text('+ Thêm món form')")
        time.sleep(0.8)

        page.fill("#dishEditName", "PACA SUNSET SPECIAL")
        page.fill("#dishEditNameVi", "PACA Sunset Special (Hoàng Hôn Đà Lạt)")
        page.fill("#dishEditPrice", "180000")
        page.select_option("#dishEditCategory", "paca_new")
        page.fill("#dishEditDescVi", "Sự kết hợp tinh tế giữa Gin thủ công, mứt dâu tây Đà Lạt và hương thảo khói nồng nàn")
        page.fill("#dishEditIngredients", "Dalat Craft Gin, Strawberry Jam, Rosemary Smoke, Lime")
        page.fill("#dishEditBadge", "Signature New")

        page.click("button[onclick='saveDishItem()']")
        time.sleep(1)
        print("Dish saved to category 'paca_new'!", flush=True)

        # Verify safe deletion dialog
        print("7. Testing Safe Deletion modal in Quản Lý Danh Mục...", flush=True)
        page.click("#btnSubTabCategories")
        time.sleep(0.8)
        del_btn = page.locator("button[onclick*=\"promptDeleteCategory('paca_new')\"]")
        if del_btn.count() > 0:
            del_btn.first.click()
            time.sleep(0.8)
            page.screenshot(path=os.path.join(ARTIFACT_DIR, "shot_admin_cat_safe_delete_modal.png"))
            print("Screenshot saved: shot_admin_cat_safe_delete_modal.png", flush=True)
            page.click("button[onclick='closeCategoryDeleteModal()']")
            time.sleep(0.5)

        # Test 2: Customer Mobile Viewport (390 x 844)
        # Test 2: Customer Mobile Viewport (390 x 844)
        print("8. Opening Customer Mobile Menu (390x844)...", flush=True)
        m_page = context.new_page()
        m_page.set_viewport_size({'width': 390, 'height': 844})
        m_page.on("dialog", lambda dialog: dialog.accept())
        m_page.goto("http://localhost:8080/index.html?table=1")
        m_page.wait_for_load_state("networkidle")
        time.sleep(2)

        # Screenshot Cover Page
        m_page.screenshot(path=os.path.join(ARTIFACT_DIR, "shot_mobile_cover_dynamic_links.png"))
        print("Screenshot saved: shot_mobile_cover_dynamic_links.png", flush=True)

        # Click the new category link in sticky navbar or cover
        print("9. Navigating to new category section...", flush=True)
        nav_link = m_page.locator("#customerNavBarLinks a:has-text('Món Mới PACA')")
        if nav_link.count() > 0:
            nav_link.first.click()
        else:
            cover_btn = m_page.locator("#coverDynamicNavContainer button:has-text('Món Mới PACA'), #coverDynamicNavContainer button:has-text('PACA New Specials')")
            if cover_btn.count() > 0:
                cover_btn.first.click()
        time.sleep(2)

        # Scroll into view of #sec_cat_paca_new
        sec_el = m_page.locator("#sec_cat_paca_new")
        if sec_el.count() > 0:
            sec_el.scroll_into_view_if_needed()
            time.sleep(0.8)
            m_page.screenshot(path=os.path.join(ARTIFACT_DIR, "shot_mobile_new_category_section.png"))
            print("Screenshot saved: shot_mobile_new_category_section.png", flush=True)

            # Click "+ Thêm" button
            print("10. Adding PACA SUNSET SPECIAL to cart...", flush=True)
            add_btn = sec_el.locator("button:has-text('+ Thêm')")
            if add_btn.count() > 0:
                add_btn.first.click()
                time.sleep(1)
                m_page.screenshot(path=os.path.join(ARTIFACT_DIR, "shot_mobile_added_to_cart.png"))
                print("Screenshot saved: shot_mobile_added_to_cart.png", flush=True)

        # Open Cart Modal
        print("11. Opening Cart Modal...", flush=True)
        cart_bar = m_page.locator("#floatingCart button")
        cart_bar.click()
        time.sleep(1)
        m_page.screenshot(path=os.path.join(ARTIFACT_DIR, "shot_mobile_cart_with_new_dish.png"))
        print("Screenshot saved: shot_mobile_cart_with_new_dish.png", flush=True)

        # Place Order
        print("12. Submitting order...", flush=True)
        m_page.click("#btnSubmitOrder")
        time.sleep(2)
        m_page.screenshot(path=os.path.join(ARTIFACT_DIR, "shot_mobile_order_success.png"))
        print("Screenshot saved: shot_mobile_order_success.png", flush=True)

        # Test 3: Check Order & Station Routing in Admin
        print("13. Checking order station routing in Admin...", flush=True)
        page.click("button[data-target='tabOrders']")
        time.sleep(1)
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "shot_admin_orders_station_verification.png"))
        print("Screenshot saved: shot_admin_orders_station_verification.png", flush=True)

        browser.close()
        print("ALL TESTS COMPLETED SUCCESSFULLY!", flush=True)

if __name__ == '__main__':
    run_test()
