import { SVGParser } from "../../src/core/SvgParser";
import { ESVGElementType } from "../../src/types";
import { Logger } from "../../src/utils/Logger";

describe("<g>", () => {
	Logger.SHOW_ERRORS = false;

	it("parses group with children", () => {
		const svg = `<svg><g><circle cx="1" cy="2" r="3"/></g></svg>`;
		const result = SVGParser.parse(svg);
		expect(result[0]).toMatchObject({
			type: ESVGElementType.GROUP,
			children: [
				{
					type: ESVGElementType.CIRCLE,
					cx: 1,
					cy: 2,
					r: 3,
				},
			],
		});
	});

	it("warns on empty group", () => {
		const svg = `<svg><g></g></svg>`;
		const result = SVGParser.parse(svg);
		expect(result[0]).toMatchObject({
			type: ESVGElementType.GROUP,
			children: [],
		});
	});
});
