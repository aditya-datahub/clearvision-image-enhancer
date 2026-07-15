<div align="center">

# 📸 ClearVision

### Browser-Based Image Enhancement Tool

*A Final Year B.Tech (CSE) Group Project*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Made with HTML CSS JS](https://img.shields.io/badge/Made%20with-HTML%20%7C%20CSS%20%7C%20JS-blue)
![Client Side Only](https://img.shields.io/badge/Processing-100%25%20Client--Side-brightgreen)

</div>

---

## 📖 About The Project

**ClearVision** is a browser-based image enhancement tool that runs a complete, professional-grade image processing pipeline **entirely inside your browser** — no backend, no server, no image ever leaves your device.

It applies four classic computer vision / image processing algorithms in sequence to automatically improve any photo: reducing noise, boosting local contrast, sharpening edges, and enriching colours — all computed live using the HTML5 **Canvas API**.

This project was built as our **Final Year B.Tech Computer Science Engineering group project**.

> 🎓 If you're new to this repo — welcome! This README is written to help you understand the project end-to-end without needing to read the code first. Start with [How It Works](#-how-it-works) and [Project Structure](#️-project-structure) below.

---

## ✨ Features

- 🔒 **100% client-side processing** — images are never uploaded anywhere; everything runs in the browser using `getImageData` / `putImageData`
- 🧪 **4-stage enhancement pipeline** applied in a scientifically ordered sequence:
  1. **Bilateral Filter** — edge-preserving noise reduction (*Denoising*)
  2. **CLAHE** (Contrast Limited Adaptive Histogram Equalization) — local contrast improvement (*Contrast*)
  3. **Unsharp Masking (USM)** — edge & detail sharpening (*Sharpening*)
  4. **Saturation Boost** (HSL-based) — richer, more vivid colours (*Colour*)
- 🎚️ **Adjustable Enhancement Strength** — Light / Medium / Max, controlling how aggressively Sharpening & Colour stages apply
- ✅ **Toggle individual algorithms** on/off to see each one's isolated effect
- 🖼️ **Side-by-side view** of original vs enhanced image
- ↔️ **Interactive before/after comparison slider**
- ⬇️ **One-click download** of the enhanced image

---

## 🧠 How It Works

When you click **Enhance Image**, the uploaded photo is drawn onto a hidden canvas, and each *enabled* algorithm is applied in a fixed order — each stage builds on the cleaner/better output of the one before it:

```
Original Image
      │
      ▼
┌─────────────────┐
│ 1. Bilateral      │  Removes noise/grain, but preserves edges
│    Filter         │  (Denoising)
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ 2. CLAHE          │  Improves local contrast in shadows/highlights
│                    │  (Contrast)
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ 3. Unsharp        │  Sharpens edges & fine details
│    Masking         │  (Sharpening)
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ 4. Saturation      │  Makes colours richer & more vivid
│    Boost           │  (Colour)
└─────────────────┘
      │
      ▼
 Enhanced Image
```

| Stage | Algorithm | Fixes | Key Parameter |
|-------|-----------|-------|----------------|
| 1 | Bilateral Filter | Noise / graininess | Spatial radius, colour similarity |
| 2 | CLAHE | Poor/uneven contrast | Tile size, clip limit |
| 3 | Unsharp Masking | Soft/blurry edges | Sharpening amount (varies by strength) |
| 4 | Saturation Boost | Dull colours | Saturation multiplier (varies by strength) |

After all selected stages run, the result is blended slightly with the original image so the final effect looks natural rather than over-processed.

📄 **Want the deep technical details** (exact formulas, why each stage is ordered the way it is, etc.)? See [`docs/PROJECT_NOTES.md`](docs/PROJECT_NOTES.md).

---

## 🗂️ Project Structure

```
clearvision-image-enhancer/
│
├── index.html              # Page structure: upload box, strength selector,
│                            # algorithm toggles, preview area, stats display
│
├── style.css                # All visual styling: layout, colours, toggle
│                            # switches, responsive design
│
├── script.js                 # Application logic: image loading, running the
│                            # enhancement algorithms on canvas, comparison
│                            # slider, download functionality
│
├── docs/
│   └── PROJECT_NOTES.md      # Detailed explanation of every algorithm
│                            # used in the pipeline
│
├── LICENSE                  # MIT License
└── README.md                 # You are here 📍
```

**For newcomers:** if you want to understand the codebase, read files in this order:
1. `index.html` — see what UI elements exist
2. `style.css` — see how they're styled
3. `script.js` — see the logic that ties it together
4. `docs/PROJECT_NOTES.md` — understand *why* the algorithms work the way they do

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Structure | HTML5 |
| Styling | CSS3 (custom properties / CSS variables) |
| Logic | Vanilla JavaScript (no frameworks) |
| Image Processing | HTML5 Canvas API |
| Icons | [Font Awesome](https://fontawesome.com/) |

No build tools, no npm dependencies, no backend — intentionally kept simple and dependency-free.

---

## 🚀 Getting Started

### Prerequisites
Just a modern web browser (Chrome, Firefox, Edge, Safari). No installations needed.

### Option 1 — Just open it
```bash
git clone https://github.com/YOUR_USERNAME/clearvision-image-enhancer.git
cd clearvision-image-enhancer
```
Then double-click `index.html` to open it in your browser.

### Option 2 — Run a local server (recommended, avoids browser file-access restrictions)
```bash
# Using Python
python3 -m http.server 8000
# then visit http://localhost:8000

# OR using Node.js (npx)
npx serve .
```

### How to use the app
1. Upload an image (drag-and-drop or browse)
2. Choose an **Enhancement Strength**: Light / Medium / Max
3. Toggle which algorithms you want in the pipeline
4. Click **Enhance Image**
5. Compare results side-by-side or with the slider
6. Click **Download** to save the enhanced image

---

## 🌐 Live Demo

This project can be hosted for free using **GitHub Pages**:
> Settings → Pages → Branch: `main` → Folder: `/root` → Save

Live link will be:
```
https://YOUR_USERNAME.github.io/clearvision-image-enhancer/
```

---

## 👥 Team

This project was built collaboratively by a team of four as our **Final Year B.Tech CSE Group Project**:

| Name | Role |
|------|------|
| Aditya Sharma | Algorithm Implementation |
| Akash Verma | Frontend / Canvas Pipeline |
| Tarun Masanta | UI/UX Design |
| Souvik Dutta Banik | Testing & Documentation |

---

## 🤝 Contributing

This is an academic project, but suggestions and improvements are welcome:
1. Fork the repo
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit your changes
4. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built as part of our **Final Year B.Tech Computer Science Engineering** curriculum
- Thanks to our project guide/mentor for guidance throughout
- Icons by [Font Awesome](https://fontawesome.com/)

---

<div align="center">
Made with ❤️ by a team of four B.Tech CSE students
</div>
