import { ColorParser } from "../../src/core/ColorParser";
import { Logger } from "../../src/utils/Logger";

describe("ColorParser", () => {
	Logger.SHOW_ERRORS = false;

	// --- HEX Tests ---
	describe("parse - Hex", () => {
		it("parses 3-digit hex", () => {
			expect(ColorParser.parse("#0F3")).toEqual([0, 1, 0.2, 1]);
		});

		it("parses 4-digit hex with alpha", () => {
			expect(ColorParser.parse("#0F38")).toEqual([0, 1, 0.2, 0.5333333333333333]);
		});

		it("parses 6-digit hex", () => {
			expect(ColorParser.parse("#00FF33")).toEqual([0, 1, 0.2, 1]);
		});

		it("parses 8-digit hex with alpha", () => {
			expect(ColorParser.parse("#00FF3388")).toEqual([0, 1, 0.2, 0.5333333333333333]);
		});

		it("returns undefined for invalid hex elements", () => {
			expect(ColorParser.parse("#XFF")).toBeUndefined();
		});

		it("returns undefined for invalid hex lengths", () => {
			expect(ColorParser.parse("#12")).toBeUndefined();

			expect(ColorParser.parse("#12345")).toBeUndefined();

			expect(ColorParser.parse("#1234567")).toBeUndefined();
		});
	});

	// --- RGB(a) Tests ---
	describe("parse - RGB/RGBA", () => {
		it("parses rgb", () => {
			expect(ColorParser.parse("rgb(255, 0, 128)")).toEqual([1, 0, 0.5019607843137255, 1]);
		});

		it("parses rgba with alpha < 1", () => {
			expect(ColorParser.parse("rgba(255, 0, 128, 0.5)")).toEqual([1, 0, 0.5019607843137255, 0.5]);
		});

		it("parses rgba with alpha = 1", () => {
			expect(ColorParser.parse("rgba(10, 20, 30, 1)")).toEqual([0.0392156862745098, 0.0784313725490196, 0.11764705882352941, 1]);
		});

		it("returns undefined for invalid rgb", () => {
			expect(ColorParser.parse("rgb(255, 0)")).toBeUndefined();
			expect(ColorParser.parse("rgba(255, 0, 0, 2)")).toBeUndefined();
		});
	});

	// --- HSL(a) Tests ---
	describe("parse - HSL/HSLA", () => {
		it("parses hsl", () => {
			expect(ColorParser.parse("hsl(0, 100%, 50%)")).toEqual([1, 0, 0, 1]);
		});

		it("parses hsla with alpha", () => {
			expect(ColorParser.parse("hsla(120, 100%, 25%, 0.5)")).toEqual([
				0, 0.5, 0, 0.5,
			]);
		});

		it("returns undefined for invalid hsl", () => {
			expect(ColorParser.parse("hsl(120, 100%,)")).toBeUndefined();
		});
	});

	// --- Named Colors ---
	describe("parse - Named colors", () => {
		it("parses lowercase & uppercase `blue`", () => {
			expect(ColorParser.parse("blue")).toEqual([0, 0, 1, 1]);
			expect(ColorParser.parse("BLUE")).toEqual([0, 0, 1, 1]);
			expect(ColorParser.parse("Blue")).toEqual([0, 0, 1, 1]);
			expect(ColorParser.parse("bLuE")).toEqual([0, 0, 1, 1]);
		});

		it("parses 'transparent' and 'none'", () => {
			expect(ColorParser.parse("transparent")).toEqual([0, 0, 0, 0]);
			expect(ColorParser.parse("none")).toEqual([0, 0, 0, 0]);
		});

		it("returns undefined for unknown name", () => {
			expect(ColorParser.parse("notacolor")).toBeUndefined();
		});
	});

	// --- Edge Case / Null Input ---
	describe("parse - Edge Cases", () => {
		it("returns undefined for null or undefined", () => {
			expect(ColorParser.parse(undefined)).toBeUndefined();
			expect(ColorParser.parse(null)).toBeUndefined();
			expect(ColorParser.parse("")).toBeUndefined();
		});
	});

	// --- HSL to RGBA ---
	describe("hslToRgba", () => {
		it("converts red", () => {
			expect(ColorParser.hslToRgba(0, 1, 0.5)).toEqual([1, 0, 0, 1]);
		});

		it("converts green", () => {
			expect(ColorParser.hslToRgba(120, 1, 0.5)).toEqual([0, 1, 0, 1]);
		});

		it("converts blue", () => {
			expect(ColorParser.hslToRgba(240, 1, 0.5)).toEqual([0, 0, 1, 1]);
		});

		it("respects alpha", () => {
			expect(ColorParser.hslToRgba(240, 1, 0.5, 0.5)).toEqual([0, 0, 1, 0.5]);
		});
	});
});
