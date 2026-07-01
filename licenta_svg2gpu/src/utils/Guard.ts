import { Color } from "../types";
import { Logger } from "./Logger";

export class Guard {
	private static exists(val: any): boolean {
		if (val === undefined || val === null) {
			return false;
		}
		return true;
	}

	private static elementToString(el: Element | null | undefined): string {
		if (!el) return "";
		// Example: <rect x="1" y="2" width="3" />
		const attrs = Array.from(el.attributes)
			.map((attr) => `${attr.name}="${attr.value}"`)
			.join(" ");
		return `<${el.tagName.toLowerCase()}${attrs ? " " + attrs : ""}>`;
	}

	/** Checks for a valid number
	 *
	 * @param name - The name of the attribute for error messages
	 * @param val - The value to check
	 * @param el - The element where the attribute is defined, for error context
	 */
	public static number(
		name: string,
		val: any | null,
		el: Element | null
	): number | undefined {
		if (!this.exists(val)) {
			return undefined;
		}
		if (isNaN(val) || !isFinite(val)) {
			Logger.error(
				`Attribute "${name}" is NOT a valid number from "${this.elementToString(el)}".`
			);
			return undefined;
		}
		return val;
	}

	/** Checks for a valid positive number >= 0
	 *
	 * @param name - The name of the attribute for error messages
	 * @param val - The value to check
	 * @param el - The element where the attribute is defined, for error context
	 */
	public static positiveNumber(
		name: string,
		val: any | null,
		el: Element | null
	): number | undefined {
		if (!this.exists(val)) {
			Logger.error(
				`Attribute "${name}" is missing but required in "${this.elementToString(el)}".`
			);
			return undefined;
		}
		if (isNaN(val) || !isFinite(val)) {
			Logger.error(
				`Attribute "${name}" MUST be a valid number in "${this.elementToString(el)}".`
			);
			return undefined;
		}
		if (val < 0) {
			Logger.error(
				`Attribute "${name}" MUST be a positive number in "${this.elementToString(el)}".`
			);
			return undefined;
		}
		return val;
	}

	/** Checks for a valid integer
	 *
	 * @param name - The name of the attribute for error messages
	 * @param val - The value to check
	 * @param el - The element where the attribute is defined, for error context
	 */
	public static integer(
		name: string,
		val: any | null,
		el: Element | null
	): number | undefined {
		if (!this.exists(val)) {
			return undefined;
		}

		if (isNaN(val) || !isFinite(val)) {
			Logger.error(
				`Attribute "${name}" is not a valid number in "${this.elementToString(el)}".`
			);
			return undefined;
		}
		if (!Number.isInteger(val)) {
			Logger.error(
				`Attribute "${name}" is not a valid integer in "${this.elementToString(el)}".`
			);
			return undefined;
		}
		return val;
	}

	/** Checks for a valid, positive integer >= 0
	 *
	 * @param name - The name of the attribute for error messages
	 * @param val - The value to check
	 * @param el - The element where the attribute is defined, for error context
	 */
	public static positiveInteger(
		name: string,
		val: any | null,
		el: Element | null
	): number | undefined {
		if (!this.exists(val)) {
			return undefined;
		}

		if (isNaN(val) || !isFinite(val)) {
			Logger.error(
				`Attribute "${name}" is not a valid number in "${this.elementToString(el)}".`
			);
			return undefined;
		}
		if (val < 0) {
			Logger.error(
				`Attribute "${name}" is not a positive number in "${this.elementToString(el)}".`
			);
			return undefined;
		}
		if (!Number.isInteger(val)) {
			Logger.error(
				`Attribute "${name}" is not a valid integer in "${this.elementToString(el)}".`
			);
			return undefined;
		}
		return val;
	}

	/** Checks for a non-empty array of points (required for polygons/polylines) */
	public static pointArray(
		val?: any,
		name?: string,
		minPoints?: number,
		el?: Element
	): [number, number][] | undefined {
		if (!val) {
			return undefined;
		}

		if (!Array.isArray(val) || val.length < (minPoints ?? 0)) {
			Logger.error(
				`Attribute "${name}" must be an array with at least ${minPoints} points in "${this.elementToString(el)}".`
			);
			return undefined;
		}

		for (const pt of val) {
			if (
				!Array.isArray(pt) ||
				pt.length !== 2 ||
				pt.some((coord) => typeof coord !== "number" || !isFinite(coord))
			) {
				Logger.error(
					`Attribute "${name}" contains an invalid point: ${JSON.stringify(pt)} in "${this.elementToString(el)}".`
				);
				return undefined;
			}
		}

		return val as [number, number][];
	}
}
