import { SVGParser } from "../../src/core/SvgParser";
import { ESVGElementType } from "../../src/types/index";
import { Logger } from "../../src/utils/Logger";

describe("SVGParser - polygon", () => {
	Logger.SHOW_ERRORS = false;

	it("parses a basic <polygon>", () => {
		const svg = `<svg><polygon points="0,0 10,0 10,10" stroke="#000000" fill="#ffffff"/></svg>`;
		const result = SVGParser.parse(svg);
		expect(result[0]).toMatchObject({
			type: ESVGElementType.POLYGON,
			points: [
				[0, 0],
				[10, 0],
				[10, 10],
			],
			stroke: [0, 0, 0, 1],
			fill: [1, 1, 1, 1],
		});
	});

	it("parses a <polygon> with opacity and stroke width", () => {
		const svg = `<svg><polygon points="5,5 15,5 10,15" fill="#ff0000" stroke="#00ff00" stroke-width="2" opacity="0.5"/></svg>`;
		const result = SVGParser.parse(svg);
		expect(result[0]).toMatchObject({
			type: ESVGElementType.POLYGON,
			opacity: 0.5,
			strokeWidth: 2,
			fill: [1, 0, 0, 1],
			stroke: [0, 1, 0, 1],
		});
	});

	it("errors on missing points", () => {
		const svg = `<svg><polygon /></svg>`;
		const result = SVGParser.parse(svg);
		expect(result).toHaveLength(0);
	});
});
