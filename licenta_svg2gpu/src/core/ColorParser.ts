import { Color } from "../types";
import { Logger } from "../utils/Logger";

export class ColorParser {
	/**
	 * All SVG 1.1 named colors as defined in the HTML specification.
	 *
	 * Reference: https://www.w3.org/TR/css-color-4/#named-colors
	 */
	public static readonly HTML_NAMED_COLORS: Record<string, Color> = {
		none: [0, 0, 0, 0],
		transparent: [0, 0, 0, 0],
		aliceblue: [240, 248, 255, 255],
		antiquewhite: [250, 235, 215, 255],
		aqua: [0, 255, 255, 255],
		aquamarine: [127, 255, 212, 255],
		azure: [240, 255, 255, 255],
		beige: [245, 245, 220, 255],
		bisque: [255, 228, 196, 255],
		black: [0, 0, 0, 255],
		blanchedalmond: [255, 235, 205, 255],
		blue: [0, 0, 255, 255],
		blueviolet: [138, 43, 226, 255],
		brown: [165, 42, 42, 255],
		burlywood: [222, 184, 135, 255],
		cadetblue: [95, 158, 160, 255],
		chartreuse: [127, 255, 0, 255],
		chocolate: [210, 105, 30, 255],
		coral: [255, 127, 80, 255],
		cornflowerblue: [100, 149, 237, 255],
		cornsilk: [255, 248, 220, 255],
		crimson: [220, 20, 60, 255],
		cyan: [0, 255, 255, 255],
		darkblue: [0, 0, 139, 255],
		darkcyan: [0, 139, 139, 255],
		darkgoldenrod: [184, 134, 11, 255],
		darkgray: [169, 169, 169, 255],
		darkgreen: [0, 100, 0, 255],
		darkgrey: [169, 169, 169, 255],
		darkkhaki: [189, 183, 107, 255],
		darkmagenta: [139, 0, 139, 255],
		darkolivegreen: [85, 107, 47, 255],
		darkorange: [255, 140, 0, 255],
		darkorchid: [153, 50, 204, 255],
		darkred: [139, 0, 0, 255],
		darksalmon: [233, 150, 122, 255],
		darkseagreen: [143, 188, 143, 255],
		darkslateblue: [72, 61, 139, 255],
		darkslategray: [47, 79, 79, 255],
		darkslategrey: [47, 79, 79, 255],
		darkturquoise: [0, 206, 209, 255],
		darkviolet: [148, 0, 211, 255],
		deeppink: [255, 20, 147, 255],
		deepskyblue: [0, 191, 255, 255],
		dimgray: [105, 105, 105, 255],
		dimgrey: [105, 105, 105, 255],
		dodgerblue: [30, 144, 255, 255],
		firebrick: [178, 34, 34, 255],
		floralwhite: [255, 250, 240, 255],
		forestgreen: [34, 139, 34, 255],
		fuchsia: [255, 0, 255, 255],
		gainsboro: [220, 220, 220, 255],
		ghostwhite: [248, 248, 255, 255],
		gold: [255, 215, 0, 255],
		goldenrod: [218, 165, 32, 255],
		gray: [128, 128, 128, 255],
		green: [0, 128, 0, 255],
		greenyellow: [173, 255, 47, 255],
		grey: [128, 128, 128, 255],
		honeydew: [240, 255, 240, 255],
		hotpink: [255, 105, 180, 255],
		indianred: [205, 92, 92, 255],
		indigo: [75, 0, 130, 255],
		ivory: [255, 255, 240, 255],
		khaki: [240, 230, 140, 255],
		lavender: [230, 230, 250, 255],
		lavenderblush: [255, 240, 245, 255],
		lawngreen: [124, 252, 0, 255],
		lemonchiffon: [255, 250, 205, 255],
		lightblue: [173, 216, 230, 255],
		lightcoral: [240, 128, 128, 255],
		lightcyan: [224, 255, 255, 255],
		lightgoldenrodyellow: [250, 250, 210, 255],
		lightgray: [211, 211, 211, 255],
		lightgreen: [144, 238, 144, 255],
		lightgrey: [211, 211, 211, 255],
		lightpink: [255, 182, 193, 255],
		lightsalmon: [255, 160, 122, 255],
		lightseagreen: [32, 178, 170, 255],
		lightskyblue: [135, 206, 250, 255],
		lightslategray: [119, 136, 153, 255],
		lightslategrey: [119, 136, 153, 255],
		lightsteelblue: [176, 196, 222, 255],
		lightyellow: [255, 255, 224, 255],
		lime: [0, 255, 0, 255],
		limegreen: [50, 205, 50, 255],
		linen: [250, 240, 230, 255],
		magenta: [255, 0, 255, 255],
		maroon: [128, 0, 0, 255],
		mediumaquamarine: [102, 205, 170, 255],
		mediumblue: [0, 0, 205, 255],
		mediumorchid: [186, 85, 211, 255],
		mediumpurple: [147, 112, 219, 255],
		mediumseagreen: [60, 179, 113, 255],
		mediumslateblue: [123, 104, 238, 255],
		mediumspringgreen: [0, 250, 154, 255],
		mediumturquoise: [72, 209, 204, 255],
		mediumvioletred: [199, 21, 133, 255],
		midnightblue: [25, 25, 112, 255],
		mintcream: [245, 255, 250, 255],
		mistyrose: [255, 228, 225, 255],
		moccasin: [255, 228, 181, 255],
		navajowhite: [255, 222, 173, 255],
		navy: [0, 0, 128, 255],
		oldlace: [253, 245, 230, 255],
		olive: [128, 128, 0, 255],
		olivedrab: [107, 142, 35, 255],
		orange: [255, 165, 0, 255],
		orangered: [255, 69, 0, 255],
		orchid: [218, 112, 214, 255],
		palegoldenrod: [238, 232, 170, 255],
		palegreen: [152, 251, 152, 255],
		paleturquoise: [175, 238, 238, 255],
		palevioletred: [219, 112, 147, 255],
		papayawhip: [255, 239, 213, 255],
		peachpuff: [255, 218, 185, 255],
		peru: [205, 133, 63, 255],
		pink: [255, 192, 203, 255],
		plum: [221, 160, 221, 255],
		powderblue: [176, 224, 230, 255],
		purple: [128, 0, 128, 255],
		rebeccapurple: [102, 51, 153, 255],
		red: [255, 0, 0, 255],
		rosybrown: [188, 143, 143, 255],
		royalblue: [65, 105, 225, 255],
		saddlebrown: [139, 69, 19, 255],
		salmon: [250, 128, 114, 255],
		sandybrown: [244, 164, 96, 255],
		seagreen: [46, 139, 87, 255],
		seashell: [255, 245, 238, 255],
		sienna: [160, 82, 45, 255],
		silver: [192, 192, 192, 255],
		skyblue: [135, 206, 235, 255],
		slateblue: [106, 90, 205, 255],
		slategray: [112, 128, 144, 255],
		slategrey: [112, 128, 144, 255],
		snow: [255, 250, 250, 255],
		springgreen: [0, 255, 127, 255],
		steelblue: [70, 130, 180, 255],
		tan: [210, 180, 140, 255],
		teal: [0, 128, 128, 255],
		thistle: [216, 191, 216, 255],
		tomato: [255, 99, 71, 255],
		turquoise: [64, 224, 208, 255],
		violet: [238, 130, 238, 255],
		wheat: [245, 222, 179, 255],
		white: [255, 255, 255, 255],
		whitesmoke: [245, 245, 245, 255],
		yellow: [255, 255, 0, 255],
		yellowgreen: [154, 205, 50, 255],
	};

	static readonly HEX_VALIDATOR =
		/^#?(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
	static readonly RGB_VALIDATOR =
		/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d*\.?\d+))?\s*\)$/;
	static readonly HSL_VALIDATOR =
		/^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*(?:,\s*(\d*\.?\d+))?\s*\)$/;

	/**
	 * Converts an HSL color to RGB(A).
	 * @param h - The hue component (0-360)
	 * @param s - The saturation component (0-1)
	 * @param l - The lightness component (0-1)
	 * @param a - The alpha component (0-1)
	 * @returns The RGB(A) representation as a {@link Color} array
	 */
	public static hslToRgba(h: number, s: number, l: number, a: number = 1): Color {
		const c = (1 - Math.abs(2 * l - 1)) * s;
		const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
		const m = l - c / 2;

		let r = 0, g = 0, b = 0;
		if (h < 60) {
			r = c; g = x; b = 0;
		} else if (h < 120) {
			r = x; g = c; b = 0;
		} else if (h < 180) {
			r = 0; g = c; b = x;
		} else if (h < 240) {
			r = 0; g = x; b = c;
		} else if (h < 300) {
			r = x; g = 0; b = c;
		} else {
			r = c; g = 0; b = x;
		}
		
		return [r + m, g + m, b + m, a];
	}

	/**
	 * Takes in an HTML color string and returns a {@link Color} array.
	 *
	 * Supports:
	 * - Hex color strings & numbers (e.g. `#38F`, `#38f8`, `#3388FF`, `#3388FF88`, and even `0x38F`, `0x3388FF88`, etc.)
	 * - RGB colors (e.g. `rgb(51, 136, 255)`, `rgba(51, 136, 255, 0.5)`)
	 * - HSL colors (e.g. `hsl(210, 100%, 60%)`, `hsla(210, 100%, 60%, 0.5)`)
	 * - Named colors (e.g. `red`, `blue`, `lightgreen`)
	 *
	 * Returns {@link Color} array in normalized form (0.0-1.0) or `undefined` if the string is not a valid color.
	 */
	public static parse(str?: string | null): Color | undefined {
		if (!str) return undefined;
		str = str.trim().toLowerCase();

		if (str.startsWith("#") || str.startsWith("0x")) {
			const match = str.match(this.HEX_VALIDATOR);
			if (match) {
				if (str.startsWith("#")) {
					str = str.slice(1);
				} else if (str.startsWith("0x")) {
					str = str.slice(2);
				}
				
				let r = 0, g = 0, b = 0, a = 255;
				
				// Handle 3, 4, 6, and 8 digit hex codes
				if (str.length === 3 || str.length === 4) {
					r = parseInt(str[0] + str[0], 16);
					g = parseInt(str[1] + str[1], 16);
					b = parseInt(str[2] + str[2], 16);
					a = str.length === 4 ? parseInt(str[3] + str[3], 16) : 255;
				} else if (str.length === 6 || str.length === 8) {
					r = parseInt(str.slice(0, 2), 16);
					g = parseInt(str.slice(2, 4), 16);
					b = parseInt(str.slice(4, 6), 16);
					a = str.length === 8 ? parseInt(str.slice(6, 8), 16) : 255;
				}
				
				if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
					Logger.error(`HEX values out of range in "${str}".`);
					return undefined;
				}
				if (a < 0 || a > 255) {
					Logger.error(`Alpha value "${a}" is out of range in "${str}".`);
					return undefined;
				}
				
				// Normalize to 0.0-1.0 range
				return [r / 255, g / 255, b / 255, a / 255];
			}
		} else if (str.startsWith("rgb")) {
			// Parse rgb(a) format
			const match = str.match(this.RGB_VALIDATOR);
			if (match) {
				const r = parseInt(match[1], 10);
				const g = parseInt(match[2], 10);
				const b = parseInt(match[3], 10);
				const a = match[4] ? parseFloat(match[4]) : 1.0; // Keep alpha as-is since it's already 0-1
				
				if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
					Logger.error(`RGB values out of range in "${str}".`);
					return undefined;
				}
				if (a < 0 || a > 1) {
					Logger.error(`Alpha value "${a}" is out of range in "${str}".`);
					return undefined;
				}
				
				// Normalize RGB to 0.0-1.0 range
				return [r / 255, g / 255, b / 255, a];
			}
		} else if (str.startsWith("hsl")) {
			// Parse hsl(a) format
			const match = str.match(this.HSL_VALIDATOR);
			if (match) {
				const h = parseInt(match[1], 10);
				const s = parseInt(match[2], 10);
				const l = parseInt(match[3], 10);
				const a = match[4] ? parseFloat(match[4]) : 1.0; // already normalized to 0-1
				
				if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) {
					Logger.error(`HSL values out of range in "${str}".`);
					return undefined;
				}
				if (a < 0 || a > 1) {
					Logger.error(`Alpha value "${a}" is out of range in "${str}".`);
					return undefined;
				}
				
				// Convert HSL to RGB and return normalized values
				const rgbColor = this.hslToRgba(h, s / 100, l / 100, a);
				
				return rgbColor
			}
		}
		
		// Check for named colors
		const namedColor = this.HTML_NAMED_COLORS[str];
		if (namedColor) {
			// Normalize named color values (assuming they're in 0-255 range)
			return [namedColor[0] / 255, namedColor[1] / 255, namedColor[2] / 255, (namedColor[3] ?? 255) / 255];
		}
		
		Logger.error(`"${str}" is not a valid HTML color string.`);
		return undefined;
	}

	public static glColorToRGBA(color?: Color): string {
		if (!color) return "rgba(0, 0, 0, 0)";
		const [r, g, b, a] = color.map(c => Math.round(c * 255));
		return `rgba(${r}, ${g}, ${b}, ${a})`;
	}
}
