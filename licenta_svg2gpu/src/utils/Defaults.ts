import {
	Color,
	TDisplay,
	TFillRule,
	TStrokeLineCap,
	TStrokeLineJoin,
	TVisibility,
} from "../types";

export class Defaults {
	/** Fallback viewport width when the root SVG has no width/viewBox. */
	static VIEWBOX_WIDTH: number = 300;
	/** Fallback viewport height when the root SVG has no height/viewBox. */
	static VIEWBOX_HEIGHT: number = 150;
	/** Default value for the stroke-width attribute in SVG elements */
	static STROKE_WIDTH: number = 1;
	/** SVG initial fill paint: black. */
	static FILL: Color = [0, 0, 0, 1];
	/** SVG initial stroke paint: none. */
	static STROKE: Color | undefined = undefined;
	/** Default value for the roundness of corners in SVG elements. */
	static ROUNDING: number = 0;
	/** Full opacity - From 0.0 to 1.0 */
	static OPACITY: number = 1;
	/** Default stroke line cap */
	static STROKE_LINECAP: TStrokeLineCap = "butt";
	/** Default stroke line join */
	static STROKE_LINEJOIN: TStrokeLineJoin = "miter";
	/** Default visibility */
	static VISIBILITY: TVisibility = "visible";
	/** Default display */
	static DISPLAY: TDisplay = "inline";
	/** Full fill opacity - From 0.0 to 1.0 */
	static FILL_OPACITY: number = 1;
	/** Full stroke opacity - From 0.0 to 1.0 */
	static STROKE_OPACITY: number = 1;
	/** Default fill rule */
	static FILL_RULE: TFillRule = "nonzero";

	// Undefined:
	/** Default stroke dash offset */
	static STROKE_DASHOFFSET = undefined;
	/** Default stroke dash array */
	static STROKE_DASHARRAY = undefined;
	/** Default transform */
	static TRANSFORM = undefined;
}
