# svg2gpu website

The Vite and React frontend for [svg2gpu](https://www.npmjs.com/package/svg2gpu).

[Live site](https://vascool14.github.io/Svg2GPU/) · [Playground](https://vascool14.github.io/Svg2GPU/playground) · [Guide](https://vascool14.github.io/Svg2GPU/docs) · [TypeDoc](https://vascool14.github.io/Svg2GPU/typedoc/classes/Svg2GPU.html) · [GitHub](https://github.com/Vascool14/Svg2GPU)

## Run locally

Build the library first because the playground imports its local bundle:

```bash
cd ../svg2gpu
npm install
npm run build

cd ../client
npm install
npm run dev
```

## Build

```bash
npm run build
```

GitHub Pages deployment is handled by [`.github/workflows/pages.yml`](../.github/workflows/pages.yml).

## Examples

- [Basic CodePen](https://codepen.io/vasculandrei/pen/emgMBRZ?editors=1010)
- [Romania map CodePen](https://codepen.io/vasculandrei/pen/XJpENaj?editors=1010)
