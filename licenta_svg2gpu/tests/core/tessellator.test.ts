import { Tessellator } from "../../src/core/Tessellator";
import { ESVGElementType, ResolvedRenderStyle } from "../../src/types";

const STYLE: ResolvedRenderStyle = {
	fill: [1, 0, 0, 1],
	fillOpacity: 1,
	fillRule: "nonzero",
	stroke: [0, 0, 1, 1],
	strokeWidth: 2,
	strokeOpacity: 1,
	strokeLinecap: "butt",
	strokeLinejoin: "miter",
	opacity: 1,
	display: "inline",
	visibility: "visible",
};

describe("Tessellator", () => {
	it("triangulates a closed contour into indexed fill geometry", () => {
		const batches = Tessellator.tessellateFill(
			[
				{
					closed: true,
					points: [
						[0, 0],
						[10, 0],
						[10, 10],
						[0, 10],
						[0, 0],
					],
				},
			],
			STYLE,
			ESVGElementType.RECT
		);

		expect(batches).toHaveLength(1);
		expect(batches[0].kind).toBe("fill");
		expect(batches[0].vertices.length).toBe(8);
		expect(batches[0].indices.length).toBe(6);
	});

	it("expands an open contour into stroke triangles", () => {
		const batches = Tessellator.tessellateStroke(
			[
				{
					closed: false,
					points: [
						[0, 0],
						[10, 0],
					],
				},
			],
			STYLE,
			ESVGElementType.LINE
		);

		expect(batches).toHaveLength(1);
		expect(batches[0].kind).toBe("stroke");
		expect(batches[0].vertices.length).toBeGreaterThan(0);
		expect(batches[0].indices.length).toBeGreaterThan(0);
	});
});
