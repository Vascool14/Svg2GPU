import { SVGParser } from "../../src/core/SvgParser";
import { ESVGElementType } from "../../src/types";
import { Logger } from "../../src/utils/Logger";

describe("<line>", () => {
	Logger.SHOW_ERRORS = false;

	it("parses line with coordinates", () => {
		const svg = `<svg><line x1="0" y1="0" x2="10" y2="10" stroke="blue"/></svg>`;
		const result = SVGParser.parse(svg);
		expect(result[0]).toMatchObject({
			type: ESVGElementType.LINE,
			x1: 0,
			y1: 0,
			x2: 10,
			y2: 10,
			stroke: [0, 0, 1, 1],
		});
	});

	it("omits fill and parses only stroke", () => {
		const svg = `<svg><line x1="5" y1="5" x2="15" y2="15" fill="red" stroke="#123"/></svg>`;
		const result = SVGParser.parse(svg);
		expect(result[0]).not.toHaveProperty("fill");
		expect(result[0]).toHaveProperty("stroke");
	});

	it("rejects if coordinates are missing", () => {
		const svg = `<svg><line x1="5" y1="5"/></svg>`;
		const result = SVGParser.parse(svg);
		expect(result).toHaveLength(0);
	});
});
