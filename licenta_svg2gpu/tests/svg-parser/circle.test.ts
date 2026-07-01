import { SVGParser } from "../../src/core/SvgParser";
import { ESVGElementType } from "../../src/types/index";
import { Logger } from "../../src/utils/Logger";

describe("SVGParser", () => {
	Logger.SHOW_ERRORS = false;

	it("parses a simple <circle>", () => {
		const svg = `<svg><circle cx="10" cy="20" r="5" fill="#ff0000" stroke="#0000ff" stroke-width="2"/></svg>`;
		const result = SVGParser.parse(svg);
		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({
			type: ESVGElementType.CIRCLE,
			cx: 10,
			cy: 20,
			r: 5,
			fill: [1, 0, 0, 1],
			stroke: [0, 0, 1, 1],
			strokeWidth: 2,
		});
	});

	it("parses a complex <circle> with more attributes", () => {
		const svg = `<svg><circle cx="10" cy="20" r="5" fill="#ff0000" stroke="#0000ff" stroke-width="2" opacity="0.5"/></svg>`;
		const result = SVGParser.parse(svg);
		expect(result[0]).toMatchObject({
			type: ESVGElementType.CIRCLE,
			cx: 10,
			cy: 20,
			r: 5,
			fill: [1, 0, 0, 1],
			stroke: [0, 0, 1, 1],
			strokeWidth: 2,
			opacity: 0.5,
		});
	});

	it("errors on incomplete <circle>", () => {
		const result = SVGParser.parse(`<svg><circle x="10" cx="5" /></svg>`);
		expect(result).toHaveLength(0);
	});
});
