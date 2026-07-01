import { PathNormalizer } from "../../src/core/PathNormalizer";
import { TransformParser } from "../../src/core/TransformParser";

describe("PathNormalizer", () => {
	it("normalizes relative commands and closes contours", () => {
		const normalized = PathNormalizer.normalizePathData("M0 0 l10 0 l0 10 z");

		expect(normalized.contours).toHaveLength(1);
		expect(normalized.contours[0].closed).toBe(true);
		expect(normalized.contours[0].points[0]).toEqual([0, 0]);
		expect(normalized.contours[0].points.at(-1)).toEqual([0, 0]);
	});

	it("flattens cubic curves using the configured tolerance", () => {
		const normalized = PathNormalizer.normalizePathData(
			"M0 0 C10 20 20 20 30 0",
			{ tolerance: 0.25 }
		);

		expect(normalized.contours).toHaveLength(1);
		expect(normalized.contours[0].points.length).toBeGreaterThan(3);
		expect(normalized.contours[0].points.at(-1)).toEqual([30, 0]);
	});

	it("applies affine transforms after normalization", () => {
		const normalized = PathNormalizer.normalizePathData("M0 0 L10 0", {
			transform: TransformParser.parse("translate(5, 7) scale(2)"),
		});

		expect(normalized.contours[0].points[0]).toEqual([5, 7]);
		expect(normalized.contours[0].points[1]).toEqual([25, 7]);
	});
});
