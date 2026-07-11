# svg2gpu

Parse SVG markup into GPU-ready geometry and render it in the browser with WebGPU.

[Website](https://vascool14.github.io/Svg2GPU/) · [Playground](https://vascool14.github.io/Svg2GPU/playground) · [Guide](https://vascool14.github.io/Svg2GPU/docs) · [API reference](https://vascool14.github.io/Svg2GPU/typedoc/classes/Svg2GPU.html) · [GitHub](https://github.com/Vascool14/Svg2GPU)

## Install

```bash
npm install svg2gpu
```

## Browser usage

```html
<div id="preview" style="width: 640px; height: 480px"></div>
<script src="https://cdn.jsdelivr.net/npm/svg2gpu@1.0.7/lib/svg2gpu.min.js"></script>
<script>
	const { Svg2GPU } = window.svg2gpu;

	const renderer = new Svg2GPU("preview", {
		svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="#2e9dfe" />
    </svg>`,
		fit: "contain",
		antialias: true,
	});

	renderer.ready.catch(console.error);
</script>
```

## Module usage

```ts
import { Svg2GPU } from "svg2gpu";

const renderer = new Svg2GPU("preview", {
	svg,
	antialias: true,
	background: [1, 1, 1, 0],
	fit: "contain",
	flattenTolerance: 0.25,
});

await renderer.ready;
```

Use `renderer.update(svg)` when the SVG changes, `renderer.resize()` after its container changes size, and `renderer.destroy()` during cleanup.

To build geometry without creating a WebGPU renderer:

```ts
const scene = Svg2GPU.compile(svg);
console.log(scene.stats);
```

Rendering requires a browser with WebGPU support. CommonJS, ES module, and TypeScript declaration files are included.

## Live examples

- [Basic example on CodePen](https://codepen.io/vasculandrei/pen/emgMBRZ?editors=1010)
- [Romania map on CodePen](https://codepen.io/vasculandrei/pen/XJpENaj?editors=1010)
- [Full playground](https://vascool14.github.io/Svg2GPU/playground)

See the [complete guide](https://vascool14.github.io/Svg2GPU/docs) for React and vanilla JavaScript setup, option descriptions, and lifecycle examples. Browse the [`Svg2GPU` API](https://vascool14.github.io/Svg2GPU/typedoc/classes/Svg2GPU.html) for exact signatures.

## License

[MIT](LICENSE)
