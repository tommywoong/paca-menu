import subprocess
import time
import os

chrome_exe = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

# Helper function to run chrome headless with specific window size and target URL or script
def capture(url, out_png, width=390, height=844):
    cmd = [
        chrome_exe,
        '--headless',
        '--disable-gpu',
        f'--window-size={width},{height}',
        f'--screenshot={out_png}',
        url
    ]
    subprocess.run(cmd, check=True)
    print(f"Captured {out_png}: {os.path.getsize(out_png)} bytes")

# 1. Capture cover page (Mobile 390x844)
capture('http://localhost:8080/index.html', 'D:\\paca\\shot_cover.png', 390, 844)

# 2. Capture Admin page with Bill Template Designer & Live Preview (Desktop 1280x900)
capture('http://localhost:8080/admin.html', 'D:\\paca\\shot_admin.png', 1280, 950)

print("Screenshots taken successfully!")
