Grade calc — Pure client-side grade calculator

Quick start:
1. Open a terminal in the project folder and run:

```powershell
cd "C:\Users\buynd\OneDrive\Documents\Code\Grade calc"
python -m http.server 8000
```

2. Open http://127.0.0.1:8000 in your browser and use the app.

Features:
- Dynamic fields (Create button)
- Enter-key navigation between fields
- Import/export TXT files (format: grade,weight per line)
- Dark/Light theme toggle
- Mobile-friendly layout and PWA install support

PWA notes:
- On Android/Chrome the browser will prompt to install when criteria are met.
- On iOS install via Share → Add to Home Screen; the app will use the provided apple-touch-icon and name "Grade Calculator".

If you want, I can deploy this to Vercel for you or integrate the existing Grades_project logic into the web app.

Icons (iOS compatibility)
------------------------
Modern iOS expects PNG icons for Add to Home Screen. I updated the manifest and HTML to point to PNG files (`icon-180.png`, `icon-192.png`, `icon-512.png`). To generate these PNGs from the existing SVGs you can use one of the following commands:

ImageMagick (recommended if installed):
```powershell
magick convert static/icon-192.svg -resize 180x180 static/icon-180.png
magick convert static/icon-192.svg -resize 192x192 static/icon-192.png
magick convert static/icon-512.svg -resize 512x512 static/icon-512.png
```

CairoSVG (Python):
```powershell
pip install cairosvg
cairosvg static/icon-192.svg -o static/icon-180.png -w 180 -h 180
cairosvg static/icon-192.svg -o static/icon-192.png -w 192 -h 192
cairosvg static/icon-512.svg -o static/icon-512.png -w 512 -h 512
```

If you want, I can generate these PNGs here for you and add them to the repo. Do you want me to create the PNG files now?

Optimization notes:
- Preload critical CSS and defer JS (already done in `index.html`) to speed initial paint.
- Use the `python -m http.server` trick to test locally; use Lighthouse (DevTools) to audit performance.

Building an iOS app — quick options (free vs paid):
- Web app (PWA): free, works on Android and desktop. iOS supports Add to Home Screen (no App Store) but has limitations (no push notifications, limited background execution).
- TestFlight / App Store: requires Apple Developer Program membership ($99/year) to publish and distribute via TestFlight. There's no official free path to upload native iOS apps to TestFlight without a paid Apple developer account.
- Alternative free options:
	- Use a web wrapper (Cordova/Capacitor) and distribute the web URL; for native App Store distribution you'll still need the Apple Developer account.
	- Use Expo + EAS for building; still requires an Apple Developer account to publish on TestFlight/App Store.

If your goal is free testing on devices, PWA + Add to Home Screen is the most accessible route. If you want native capabilities or App Store distribution, you'll need the paid Apple Developer membership.
