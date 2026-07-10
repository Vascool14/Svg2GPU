# Svg2GPU

`Svg2GPU` is a lightweight toolkit for parsing SVG data and rendering it through GPU pipelines. The current renderer implementation is WebGPU-based, but the project is designed with a general GPU-oriented direction in mind: predictable geometry processing, typed rendering data, and tooling that maps well to modern GPU workflows.

## Getting started:

### Or try it directly in this repo:

Clone this repository:
```bash
git clone https://github.com/Vascool14/Svg2GPU
```

Change directory to the library directory to build the latest svg2gpu.min.js
```bash
cd svg2gpu/svg2gpu 
npm i
npm run build       # to build the libary min js file in "/lib"
```

Then, use the `svg2gpu.min.js` file as an import wherever you might need to use it.

> Or, skip this entirely and inside your project do `npm i svg2gpu`

## The Playground:

The fastest way to understand the project in practice. You can load multiple SVG examples, edit them live, and instantly compare native SVG output with the GPU-rendered result. It also includes validation feedback and a terminal-style log so you can iterate safely while experimenting with complex shapes.

<div style="display: flex; gap: 12px; align-items: flex-start; flex-wrap: wrap;">
  <img src="utils/screenshots/BasicGeometries.png" alt="Playground Basic Geometries" width="48%" />
  <img src="utils/screenshots/TigerSVG.png" alt="Playground Tiger SVG" width="48%" />
</div>

## TypeDoc:
included to make the API surface easy to explore. It documents core parser and renderer types, enums, and utilities, so you can quickly move from interactive experimentation to real integration in your own app.

![TypeDoc Preview](utils/screenshots/Typedoc.png)
