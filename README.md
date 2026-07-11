# svg2gpu

Render SVG markup with WebGPU, or compile it into typed, GPU-ready geometry.

[Website](https://vascool14.github.io/Svg2GPU/) · [Playground](https://vascool14.github.io/Svg2GPU/playground) · [Guide](https://vascool14.github.io/Svg2GPU/docs) · [API reference](https://vascool14.github.io/Svg2GPU/typedoc/classes/Svg2GPU.html) · [npm](https://www.npmjs.com/package/svg2gpu)

## Try it

- [Basic CodePen](https://codepen.io/vasculandrei/pen/emgMBRZ?editors=1010) — the smallest complete browser example.
- [Romania map CodePen](https://codepen.io/vasculandrei/pen/XJpENaj?editors=1010) — a larger real-world SVG.
- [Interactive playground](https://vascool14.github.io/Svg2GPU/playground) — edit SVG and compare native SVG with WebGPU output.

## Install

```bash
npm install svg2gpu
```

```ts
import { Svg2GPU } from "svg2gpu";

const renderer = new Svg2GPU("preview", {
  svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" fill="#2e9dfe" />
  </svg>`,
  fit: "contain",
  antialias: true,
});

await renderer.ready;
```

For plain HTML, React integration, every renderer option, and embedded examples, read the [getting-started guide](https://vascool14.github.io/Svg2GPU/docs). For exact classes and types, open the [TypeDoc API reference](https://vascool14.github.io/Svg2GPU/typedoc/classes/Svg2GPU.html).

## Develop locally

```bash
git clone https://github.com/Vascool14/Svg2GPU.git
cd Svg2GPU/svg2gpu
npm install
npm test
npm run build
```

The library is in [`svg2gpu/`](svg2gpu/), the website is in [`client/`](client/), and the standalone examples are in [`codepen/`](codepen/).

## Screenshots

| Playground                                                          | TypeDoc                                                 |
| ------------------------------------------------------------------- | ------------------------------------------------------- |
| ![Basic geometry playground](utils/screenshots/BasicGeometries.png) | ![TypeDoc API reference](utils/screenshots/Typedoc.png) |

## License

[MIT](LICENSE)
