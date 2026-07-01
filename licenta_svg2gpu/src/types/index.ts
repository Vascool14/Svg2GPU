// 1. Utils

/**
 * Represents an [X, Y] coordinate point as a **tuple**.
 *
 * @example
 * ```typescript
 * const point: Point = [10, 20]; // X=10, Y=20
 * ```
 */
export type Point = [number, number];

/**
 * SVG/Web 2D affine transform matrix in the same layout used by Canvas:
 * `[a, b, c, d, e, f]`, representing:
 *
 * ```text
 * x' = a*x + c*y + e
 * y' = b*x + d*y + f
 * ```
 */
export type Matrix2D = [number, number, number, number, number, number];

/**
 * Represents a color as an array.
 *
 * @note The array is in the format `[R, G, B, A]`, where:
 * - `R` is the red (0.0 - 1.0)
 * - `G` is the green (0.0 - 1.0)
 * - `B` is the blue (0.0 - 1.0)
 * - (optional) - `A` is the alpha - opacity component (0.0 - 1.0)
 *
 * @example
 * ```typescript
 * const color: Color = [1.0, 0.0, 0.0, 0.5]; // Red with 50% opacity;
 * ```
 */
export type Color = [number, number, number] | [number, number, number, number];

// 2. SVG related types

export type TStrokeLineCap = "butt" | "round" | "square";
export type TStrokeLineJoin = "miter" | "round" | "bevel";
export type TVisibility = "visible" | "hidden" | "collapse";
export type TDisplay = "inline" | "none";
export type TFillRule = "nonzero" | "evenodd";

// Shared SVG style props for most elements
export type SVGStyleProps = {
	fill?: Color;
	/** @note decimal number from 0 to 1 */
	fillOpacity?: number;
	stroke?: Color;
	strokeWidth?: number;
	strokeOpacity?: number;
	strokeLinecap?: TStrokeLineCap;
	strokeLinejoin?: TStrokeLineJoin;
	strokeDasharray?: string | number[];
	strokeDashoffset?: number;
	/** @note decimal number from 0 to 1 */
	opacity?: number;
	transform?: string;
	visibility?: TVisibility;
	display?: TDisplay;
	/**
	 * Internal metadata used by the scene resolver to distinguish inherited
	 * styles from parser defaults while preserving the older parsed shape API.
	 */
	specifiedStyle?: Partial<Record<keyof SVGStyleProps | "fillRule", boolean>>;
};

/**
 * Enumeration of SVG path "d" command types.
 */
export enum EPathDType {
	/** Move to */
	M = "M", 
	/** Line to */
	L = "L", 
	/** Horizontal line to */
	H = "H", 
	/** Vertical line to */
	V = "V", 
	/** Cubic Bezier curve */
	C = "C", 
	/** Smooth cubic Bezier curve */
	S = "S", 
	/** Quadratic Bezier curve */
	Q = "Q", 
	/** Smooth quadratic Bezier curve */
	T = "T", 
	/** Arc */
	A = "A", 
	/** Close path */
	Z = "Z", 
	/** Move to (relative) */
	m = "m", 
	/** Line to (relative) */
	l = "l", 
	/** Horizontal line to (relative) */
	h = "h", 
	/** Vertical line to (relative) */
	v = "v", 
	/** Cubic Bezier curve (relative) */
	c = "c", 
	/** Smooth cubic Bezier curve (relative) */
	s = "s", 
	/** Quadratic Bezier curve (relative) */
	q = "q", 
	/** Smooth quadratic Bezier curve (relative) */
	t = "t", 
	/** Arc (relative) */
	a = "a", 
	/** Close path (relative) */
	z = "z", 
}

export type PathCommand = {
	type: EPathDType | string; // string for custom commands
	params: number[];
}

// Some elements (like lines) do not support fill
export type SVGStrokeOnlyStyleProps = Omit<SVGStyleProps, "fill" | "fillOpacity">;

/**
 * Enumeration of SVG elements.
 */
export enum ESVGElementType {
	/**
	 * Represents a generic SVG path element.
	 *
	 * @example
	 * ```html
	 * <path d="M10 10 H 90 V 90 H 10 L 10 10" />
	 * ```
	 *
	 * MDN: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path
	 */
	PATH = "path",
	/**
	 * Represents a circle element in SVG.
	 *
	 * @example
	 * ```html
	 * <circle cx="50" cy="50" r="40" />
	 * ```
	 *
	 * MDN: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle
	 */
	CIRCLE = "circle",
	/**
	 * Represents an ellipse element in SVG.
	 *
	 * @example
	 * ```html
	 * <ellipse cx="50" cy="50" rx="40" ry="20" />
	 * ```
	 *
	 * MDN: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/ellipse
	 */
	ELLIPSE = "ellipse",
	/**
	 * Represents a rectangle element in SVG.
	 *
	 * @example
	 * ```html
	 * <rect x="10" y="10" width="80" height="80" />
	 * ```
	 *
	 * MDN: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect
	 */
	RECT = "rect",
	/**
	 * Represents a polygon element in SVG.
	 *
	 * @example
	 * ```html
	 * <polygon points="50,15 100,100 0,100" />
	 * ```
	 *
	 * MDN: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polygon
	 */
	POLYGON = "polygon",
	/**
	 * Represents a line element in SVG.
	 *
	 * @example
	 * ```html
	 * <line x1="0" y1="0" x2="100" y2="100" />
	 * ```
	 *
	 * MDN: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line
	 */
	LINE = "line",
	/**
	 * Represents a polyline element in SVG.
	 *
	 * @example
	 * ```html
	 * <polyline points="0,0 50,50 100,0" />
	 * // makes a connected line from points: [0,0], [50,50], [100,0]
	 * ```
	 *
	 * MDN: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polyline
	 */
	POLYLINE = "polyline",
	/**
	 * Represents a text element in SVG.
	 *
	 * @example
	 * ```html
	 * <text x="10" y="50">Hello, SVG!</text>
	 * ```
	 *
	 * MDN: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/text
	 */
	TEXT = "text",
	/**
	 * Represents a group element in SVG.
	 * @example
	 * ```html
	 * <g>
	 *   <circle cx="50" cy="50" r="40" />
	 *  <rect x="10" y="10" width="80" height="80" />
	 * </g>
	 */
	GROUP = "group",
}

export type SVGPath = SVGStyleProps & {
	type: ESVGElementType.PATH;
	d: any[]; // todo fix
	fillRule?: TFillRule;
};

export type SVGCircle = SVGStyleProps & {
	type: ESVGElementType.CIRCLE;
	cx: number;
	cy: number;
	r: number;
};

export type SVGEllipse = SVGStyleProps & {
	type: ESVGElementType.ELLIPSE;
	cx: number;
	cy: number;
	rx: number;
	ry: number;
};

export type SVGRect = SVGStyleProps & {
	type: ESVGElementType.RECT;
	x: number;
	y: number;
	width: number;
	height: number;
	rx?: number;
	ry?: number;
};

export type SVGPolygon = SVGStyleProps & {
	type: ESVGElementType.POLYGON;
	points?: [number, number][];
	fillRule?: TFillRule;
};

export type SVGPolyline = SVGStyleProps & {
	type: ESVGElementType.POLYLINE;
	points?: [number, number][];
	fillRule?: TFillRule;
};

export type SVGLine = SVGStrokeOnlyStyleProps & {
	type: ESVGElementType.LINE;
	x1: number;
	y1: number;
	x2: number;
	y2: number;
};

export type SVGText = SVGStyleProps & {
	type: ESVGElementType.TEXT;
	x: number;
	y: number;
	text: string;
	fontSize?: number;
	fontFamily?: string;
	textAnchor?: "start" | "middle" | "end";
	dominantBaseline?: string;
	fontWeight?: string;
	fontStyle?: string;
	letterSpacing?: string | number;
	wordSpacing?: string | number;
};

export type SVGGroup = SVGStyleProps & {
	type: ESVGElementType.GROUP;
	children?: SVGElmnt[];
	opacity?: number;
	transform?: string;
	display?: TDisplay;
	visibility?: TVisibility;
	id?: string;
	class?: string;
	clipPath?: string; // Reference to a clipPath element
	filter?: string; // Reference to a filter element
};

/**
 * Represents a generic SVG element with properties for rendering in WebGL.
 */
export type SVGElmnt =
	| SVGPath
	| SVGCircle
	| SVGEllipse
	| SVGRect
	| SVGPolygon
	| SVGPolyline
	| SVGLine
	| SVGText
	| SVGGroup;

// 3. Document, scene, geometry, and renderer contracts

export type SVGViewBox = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export type SVGDocumentMetadata = {
	viewBox: SVGViewBox;
	width?: number;
	height?: number;
};

export type ParsedSVGDocument = {
	metadata: SVGDocumentMetadata;
	children: SVGElmnt[];
};

export type Svg2GPUDiagnosticLevel = "info" | "warning" | "error";

export type Svg2GPUDiagnostic = {
	level: Svg2GPUDiagnosticLevel;
	message: string;
	element?: string;
};

export type ResolvedRenderStyle = {
	fill?: Color;
	fillOpacity: number;
	fillRule: TFillRule;
	stroke?: Color;
	strokeWidth: number;
	strokeOpacity: number;
	strokeLinecap: TStrokeLineCap;
	strokeLinejoin: TStrokeLineJoin;
	opacity: number;
	display: TDisplay;
	visibility: TVisibility;
};

export type ResolvedSVGElement = {
	type: ESVGElementType;
	source: SVGElmnt;
	style: ResolvedRenderStyle;
	transform: Matrix2D;
	children?: ResolvedSVGElement[];
};

export type ResolvedScene = {
	metadata: SVGDocumentMetadata;
	children: ResolvedSVGElement[];
	diagnostics: Svg2GPUDiagnostic[];
};

export type GeometryPrimitiveKind = "fill" | "stroke";

export type GeometryBatch = {
	kind: GeometryPrimitiveKind;
	vertices: Float32Array;
	indices: Uint32Array;
	color: Color;
	sourceType: ESVGElementType;
};

export type GpuSceneStats = {
	batches: number;
	vertices: number;
	indices: number;
};

export type GpuScene = {
	metadata: SVGDocumentMetadata;
	batches: GeometryBatch[];
	diagnostics: Svg2GPUDiagnostic[];
	stats: GpuSceneStats;
};

export type Svg2GPUFitMode = "contain" | "cover" | "stretch" | "none";

export type Svg2GPUOptions = {
	svg: string;
	antialias?: boolean;
	background?: Color;
	fit?: Svg2GPUFitMode;
	dpr?: number;
	flattenTolerance?: number;
	canvas?: HTMLCanvasElement;
};

export type Svg2GPUCompileOptions = {
	flattenTolerance?: number;
};

// 4. Legacy WebGL related types

/**
 * Mesh output for WebGL rendering.
 */
export type MeshOutput = {
	type: "mesh";
	vertices: Float32Array;
	indices: Uint16Array;
	color: Color;
};

/**
 * Line output for WebGL rendering.
 */
export type LineOutput = {
	type: "lines";
	vertices: Float32Array;
	color: Color;
	width: number;
};

export type WebGLOutput = MeshOutput | LineOutput;
