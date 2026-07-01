import { SVGParser } from "../../src/core/SvgParser";
import { ESVGElementType } from "../../src/types/index";
import { Logger } from "../../src/utils/Logger";

describe("SVGParser - polyline", () => {
	Logger.SHOW_ERRORS = false;

	it("parses a basic <polyline>", () => {
		const svg = `<svg><polyline points="0,0 10,0 10,10" stroke="#0000ff" fill="none"/></svg>`;
		const result = SVGParser.parse(svg);
		expect(result[0]).toMatchObject({
			type: ESVGElementType.POLYLINE,
			points: [
				[0, 0],
				[10, 0],
				[10, 10],
			],
			stroke: [0, 0, 1, 1],
		});
	});

	it("handles <polyline> with fill and stroke opacity", () => {
		const svg = `<svg><polyline points="1,1 5,1 5,5" fill="#00ffff" stroke="#ff00ff" stroke-opacity="0.25" fill-opacity="0.5"/></svg>`;
		const result = SVGParser.parse(svg);
		expect(result[0]).toMatchObject({
			type: ESVGElementType.POLYLINE,
			fillOpacity: 0.5,
			strokeOpacity: 0.25,
			fill: [0, 1, 1, 1],
			stroke: [1, 0, 1, 1],
		});
	});

	it("errors on invalid or missing points", () => {
		const svg = `<svg><polyline points="" /></svg>`;
		const result = SVGParser.parse(svg);
		expect(result).toHaveLength(0);
	});
});
