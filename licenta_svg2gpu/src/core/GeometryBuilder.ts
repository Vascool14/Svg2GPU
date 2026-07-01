import {
	ESVGElementType,
	GeometryBatch,
	GpuScene,
	Point,
	ResolvedScene,
	ResolvedSVGElement,
	SVGCircle,
	SVGEllipse,
	SVGLine,
	SVGPath,
	SVGPolygon,
	SVGPolyline,
	SVGRect,
} from "../types";
import {
	NormalizedContour,
	NormalizedPath,
	PathNormalizer,
} from "./PathNormalizer";
import { Tessellator } from "./Tessellator";

export type GeometryBuilderOptions = {
	flattenTolerance?: number;
};

export class GeometryBuilder {
	static build(scene: ResolvedScene, options: GeometryBuilderOptions = {}): GpuScene {
		const batches: GeometryBatch[] = [];

		for (const child of scene.children) {
			this.appendElementBatches(child, batches, options);
		}

		const stats = batches.reduce(
			(acc, batch) => {
				acc.batches += 1;
				acc.vertices += batch.vertices.length / 2;
				acc.indices += batch.indices.length;
				return acc;
			},
			{ batches: 0, vertices: 0, indices: 0 }
		);

		return {
			metadata: scene.metadata,
			batches,
			diagnostics: scene.diagnostics,
			stats,
		};
	}

	private static appendElementBatches(
		element: ResolvedSVGElement,
		batches: GeometryBatch[],
		options: GeometryBuilderOptions
	): void {
		if (element.style.display === "none" || element.style.visibility !== "visible") {
			return;
		}

		if (element.type === ESVGElementType.GROUP) {
			for (const child of element.children ?? []) {
				this.appendElementBatches(child, batches, options);
			}
			return;
		}

		const path = this.elementToPath(element, options);
		if (!path || path.contours.length === 0) return;

		batches.push(
			...Tessellator.tessellateFill(
				path.contours,
				element.style,
				element.type
			)
		);
		batches.push(
			...Tessellator.tessellateStroke(
				path.contours,
				element.style,
				element.type
			)
		);
	}

	private static elementToPath(
		element: ResolvedSVGElement,
		options: GeometryBuilderOptions
	): NormalizedPath | null {
		const tolerance = options.flattenTolerance;
		const transform = element.transform;

		switch (element.type) {
			case ESVGElementType.PATH: {
				const source = element.source as SVGPath;
				return PathNormalizer.normalizePathData(source.d, {
					tolerance,
					transform,
				});
			}

			case ESVGElementType.RECT:
				return {
					contours: [
						this.rectToContour(element.source as SVGRect, tolerance, transform),
					].filter(Boolean) as NormalizedContour[],
				};

			case ESVGElementType.CIRCLE: {
				const source = element.source as SVGCircle;
				return {
					contours: [
						PathNormalizer.ellipseContour(source.cx, source.cy, source.r, source.r, {
							tolerance,
							transform,
						}),
					],
				};
			}

			case ESVGElementType.ELLIPSE: {
				const source = element.source as SVGEllipse;
				return {
					contours: [
						PathNormalizer.ellipseContour(source.cx, source.cy, source.rx, source.ry, {
							tolerance,
							transform,
						}),
					],
				};
			}

			case ESVGElementType.POLYGON: {
				const source = element.source as SVGPolygon;
				const contour = PathNormalizer.contourFromPoints(source.points, true, transform);
				return contour ? { contours: [contour] } : null;
			}

			case ESVGElementType.POLYLINE: {
				const source = element.source as SVGPolyline;
				const contour = PathNormalizer.contourFromPoints(source.points, false, transform);
				return contour ? { contours: [contour] } : null;
			}

			case ESVGElementType.LINE: {
				const source = element.source as SVGLine;
				const points: Point[] = [
					[source.x1, source.y1],
					[source.x2, source.y2],
				];
				const contour = PathNormalizer.contourFromPoints(points, false, transform);
				return contour ? { contours: [contour] } : null;
			}

			default:
				return null;
		}
	}

	private static rectToContour(
		rect: SVGRect,
		tolerance: number | undefined,
		transform: ResolvedSVGElement["transform"]
	): NormalizedContour {
		const rx = Math.max(0, Math.min(rect.rx ?? 0, rect.width / 2));
		const ry = Math.max(0, Math.min(rect.ry ?? 0, rect.height / 2));

		if (rx === 0 && ry === 0) {
			const points: Point[] = [
				[rect.x, rect.y],
				[rect.x + rect.width, rect.y],
				[rect.x + rect.width, rect.y + rect.height],
				[rect.x, rect.y + rect.height],
			];
			const contour = PathNormalizer.contourFromPoints(points, true, transform);
			return contour ?? { points: [], closed: true };
		}

		const path = [
			`M ${rect.x + rx} ${rect.y}`,
			`L ${rect.x + rect.width - rx} ${rect.y}`,
			`A ${rx} ${ry} 0 0 1 ${rect.x + rect.width} ${rect.y + ry}`,
			`L ${rect.x + rect.width} ${rect.y + rect.height - ry}`,
			`A ${rx} ${ry} 0 0 1 ${rect.x + rect.width - rx} ${rect.y + rect.height}`,
			`L ${rect.x + rx} ${rect.y + rect.height}`,
			`A ${rx} ${ry} 0 0 1 ${rect.x} ${rect.y + rect.height - ry}`,
			`L ${rect.x} ${rect.y + ry}`,
			`A ${rx} ${ry} 0 0 1 ${rect.x + rx} ${rect.y}`,
			"Z",
		].join(" ");

		const normalized = PathNormalizer.normalizePathData(path, {
			tolerance,
			transform,
		});

		return normalized.contours[0] ?? { points: [], closed: true };
	}
}
