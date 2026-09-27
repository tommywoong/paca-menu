import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        # 1. MOBILE MENU SCREENSHOTS (iPhone 14: 390x844)
        mobile_context = await browser.new_context(
            viewport={'width': 390, 'height': 844},
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
        )
        page = await mobile_context.new_page()

        # Load menu
        await page.goto('http://localhost:8080/index.html', wait_until='networkidle')
        await page.wait_for_timeout(1000)

        # Capture Cover & Navigation
        await page.screenshot(path='D:/paca/shot_mobile_cover.png')
        print("Captured D:/paca/shot_mobile_cover.png")

        # Scroll to Menu of the Week
        week_section = page.locator('#page_week')
        if await week_section.count() > 0:
            await week_section.scroll_into_view_if_needed()
            await page.wait_for_timeout(500)
            await page.screenshot(path='D:/paca/shot_mobile_week.png')
            print("Captured D:/paca/shot_mobile_week.png")

            # Scroll a bit down to show Velvet Banane (SOLD OUT)
            await page.evaluate("window.scrollBy(0, 450)")
            await page.wait_for_timeout(300)
            await page.screenshot(path='D:/paca/shot_mobile_week_soldout.png')
            print("Captured D:/paca/shot_mobile_week_soldout.png")

        # Scroll to Bites (Món Nhắm)
        bites_section = page.locator('#page_bites')
        if await bites_section.count() > 0:
            await bites_section.scroll_into_view_if_needed()
            await page.wait_for_timeout(500)
            await page.screenshot(path='D:/paca/shot_mobile_bites.png')
            print("Captured D:/paca/shot_mobile_bites.png")

            # Scroll down to show French fries photos
            await page.evaluate("window.scrollBy(0, 350)")
            await page.wait_for_timeout(300)
            await page.screenshot(path='D:/paca/shot_mobile_bites_items.png')
            print("Captured D:/paca/shot_mobile_bites_items.png")

        await mobile_context.close()

        # 2. ADMIN BILL TEMPLATE DESIGNER (Desktop 1200x900)
        admin_context = await browser.new_context(viewport={'width': 1200, 'height': 900})
        admin_page = await admin_context.new_page()
        await admin_page.goto('http://localhost:8080/admin.html', wait_until='networkidle')
        await admin_page.wait_for_timeout(800)

        # Switch to tabSettings
        await admin_page.evaluate("switchTab('tabSettings')")
        await admin_page.wait_for_timeout(500)

        # Scroll into Bill Template Designer
        designer_heading = admin_page.locator("text=Tùy Biến Mẫu Phiếu In Nhiệt")
        if await designer_heading.count() > 0:
            await designer_heading.scroll_into_view_if_needed()
            await admin_page.wait_for_timeout(600)
            await admin_page.screenshot(path='D:/paca/shot_admin_bill_designer.png')
            print("Captured D:/paca/shot_admin_bill_designer.png")

        # Switch to Kitchen template
        await admin_page.evaluate("switchBillTemplateEditor('kitchen')")
        await admin_page.wait_for_timeout(500)
        await admin_page.screenshot(path='D:/paca/shot_admin_bill_kitchen.png')
        print("Captured D:/paca/shot_admin_bill_kitchen.png")

        await admin_context.close()
        await browser.close()
        print("All screenshots successfully captured!")

asyncio.run(main())
