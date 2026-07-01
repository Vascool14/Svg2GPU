import earcut from "earcut";
import {
	Color,
	ESVGElementType,
	GeometryBatch,
	Point,
	ResolvedRenderStyle,
	TFillRule,
} from "../types";
import { NormalizedContour } from "./PathNormalizer";

type ContourGroup = {
	outer: NormalizedContour;
	holes: NormalizedContour[];
};

const EPSILON = 1e-8;

export class Tessellator {
	static tessellateFill(
		contours: NormalizedContour[],
		style: ResolvedRenderStyle,
		sourceType: ESVGElementType
	): GeometryBatch[] {
		if (!style.fill || style.fillOpacity <= 0 || (style.fill[3] ?? 1) <= 0) {
			return [];
		}

		const color = this.applyAlpha(style.fill, style.fillOpacity * style.opacity);
		const groups = this.groupClosedContours(contours, style.fillRule);
		const batches: GeometryBatch[] = [];

		for (const group of groups) {
			const batch = this.tessellateContourGroup(group, color, sourceType);
			if (batch) batches.push(batch);
		}

		return batches;
	}

	static tessellateStroke(
		contours: NormalizedContour[],
		style: ResolvedRenderStyle,
		sourceType: ESVGElementType
	): GeometryBatch[] {
		if (
			!style.stroke ||
			style.strokeWidth <= 0 ||
			style.strokeOpacity <= 0 ||
			(style.stroke[3] ?? 1) <= 0
		) {
			return [];
		}

		const vertices: number[] = [];
		const indices: number[] = [];
		const halfWidth = style.strokeWidth / 2;

		for (const contour of contours) {
			const points = this.stripClosingPoint(contour.points);
			if (points.length < 2) continue;

			const segmentCount = contour.closed ? points.length : points.length - 1;
			for (let i = 0; i < segmentCount; i++) {
				const start = points[i];
				const end = points[(i + 1) % points.length];
				this.addSegmentQuad(vertices, indices, start, end, halfWidth);
			}

			this.addJoins(vertices, indices, points, contour.closed, halfWidth, style);
			if (!contour.closed) {
				this.addCap(vertices, indices, points[0], points[1], halfWidth, style, "start");
				this.addCap(
					vertices,
					indices,
					points[points.length - 1],
					points[points.length - 2],
					halfWidth,
					style,
					"end"
				);
			}
		}

		if (vertices.length === 0) return [];

		return [
			{
				kind: "stroke",
				vertices: new Float32Array(vertices),
				indices: new Uint32Array(indices),
				color: this.applyAlpha(style.stroke, style.strokeOpacity * style.opacity),
				sourceType,
			},
		];
	}

	private static tessellateContourGroup(
		group: ContourGroup,
		color: Color,
		sourceType: ESVGElementType
	): GeometryBatch | null {
		const vertices: number[] = [];
		const holes: number[] = [];
		const pushContour = (contour: NormalizedContour, isHole = false) => {
			const points = this.stripClosingPoint(contour.points);
			if (points.length < 3) return;
			if (isHole) holes.push(vertices.length / 2);
			for (const point of points) {
				vertices.push(point[0], point[1]);
			}
		};

		pushContour(group.outer);
		for (const hole of group.holes) {
			pushContour(hole, true);
		}

		if (vertices.length < 6) return null;

		const indices = earcut(vertices, holes.length > 0 ? holes : undefined, 2);
		if (indices.length === 0) return null;

		return {
			kind: "fill",
			vertices: new Float32Array(vertices),
			indices: new Uint32Array(indices),
			color,
			sourceType,
		};
	}

	private static groupClosedContours(
		contours: NormalizedContour[],
		fillRule: TFillRule
	): ContourGroup[] {
		const closed = contours
			.filter((contour) => this.stripClosingPoint(contour.points).length >= 3)
			.map((contour) => ({
				...contour,
				closed: true,
			}));
		const groups: ContourGroup[] = [];

		for (const contour of closed) {
			const area = this.signedArea(contour.points);
			const last = groups[groups.length - 1];
			const shouldAttachAsHole =
				!!last &&
				(fillRule === "evenodd" || Math.sign(area) !== Math.sign(this.signedArea(last.outer.points))) &&
				this.pointInPolygon(contour.points[0], last.outer.points);

			if (shouldAttachAsHole) {
				last.holes.push(contour);
			} else {
				groups.push({ outer: contour, holes: [] });
			}
		}

		return groups;
	}

	private static addSegmentQuad(
		vertices: number[],
		indices: number[],
		start: Point,
		end: Point,
		halfWidth: number
	): void {
		const direction = this.normalize([end[0] - start[0], end[1] - start[1]]);
		if (!direction) return;
		const normal: Point = [-direction[1] * halfWidth, direction[0] * halfWidth];

		const a: Point = [start[0] + normal[0], start[1] + normal[1]];
		const b: Point = [start[0] - normal[0], start[1] - normal[1]];
		const c: Point = [end[0] + normal[0], end[1] + normal[1]];
		const d: Point = [end[0] - normal[0], end[1] - normal[1]];

		this.addQuad(vertices, indices, a, b, c, d);
	}

	private static addJoins(
		vertices: number[],
		indices: number[],
		points: Point[],
		closed: boolean,
		halfWidth: number,
		style: ResolvedRenderStyle
	): void {
		const start = closed ? 0 : 1;
		const end = closed ? points.length : points.length - 1;

		for (let i = start; i < end; i++) {
			const previous = points[(i - 1 + points.length) % points.length];
			const current = points[i % points.length];
			const next = points[(i + 1) % points.length];

			if (style.strokeLinejoin === "round") {
				this.addRoundFan(vertices, indices, current, halfWidth);
			} else {
				this.addBevelJoin(vertices, indices, previous, current, next, halfWidth);
			}
		}
	}

	private static addBevelJoin(
		vertices: number[],
		indices: number[],
		previous: Point,
		current: Point,
		next: Point,
		halfWidth: number
	): void {
		const d1 = this.normalize([current[0] - previous[0], current[1] - previous[1]]);
		const d2 = this.normalize([next[0] - current[0], next[1] - current[1]]);
		if (!d1 || !d2) return;

		const n1: Point = [-d1[1] * halfWidth, d1[0] * halfWidth];
		const n2: Point = [-d2[1] * halfWidth, d2[0] * halfWidth];
		this.addTriangle(vertices, indices, current, [current[0] + n1[0], current[1] + n1[1]], [current[0] + n2[0], current[1] + n2[1]]);
		this.addTriangle(vertices, indices, current, [current[0] - n1[0], current[1] - n1[1]], [current[0] - n2[0], current[1] - n2[1]]);
	}

	private static addCap(
		vertices: number[],
		indices: number[],
		point: Point,
		neighbor: Point,
		halfWidth: number,
		style: ResolvedRenderStyle,
		side: "start" | "end"
	): void {
		const direction = this.normalize([point[0] - neighbor[0], point[1] - neighbor[1]]);
		if (!direction) return;

		if (style.strokeLinecap === "round") {
			this.addRoundFan(vertices, indices, point, halfWidth);
			return;
		}

		if (style.strokeLinecap !== "square") return;

		const outward = side === "start" ? direction : [-direction[0], -direction[1]] as Point;
		const normal: Point = [-outward[1] * halfWidth, outward[0] * halfWidth];
		const extension: Point = [outward[0] * halfWidth, outward[1] * halfWidth];
		const a: Point = [point[0] + normal[0], point[1] + normal[1]];
		const b: Point = [point[0] - normal[0], point[1] - normal[1]];
		const c: Point = [a[0] + extension[0], a[1] + extension[1]];
		const d: Point = [b[0] + extension[0], b[1] + extension[1]];
		this.addQuad(vertices, indices, a, b, c, d);
	}

	private static addRoundFan(
		vertices: number[],
		indices: number[],
		center: Point,
		radius: number
	): void {
		const segments = Math.max(12, Math.ceil(radius * 2));
		for (let i = 0; i < segments; i++) {
			const a0 = (i / segments) * Math.PI * 2;
			const a1 = ((i + 1) / segments) * Math.PI * 2;
			this.addTriangle(
				vertices,
				indices,
				center,
				[center[0] + Math.cos(a0) * radius, center[1] + Math.sin(a0) * radius],
				[center[0] + Math.cos(a1) * radius, center[1] + Math.sin(a1) * radius]
			);
		}
	}

	private static addQuad(
		vertices: number[],
		indices: number[],
		a: Point,
		b: Point,
		c: Point,
		d: Point
	): void {
		this.addTriangle(vertices, indices, a, b, c);
		this.addTriangle(vertices, indices, b, d, c);
	}

	private static addTriangle(
		vertices: number[],
		indices: number[],
		a: Point,
		b: Point,
		c: Point
	): void {
		const index = vertices.length / 2;
		vertices.push(a[0], a[1], b[0], b[1], c[0], c[1]);
		indices.push(index, index + 1, index + 2);
	}

	private static stripClosingPoint(points: Point[]): Point[] {
		if (points.length <= 1) return points;
		const first = points[0];
		const last = points[points.length - 1];
		if (Math.hypot(first[0] - last[0], first[1] - last[1]) <= EPSILON) {
			return points.slice(0, -1);
		}
		return points;
	}

	private static signedArea(points: Point[]): number  {
		const stripped = this.stripClosingPoint(points);
		let area = 0;
		for (let i = 0; i < stripped.length; i++) {
			const a = stripped[i];
			const b = stripped[(i + 1) % stripped.length];
			area += a[0] * b[1] - b[0] * a[1];
		}
		return area / 2;
	}

	private static pointInPolygon(point: Point, polygon: Point[]): boolean {
		const points = this.stripClosingPoint(polygon);
		let inside = false;
		for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
			const a = points[i];
			const b = points[j];
			if (
				a[1] > point[1] !== b[1] > point[1] &&
				point[0] < ((b[0] - a[0]) * (point[1] - a[1])) / (b[1] - a[1]) + a[0]
			) {
				inside = !inside;
			}
		}
		return inside;
	}

	private static normalize(vector: Point): Point | null {
		const length = Math.hypot(vector[0], vector[1]);
		if (length <= EPSILON) return null;
		return [vector[0] / length, vector[1] / length];
	}

	private static applyAlpha(color: Color, alpha: number): Color {
		return [color[0], color[1], color[2], (color[3] ?? 1) * alpha];
	}
}
