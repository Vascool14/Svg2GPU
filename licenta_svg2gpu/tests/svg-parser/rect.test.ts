import { SVGParser } from "../../src/core/SvgParser";
import { ESVGElementType } from "../../src/types";
import { Logger } from "../../src/utils/Logger";

describe("<rect>", () => {
	Logger.SHOW_ERRORS = false;

	it("parses rect with position and size", () => {
		const svg = `<svg><rect x="5" y="10" width="100" height="50"/></svg>`;
		const result = SVGParser.parse(svg);
		expect(result[0]).toMatchObject({
			type: ESVGElementType.RECT,
			x: 5,
			y: 10,
			width: 100,
			height: 50,
		});
	});

	it("parses rect with rounding and styles", () => {
		const svg = `<svg><rect x="0" y="0" width="10" height="10" rx="2" ry="4" fill="black" stroke="#00f"/></svg>`;
		const result = SVGParser.parse(svg);

		expect(result[0]).toMatchObject({
			rx: 2,
			ry: 4,
			fill: [0, 0, 0, 1],
			stroke: [0, 0, 1, 1],
		});
	});

	it("rejects rect missing required attributes", () => {
		const svg = `<svg><rect width="50"/></svg>`;
		const result = SVGParser.parse(svg);
		expect(result).toHaveLength(0);
	});
});
