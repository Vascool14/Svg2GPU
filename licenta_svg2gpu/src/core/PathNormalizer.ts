import svgPath from "svgpath";
import { Matrix2D, PathCommand, Point } from "../types";
import { TransformParser } from "./TransformParser";

export type NormalizedContour = {
	points: Point[];
	closed: boolean;
};

export type NormalizedPath = {
	contours: NormalizedContour[];
};

export type PathNormalizerOptions = {
	tolerance?: number;
	transform?: Matrix2D;
};

type Segment = (string | number)[];

const DEFAULT_TOLERANCE = 0.25;
const MAX_SUBDIVISION_DEPTH = 16;
const EPSILON = 1e-8;

export class PathNormalizer {
	static normalizePathData(
		path: string | PathCommand[],
		options: PathNormalizerOptions = {}
	): NormalizedPath {
		const tolerance = options.tolerance ?? DEFAULT_TOLERANCE;
		const transform = options.transform ?? TransformParser.identity();
		const pathString = Array.isArray(path) ? this.commandsToPathString(path) : path;
		const contours: NormalizedContour[] = [];
		let currentContour: NormalizedContour | null = null;
		let current: Point = [0, 0];
		let start: Point = [0, 0];

		const flush = () => {
			if (!currentContour || currentContour.points.length === 0) {
				currentContour = null;
				return;
			}

			currentContour.points = this.removeDuplicatePoints(currentContour.points);
			if (currentContour.points.length >= 2) {
				contours.push(currentContour);
			}
			currentContour = null;
		};

		svgPath(pathString)
			.abs()
			.unshort()
			.unarc()
			.iterate((segment) => {
				const seg = segment as Segment;
				const command = seg[0];

				switch (command) {
					case "M": {
						flush();
						current = [Number(seg[1]), Number(seg[2])];
						start = current;
						currentContour = {
							points: [TransformParser.applyToPoint(transform, current)],
							closed: false,
						};
						break;
					}

					case "L": {
						current = [Number(seg[1]), Number(seg[2])];
						this.pushPoint(currentContour, TransformParser.applyToPoint(transform, current));
						break;
					}

					case "H": {
						current = [Number(seg[1]), current[1]];
						this.pushPoint(currentContour, TransformParser.applyToPoint(transform, current));
						break;
					}

					case "V": {
						current = [current[0], Number(seg[1])];
						this.pushPoint(currentContour, TransformParser.applyToPoint(transform, current));
						break;
					}

					case "C": {
						const p0 = current;
						const p1: Point = [Number(seg[1]), Number(seg[2])];
						const p2: Point = [Number(seg[3]), Number(seg[4])];
						const p3: Point = [Number(seg[5]), Number(seg[6])];
						for (const point of this.flattenCubic(p0, p1, p2, p3, tolerance)) {
							this.pushPoint(
								currentContour,
								TransformParser.applyToPoint(transform, point)
							);
						}
						current = p3;
						break;
					}

					case "Q": {
						const p0 = current;
						const p1: Point = [Number(seg[1]), Number(seg[2])];
						const p2: Point = [Number(seg[3]), Number(seg[4])];
						for (const point of this.flattenQuadratic(p0, p1, p2, tolerance)) {
							this.pushPoint(
								currentContour,
								TransformParser.applyToPoint(transform, point)
							);
						}
						current = p2;
						break;
					}

					case "Z":
					case "z": {
						if (currentContour) {
							const transformedStart = TransformParser.applyToPoint(transform, start);
							this.pushPoint(currentContour, transformedStart);
							currentContour.closed = true;
						}
						current = start;
						flush();
						break;
					}

					default:
						break;
				}
			});

		flush();

		return { contours };
	}

	static commandsToPathString(commands: PathCommand[]): string {
		return commands
			.map((command) => `${command.type}${command.params.join(" ")}`)
			.join(" ");
	}

	static contourFromPoints(
		points: Point[] | undefined,
		closed: boolean,
		transform?: Matrix2D
	): NormalizedContour | null {
		if (!points || points.length < 2) return null;
		const matrix = transform ?? TransformParser.identity();
		const transformed = points.map((point) =>
			TransformParser.applyToPoint(matrix, point)
		);
		if (closed && transformed.length > 0) {
			transformed.push([...transformed[0]] as Point);
		}
		return {
			points: this.removeDuplicatePoints(transformed),
			closed,
		};
	}

	static ellipseContour(
		cx: number,
		cy: number,
		rx: number,
		ry: number,
		options: PathNormalizerOptions = {}
	): NormalizedContour {
		const tolerance = Math.max(options.tolerance ?? DEFAULT_TOLERANCE, 0.01);
		const radius = Math.max(rx, ry);
		if (radius <= EPSILON) {
			return { points: [], closed: true };
		}
		const segmentCount = Math.max(
			16,
			Math.min(256, Math.ceil((Math.PI * 2) / Math.acos(1 - tolerance / radius)))
		);
		const transform = options.transform ?? TransformParser.identity();
		const points: Point[] = [];

		for (let i = 0; i <= segmentCount; i++) {
			const angle = (i / segmentCount) * Math.PI * 2;
			points.push(
				TransformParser.applyToPoint(transform, [
					cx + Math.cos(angle) * rx,
					cy + Math.sin(angle) * ry,
				])
			);
		}

		return {
			points: this.removeDuplicatePoints(points),
			closed: true,
		};
	}

	private static pushPoint(contour: NormalizedContour | null, point: Point): void {
		if (!contour) return;
		const previous = contour.points[contour.points.length - 1];
		if (!previous || this.distance(previous, point) > EPSILON) {
			contour.points.push(point);
		}
	}

	private static removeDuplicatePoints(points: Point[]): Point[] {
		const result: Point[] = [];
		for (const point of points) {
			const previous = result[result.length - 1];
			if (!previous || this.distance(previous, point) > EPSILON) {
				result.push(point);
			}
		}
		return result;
	}

	private static flattenCubic(
		p0: Point,
		p1: Point,
		p2: Point,
		p3: Point,
		tolerance: number,
		depth = 0
	): Point[] {
		if (
			depth >= MAX_SUBDIVISION_DEPTH ||
			Math.max(
				this.distanceToLine(p1, p0, p3),
				this.distanceToLine(p2, p0, p3)
			) <= tolerance
		) {
			return [p3];
		}

		const p01 = this.midpoint(p0, p1);
		const p12 = this.midpoint(p1, p2);
		const p23 = this.midpoint(p2, p3);
		const p012 = this.midpoint(p01, p12);
		const p123 = this.midpoint(p12, p23);
		const p0123 = this.midpoint(p012, p123);

		return [
			...this.flattenCubic(p0, p01, p012, p0123, tolerance, depth + 1),
			...this.flattenCubic(p0123, p123, p23, p3, tolerance, depth + 1),
		];
	}

	private static flattenQuadratic(
		p0: Point,
		p1: Point,
		p2: Point,
		tolerance: number,
		depth = 0
	): Point[] {
		if (
			depth >= MAX_SUBDIVISION_DEPTH ||
			this.distanceToLine(p1, p0, p2) <= tolerance
		) {
			return [p2];
		}

		const p01 = this.midpoint(p0, p1);
		const p12 = this.midpoint(p1, p2);
		const p012 = this.midpoint(p01, p12);

		return [
			...this.flattenQuadratic(p0, p01, p012, tolerance, depth + 1),
			...this.flattenQuadratic(p012, p12, p2, tolerance, depth + 1),
		];
	}

	private static midpoint(a: Point, b: Point): Point {
		return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
	}

	private static distance(a: Point, b: Point): number {
		return Math.hypot(a[0] - b[0], a[1] - b[1]);
	}

	private static distanceToLine(point: Point, a: Point, b: Point): number {
		const dx = b[0] - a[0];
		const dy = b[1] - a[1];
		const length = Math.hypot(dx, dy);
		if (length <= EPSILON) return this.distance(point, a);
		return Math.abs(dy * point[0] - dx * point[1] + b[0] * a[1] - b[1] * a[0]) / length;
	}
}
