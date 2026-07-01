import { SVGParser } from "../../src/core/SvgParser";
import { ESVGElementType } from "../../src/types/index";
import { Logger } from "../../src/utils/Logger";

describe("SVGParser - ellipse", () => {
	Logger.SHOW_ERRORS = false;

	it("parses a basic <ellipse>", () => {
		const svg = `<svg><ellipse cx="50" cy="50" rx="10" ry="20" fill="#0000ff"/></svg>`;
		const result = SVGParser.parse(svg);
		expect(result[0]).toMatchObject({
			type: ESVGElementType.ELLIPSE,
			cx: 50,
			cy: 50,
			rx: 10,
			ry: 20,
			fill: [0, 0, 1, 1],
		});
	});

	it("parses <ellipse> with opacity, stroke, stroke-width", () => {
		const svg = `<svg><ellipse cx="25" cy="25" rx="15" ry="10" fill="#00ff00" stroke="#000" stroke-width="3" opacity="0.6"/></svg>`;
		const result = SVGParser.parse(svg);
		expect(result[0]).toMatchObject({
			type: ESVGElementType.ELLIPSE,
			opacity: 0.6,
			fill: [0, 1, 0, 1],
			stroke: [0, 0, 0, 1],
			strokeWidth: 3,
		});
	});

	it("errors on missing rx/ry/cx/cy", () => {
		const svg = `<svg><ellipse rx="10" ry="5" /></svg>`;
		const result = SVGParser.parse(svg);
		expect(result).toHaveLength(0);
	});
});
