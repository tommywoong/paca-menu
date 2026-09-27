import asyncio
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        page.on('console', lambda msg: print('BROWSER CONSOLE:', msg.type, msg.text))
        page.on('pageerror', lambda err: print('BROWSER PAGEERROR:', err))
        await page.goto('http://localhost:8080/admin.html')
        await page.evaluate("switchTab('tabSettings')")
        await page.evaluate("switchBillTemplateEditor('cashier')")
        html_len = await page.evaluate("document.getElementById('billPreviewContainer').innerHTML.length")
        print('billPreviewContainer HTML len:', html_len)
        content = await page.evaluate("document.getElementById('billPreviewContainer').innerText")
        print('billPreviewContainer InnerText:\n', content[:200])
        await browser.close()

asyncio.run(test())
