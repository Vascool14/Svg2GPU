import { Matrix2D, Point } from "../types";

const IDENTITY: Matrix2D = [1, 0, 0, 1, 0, 0];

export class TransformParser {
	static identity(): Matrix2D {
		return [...IDENTITY] as Matrix2D;
	}

	static multiply(left: Matrix2D, right: Matrix2D): Matrix2D {
		const [a1, b1, c1, d1, e1, f1] = left;
		const [a2, b2, c2, d2, e2, f2] = right;

		return [
			a1 * a2 + c1 * b2,
			b1 * a2 + d1 * b2,
			a1 * c2 + c1 * d2,
			b1 * c2 + d1 * d2,
			a1 * e2 + c1 * f2 + e1,
			b1 * e2 + d1 * f2 + f1,
		];
	}

	static applyToPoint(matrix: Matrix2D, point: Point): Point {
		const [a, b, c, d, e, f] = matrix;
		const [x, y] = point;
		return [a * x + c * y + e, b * x + d * y + f];
	}

	static parse(transform?: string): Matrix2D {
		if (!transform?.trim()) return this.identity();

		const commandRegex = /([a-zA-Z]+)\(([^)]*)\)/g;
		let result = this.identity();
		let match: RegExpExecArray | null;

		while ((match = commandRegex.exec(transform)) !== null) {
			const name = match[1].toLowerCase();
			const values = match[2]
				.trim()
				.split(/[\s,]+/)
				.filter(Boolean)
				.map(Number)
				.filter((value) => Number.isFinite(value));

			const matrix = this.commandToMatrix(name, values);
			result = this.multiply(result, matrix);
		}

		return result;
	}

	private static commandToMatrix(name: string, values: number[]): Matrix2D {
		switch (name) {
			case "matrix":
				return values.length >= 6
					? [values[0], values[1], values[2], values[3], values[4], values[5]]
					: this.identity();

			case "translate":
				return [1, 0, 0, 1, values[0] ?? 0, values[1] ?? 0];

			case "scale": {
				const sx = values[0] ?? 1;
				const sy = values[1] ?? sx;
				return [sx, 0, 0, sy, 0, 0];
			}

			case "rotate": {
				const angle = ((values[0] ?? 0) * Math.PI) / 180;
				const cos = Math.cos(angle);
				const sin = Math.sin(angle);
				const rotation: Matrix2D = [cos, sin, -sin, cos, 0, 0];

				if (values.length >= 3) {
					const [cx, cy] = [values[1], values[2]];
					return this.multiply(
						this.multiply([1, 0, 0, 1, cx, cy], rotation),
						[1, 0, 0, 1, -cx, -cy]
					);
				}

				return rotation;
			}

			case "skewx": {
				const angle = ((values[0] ?? 0) * Math.PI) / 180;
				return [1, 0, Math.tan(angle), 1, 0, 0];
			}

			case "skewy": {
				const angle = ((values[0] ?? 0) * Math.PI) / 180;
				return [1, Math.tan(angle), 0, 1, 0, 0];
			}

			default:
				return this.identity();
		}
	}
}
