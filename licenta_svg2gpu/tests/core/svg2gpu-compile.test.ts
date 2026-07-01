import { Svg2GPU } from "../../src";

describe("Svg2GPU.compile", () => {
	it("converts an SVG string into GPU-ready geometry batches", () => {
		const scene = Svg2GPU.compile(`
			<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
				<rect x="10" y="10" width="30" height="20" fill="#ff0000" stroke="#0000ff" stroke-width="2" />
				<line x1="0" y1="80" x2="100" y2="80" stroke="#00ff00" stroke-width="4" />
			</svg>
		`);

		expect(scene.metadata.viewBox).toEqual({ x: 0, y: 0, width: 100, height: 100 });
		expect(scene.batches.length).toBeGreaterThanOrEqual(3);
		expect(scene.stats.vertices).toBeGreaterThan(0);
		expect(scene.stats.indices).toBeGreaterThan(0);
	});

	it("keeps parser, style resolver, and geometry builder behind a static API", () => {
		const scene = Svg2GPU.compile(`
			<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
				<g transform="translate(5 5)" opacity="0.5">
					<path d="M0 0 L10 0 L10 10 Z" fill="red" />
				</g>
			</svg>
		`);

		expect(scene.batches).toHaveLength(1);
		expect(scene.batches[0].kind).toBe("fill");
		expect(scene.batches[0].color[3]).toBeCloseTo(0.5);
		expect(Array.from(scene.batches[0].vertices.slice(0, 2))).toEqual([5, 5]);
	});

	it("does not emit implicit white strokes for filled shapes", () => {
		const scene = Svg2GPU.compile(`
			<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
				<rect x="0" y="0" width="10" height="10" fill="red" />
				<circle cx="15" cy="15" r="4" fill="blue" stroke="none" />
			</svg>
		`);

		expect(scene.batches).toHaveLength(2);
		expect(scene.batches.every((batch) => batch.kind === "fill")).toBe(true);
	});

	it("fills open path subpaths by closing them for paint", () => {
		const scene = Svg2GPU.compile(`
			<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
				<path d="M2 2 H18 V18 H2" fill="white" stroke="none" />
			</svg>
		`);

		expect(scene.batches).toHaveLength(1);
		expect(scene.batches[0].kind).toBe("fill");
		expect(scene.stats.vertices).toBeGreaterThanOrEqual(4);
		expect(scene.stats.indices).toBeGreaterThan(0);
	});

	it("resolves inherited group styles before building geometry", () => {
		const scene = Svg2GPU.compile(`
			<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
				<g fill="#0000ff">
					<rect x="0" y="0" width="10" height="10" />
				</g>
			</svg>
		`);

		expect(scene.batches[0].kind).toBe("fill");
		expect(scene.batches[0].color).toEqual([0, 0, 1, 1]);
	});
});
