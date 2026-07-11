# svg2gpu

Parse SVG markup into GPU-ready geometry and render it in the browser with WebGPU.

## Installation

```bash
npm i svg2gpu
```

For CodePen or a plain HTML page, load the browser bundle from jsDelivr:

```html
<script src="https://cdn.jsdelivr.net/npm/svg2gpu/lib/svg2gpu.min.js"></script>
<script>
  const { Svg2GPU } = window.svg2gpu;
</script>
```

Pin the version in production; change `1.0.6` when upgrading.

## Render an SVG

```html
<div id="preview" style="width: 640px; height: 480px"></div>
```

```ts
import { Svg2GPU } from "svg2gpu";

const svg = `
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" fill="#7c3aed" />
  </svg>
`;

const renderer = new Svg2GPU("preview", {
  svg,
  fit: "contain",
  antialias: true,
});

await renderer.ready;
```

Call `renderer.update(svg)` to replace the SVG, `renderer.resize()` after the
container changes size, and `renderer.destroy()` when the renderer is no longer
needed.

## Compile without rendering

```ts
import { Svg2GPU } from "svg2gpu";

const scene = Svg2GPU.compile(svg);
console.log(scene.stats);
```

Rendering requires a browser with WebGPU support. The package includes CommonJS
and ES module builds plus TypeScript declarations.

## License

[MIT](LICENSE)
