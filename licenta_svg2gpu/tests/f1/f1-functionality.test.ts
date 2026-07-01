import { SVGParser } from "../../src/core/SvgParser";
import { ESVGElementType } from "../../src/types";
import { Logger } from "../../src/utils/Logger";

describe("F1 - SVG parse pipeline", () => {
	beforeAll(() => {
		Logger.SHOW_ERRORS = false;
		Logger.SHOW_WARNINGS = false;
		Logger.SHOW_DEBUG = false;
		Logger.SHOW_INFO = false;
		Logger.SHOW_LOG = false;
	});

	it("parses path commands into typed command objects", () => {
		const commands = SVGParser.parsePathDToJSON("M0 0 L10 0 L10 10 Z");

		expect(commands).toHaveLength(4);
		expect(commands[0]).toMatchObject({ type: "M", params: [0, 0] });
		expect(commands[1]).toMatchObject({ type: "L", params: [10, 0] });
		expect(commands[2]).toMatchObject({ type: "L", params: [10, 10] });
		expect(commands[3]).toMatchObject({ type: "Z", params: [] });
	});

	it("parses SVG into typed elements with styles", () => {
		const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
			<path d="M2 2 L22 2 L22 22 L2 22 Z" fill="#00ff33" stroke="#0033ff" stroke-width="2" />
		</svg>`;

		const parsed = SVGParser.parse(svg);
		expect(parsed).toHaveLength(1);

		const first = parsed[0];
		expect(first.type).toBe(ESVGElementType.PATH);
		if (first.type !== ESVGElementType.PATH) {
			throw new Error("Expected a PATH element for F1 test.");
		}

		expect(Array.isArray(first.d)).toBe(true);
		expect(first.fill).toEqual([0, 1, 0.2, 1]);
		expect(first.stroke).toEqual([0, 0.2, 1, 1]);
		expect(first.strokeWidth).toBe(2);
	});

	it("rejects invalid path elements missing 'd'", () => {
		const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path stroke="#000" /></svg>`;
		const parsed = SVGParser.parse(svg);
		expect(parsed).toHaveLength(0);
	});
});
