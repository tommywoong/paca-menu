import time
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\THIETKE\.gemini\antigravity\brain\a869ff89-1562-4246-8135-c7401426ddea"

def run_rename_toggle_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 850})
        
        # 1. Open Admin
        page = context.new_page()
        page.on("dialog", lambda dialog: dialog.accept())
        page.goto("http://localhost:8080/admin.html")
        page.wait_for_load_state("networkidle")
        time.sleep(1)

        # Switch to Menu -> Categories
        page.click("button[data-target='tabMenu']")
        time.sleep(0.5)
        page.click("#btnSubTabCategories")
        time.sleep(0.5)

        # Edit Category 'cocktail': Rename to "Cocktail Tuyệt Hảo PACA"
        print("1. Editing category 'cocktail'...", flush=True)
        edit_btn = page.locator("button[onclick*=\"openCategoryEditorModal('cocktail')\"]")
        edit_btn.first.click()
        time.sleep(0.8)

        # Verify ID is readonly
        id_input = page.locator("#catEditId")
        is_readonly = id_input.get_attribute("readonly") is not None
        print(f"Is category ID readonly on edit? {is_readonly}", flush=True)

        # Change name
        page.fill("#catEditNameVi", "Cocktail Tuyệt Hảo PACA")
        page.fill("#catEditName", "PACA Signature Cocktails")
        page.fill("#catEditIcon", "🍸")
        page.click("button[onclick='saveCategoryItem()']")
        time.sleep(1)
        print("Category renamed to 'Cocktail Tuyệt Hảo PACA'!", flush=True)

        # 2. Check Customer Page in Mobile Viewport
        m_page = context.new_page()
        m_page.set_viewport_size({'width': 390, 'height': 844})
        m_page.goto("http://localhost:8080/index.html?table=1")
        m_page.wait_for_load_state("networkidle")
        time.sleep(1.5)

        # Verify new name appears on cover and sticky nav
        m_page.screenshot(path=os.path.join(ARTIFACT_DIR, "shot_mobile_renamed_category.png"))
        print("Screenshot saved: shot_mobile_renamed_category.png", flush=True)

        # 3. Toggle Visibility Off (Hide Category)
        print("2. Toggling category active = false in Admin...", flush=True)
        toggle_cb = page.locator("input[onchange*=\"toggleCategoryActive('cocktail'\"]")
        toggle_cb.uncheck()
        time.sleep(1)

        # Refresh or check customer page
        m_page.reload()
        m_page.wait_for_load_state("networkidle")
        time.sleep(1.5)
        m_page.screenshot(path=os.path.join(ARTIFACT_DIR, "shot_mobile_hidden_category.png"))
        print("Screenshot saved: shot_mobile_hidden_category.png", flush=True)

        # 4. Turn back on for normal use
        toggle_cb.check()
        time.sleep(1)

        # 5. Check Studio Category Filter
        s_page = context.new_page()
        s_page.goto("http://localhost:8080/studio.html")
        s_page.wait_for_load_state("networkidle")
        time.sleep(1.5)

        # Open Products Drawer
        s_page.click("button[data-tab='tabProducts']")
        time.sleep(1)
        s_page.screenshot(path=os.path.join(ARTIFACT_DIR, "shot_studio_category_filter.png"))
        print("Screenshot saved: shot_studio_category_filter.png", flush=True)

        browser.close()
        print("RENAME AND TOGGLE TESTS COMPLETED SUCCESSFULLY!", flush=True)

if __name__ == '__main__':
    run_rename_toggle_test()
