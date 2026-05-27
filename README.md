# 🌌 Interactive Celebration Template

A high-performance, interactive, and beautifully designed web application template created for special occasions and celebrations. Built with Vanilla JavaScript, HTML5 Canvas, and advanced CSS3, this project delivers a highly immersive user experience without relying on heavy frontend frameworks.

## ✨ Features

- **Interactive Constellation Lock-Screen**: A custom HTML5 Canvas-based interactive puzzle that requires the user to connect the stars to unlock the main site.
- **Advanced 3D Holographic Cards**: Vanilla JavaScript physics to create 3D tilt-effects and glare for interactive UI elements tracking mouse movements.
- **High-Performance Canvas Animations**: Includes custom-built engines for rendering Fireworks, Shooting Stars, and a 3D Photo Sphere using optimized `requestAnimationFrame` loops.
- **Custom Web Audio Visualizer**: A built-in music player that visualizes audio frequencies in real-time.
- **Fairy-Dust Custom Cursor**: A custom DOM-based interactive cursor that leaves a trailing particle effect, highly optimized to prevent layout thrashing and FPS drops.
- **Fluid & Dynamic Layouts**: Fully responsive design with glassmorphism aesthetics, utilizing dynamic CSS variables and flexbox/grid architectures.
- **Specialized Interactive Modules**: Includes a Memory Journal, Quiz/Hunt game, and a Multiverse Travel explorer for gamified user engagement.

## 🚀 Tech Stack

- **Frontend**: HTML5, CSS3 (Glassmorphism, Animations, Variables), Vanilla JavaScript (ES6+).
- **Graphics & Rendering**: HTML5 `<canvas>` API, CSS 3D Transforms.
- **Performance Optimization**: `requestAnimationFrame` throttling, garbage collection management for particles, minimal DOM repaints.
- **Deployment**: Configured for seamless deployment on static hosting platforms like GitHub Pages, Vercel, or Netlify.

## 🛠 Installation & Usage

1. Clone the repository to your local machine.
2. Replace the placeholder images in the `pics/` directory with your own.
3. Modify the customizable text arrays in `avatars.js`, `script.js`, and HTML files to personalize the experience.
4. Serve locally using any basic HTTP server (e.g., VS Code Live Server or Python's `http.server`).

---

## 💼 Resume Bullet Points

*If you are adding this project to your software engineering resume, consider using the following bullet points to highlight your technical accomplishments:*

* **Developed a high-performance interactive web application** using Vanilla JavaScript and HTML5 Canvas, achieving smooth 60fps rendering for complex particle systems (fireworks, shooting stars) through optimized `requestAnimationFrame` lifecycle management.
* **Engineered a custom DOM-based interactive cursor and 3D holographic tilt-cards** utilizing advanced CSS3 math functions and JavaScript event throttling to prevent layout thrashing and minimize CPU overhead.
* **Built an interactive gamified user experience** featuring a constellation lock-screen puzzle, an integrated Web Audio API visualizer, and a responsive glassmorphism UI architecture without reliance on external UI frameworks.
* **Optimized rendering pipelines** by eliminating expensive CSS `backdrop-filter` overlaps and managing object pooling for particle animations, significantly improving time-to-interactive and GPU performance on lower-end devices.
