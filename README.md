# Mango

A cinematic mango website with a custom Three.js fruit scene, scroll animation, mango history, geography, production countries, and interactive flavor cards.

## Project Structure

```text
Mango/
  index.html
  README.md
  assets/
    .gitkeep
  src/
    js/
      config.js
      interactions.js
      main.js
      scene.js
    styles/
      animations.css
      base.css
      components.css
      layout.css
      main.css
      responsive.css
      tokens.css
```

## Run Locally

Because this site uses JavaScript modules, serve it from a local web server:

```bash
python -m http.server 4173
```

Then open:

```text
http://localhost:4173/
```

## Deploy

This is a static site, so it can be deployed directly to GitHub Pages, Netlify, Vercel, or any static hosting service.

For GitHub Pages, publish the repository root and keep `index.html` at the top level.

## Credits

The 3D mango, nectar particles, and visual effects are built with Three.js through an import map in `index.html`.
