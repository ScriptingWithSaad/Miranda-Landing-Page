# Miranda — Paper Portfolio

A responsive HTML, CSS and JavaScript recreation of Niccolò Miranda's newspaper portfolio. The paper palette, editorial typography and artwork collage remain part of the design.

[View the website](https://scriptingwithsaad.github.io/Miranda-Landing-Page/)

## Layout and interactions

- Fluid layouts for phones, tablets and desktop screens, with readable type and no horizontal page scrolling.
- GSAP opening animation, scroll-linked stamp rotation and subtle section reveals. Desktop wheel scrolling uses Lenis; touch devices keep native scrolling.
- Mobile address-bar height changes and lazy image decoding do not remeasure scroll animations during swipes. Real layout changes refresh after scrolling settles; phone reveals animate smaller text blocks instead of whole tall image columns.
- Stable, keyboard-accessible navigation and artwork previews that fit the visible viewport, including landscape phones.
- Seamless moving contact strip with pause/play controls. Reduced-motion preferences disable nonessential animation.
- Local WebP artwork with responsive sizes, intrinsic dimensions and lazy loading below the fold. Fonts and animation libraries are served locally.

## Local development

From the repository directory, run `python -m http.server 8783 --bind 127.0.0.1`, then visit `http://127.0.0.1:8783/`.

Edit `stylesheet/style.css` and `javascript/script.js`. Rebuild the content-hashed release files before publishing:

```sh
python scripts/build_assets.py
python scripts/verify_site.py
node --check javascript/script.js
```

To regenerate the local artwork, install Pillow and run `python scripts/prepare_assets.py`. Original source URLs and dimensions are recorded in `assets/image-sources.json`.

Browser verification covers 320–1920px viewport widths, phone portrait/landscape previews, menu navigation, anchor scrolling and scroll motion across breakpoint changes. This is viewport testing, not a claim of testing every physical device.

See [THIRD_PARTY.md](THIRD_PARTY.md) for original design attribution and bundled dependencies.
