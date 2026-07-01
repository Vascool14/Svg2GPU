declare module 'svg2gpu/core/ColorParser' {
  import { Color } from "svg2gpu/types/index";
  export class ColorParser {
      /**
       * All SVG 1.1 named colors as defined in the HTML specification.
       *
       * Reference: https://www.w3.org/TR/css-color-4/#named-colors
       */
      static readonly HTML_NAMED_COLORS: Record<string, Color>;
      static readonly HEX_VALIDATOR: RegExp;
      static readonly RGB_VALIDATOR: RegExp;
      static readonly HSL_VALIDATOR: RegExp;
      /**
       * Converts an HSL color to RGB(A).
       * @param h - The hue component (0-360)
       * @param s - The saturation component (0-1)
       * @param l - The lightness component (0-1)
       * @param a - The alpha component (0-1)
       * @returns The RGB(A) representation as a {@link Color} array
       */
      static hslToRgba(h: number, s: number, l: number, a?: number): Color;
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
      static parse(str?: string | null): Color | undefined;
      static glColorToRGBA(color?: Color): string;
  }

}
declare module 'svg2gpu/core/GeometryBuilder' {
  import { GpuScene, ResolvedScene } from "svg2gpu/types/index";
  export type GeometryBuilderOptions = {
      flattenTolerance?: number;
  };
  export class GeometryBuilder {
      static build(scene: ResolvedScene, options?: GeometryBuilderOptions): GpuScene;
      private static appendElementBatches;
      private static elementToPath;
      private static rectToContour;
  }

}
declare module 'svg2gpu/core/PathNormalizer' {
  import { Matrix2D, PathCommand, Point } from "svg2gpu/types/index";
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
  export class PathNormalizer {
      static normalizePathData(path: string | PathCommand[], options?: PathNormalizerOptions): NormalizedPath;
      static commandsToPathString(commands: PathCommand[]): string;
      static contourFromPoints(points: Point[] | undefined, closed: boolean, transform?: Matrix2D): NormalizedContour | null;
      static ellipseContour(cx: number, cy: number, rx: number, ry: number, options?: PathNormalizerOptions): NormalizedContour;
      private static pushPoint;
      private static removeDuplicatePoints;
      private static flattenCubic;
      private static flattenQuadratic;
      private static midpoint;
      private static distance;
      private static distanceToLine;
  }

}
declare module 'svg2gpu/core/StyleResolver' {
  import { ResolvedScene, SVGDocumentMetadata, SVGElmnt } from "svg2gpu/types/index";
  export class StyleResolver {
      static resolve(children: SVGElmnt[], metadata: SVGDocumentMetadata): ResolvedScene;
      private static resolveElement;
      private static mergeStyle;
      private static defaultStyle;
  }

}
declare module 'svg2gpu/core/Svg2GPU' {
  import { GpuScene, GpuSceneStats, Svg2GPUCompileOptions, Svg2GPUOptions } from "svg2gpu/types/index";
  export class Svg2GPU {
      readonly ready: Promise<void>;
      private canvas;
      private renderer;
      private scene;
      private options;
      constructor(rootElementId: string, options: Svg2GPUOptions);
      static compile(svgString: string, options?: Svg2GPUCompileOptions): GpuScene;
      update(svgString: string): Promise<void>;
      render(): void;
      resize(): void;
      destroy(): void;
      getScene(): GpuScene | null;
      getStats(): GpuSceneStats | null;
      private initialize;
      private resolveCanvas;
  }

}
declare module 'svg2gpu/core/SvgParser' {
  import { Point, ParsedSVGDocument, SVGElmnt, PathCommand } from "svg2gpu/types/index";
  /**
   * The SVG Parser class.
   *
   * Use the `this.parse()` method to convert an SVG string into an array of SVG elements.
   *
   * This parser supports basic SVG shapes like paths, circles, ellipses, rectangles, polygons, polylines, lines, and text.
   * It handles attributes like `fill`, `stroke`, `stroke-width`, and coordinates, ensuring they are valid and fall within expected ranges.
   * It also supports nested groups (`<g>` elements) and parses their children recursively.
   */
  export class SVGParser {
      static elementToString(el?: Element): string;
      /** Helper: Parse float attribute with fallback */
      static parseFloatAttr(el: Element, name: string, fallback?: number): number | undefined;
      /** Helper: Parse points attribute (for polygon/polyline) */
      static parsePointsAttr(attr: string): Point[];
      private static parsePaint;
      private static parseStyleAttr;
      private static getPresentationValue;
      private static hasPresentationValue;
      private static parseFloatPresentation;
      private static parseCommonStyles;
      private static parseLength;
      private static parseDocumentMetadata;
      private static parseStrokeOnlyStyle;
      private static parseFillRule;
      private static parseDashArray;
      static parsePathDToJSON(d: string): PathCommand[];
      /** Parses **1** SVG sub-tag element */
      static parseElement(el: Element): SVGElmnt | null;
      /**
       * ### The main method to parse an SVG string into an array of SVG elements.
       * @param svgString - The valid SVG string to parse
       * @returns An array of parsed SVG element(s)
       *
       * @example
       * ```typescript
       * const svgString = `<svg xmlns="http://www.w3.org/2000/svg">
       * 	<circle cx="50" cy="50" r="40" fill="red" stroke="black" stroke-width="2" />
       * 	<path d="M10 10 H 90 V 90 H 10 L 10 10" fill="none" stroke="blue" stroke-width="1.5" />
       * </svg>`;
       *
       * const elements = this.parse(svgString);
       * console.log(elements);
       *
       * // Output:
       * [
       *   {
       *     type: 'circle',
       *     cx: 50,
       *     cy: 50,
       *     r: 40,
       *     fill: [1, 0, 0, 1],
       *     stroke: [0, 0, 0, 1],
       *     strokeWidth: 2
       *   },
       *   {
       *     type: 'path',
       *     d: 'M10 10 H 90 V 90 H 10 L 10 10',
       *     fill: undefined,
       *     stroke: [0, 0, 1, 1],
       *     strokeWidth: 1.5
       *   }
       * ]
       * ```
       */
      static parse(svgString: string): SVGElmnt[];
      /**
       * Parses an SVG string and preserves root-level document metadata used by
       * the renderer, especially `viewBox`, `width`, and `height`.
       */
      static parseDocument(svgString: string): ParsedSVGDocument;
  }

}
declare module 'svg2gpu/core/Tessellator' {
  import { ESVGElementType, GeometryBatch, ResolvedRenderStyle } from "svg2gpu/types/index";
  import { NormalizedContour } from "svg2gpu/core/PathNormalizer";
  export class Tessellator {
      static tessellateFill(contours: NormalizedContour[], style: ResolvedRenderStyle, sourceType: ESVGElementType): GeometryBatch[];
      static tessellateStroke(contours: NormalizedContour[], style: ResolvedRenderStyle, sourceType: ESVGElementType): GeometryBatch[];
      private static tessellateContourGroup;
      private static groupClosedContours;
      private static addSegmentQuad;
      private static addJoins;
      private static addBevelJoin;
      private static addCap;
      private static addRoundFan;
      private static addQuad;
      private static addTriangle;
      private static stripClosingPoint;
      private static signedArea;
      private static pointInPolygon;
      private static normalize;
      private static applyAlpha;
  }

}
declare module 'svg2gpu/core/TransformParser' {
  import { Matrix2D, Point } from "svg2gpu/types/index";
  export class TransformParser {
      static identity(): Matrix2D;
      static multiply(left: Matrix2D, right: Matrix2D): Matrix2D;
      static applyToPoint(matrix: Matrix2D, point: Point): Point;
      static parse(transform?: string): Matrix2D;
      private static commandToMatrix;
  }

}
declare module 'svg2gpu/core/WebGPURenderer' {
  import { Color, GpuScene, Svg2GPUFitMode } from "svg2gpu/types/index";
  export type WebGPURendererOptions = {
      antialias?: boolean;
      background?: Color;
      dpr?: number;
      fit?: Svg2GPUFitMode;
  };
  export class WebGPURenderer {
      private canvas;
      private device;
      private context;
      private format;
      private pipeline;
      private uniformBuffer;
      private bindGroup;
      private batchResources;
      private msaaTexture;
      private scene;
      private options;
      private constructor();
      static create(canvas: HTMLCanvasElement, options?: WebGPURendererOptions): Promise<WebGPURenderer>;
      setScene(scene: GpuScene): void;
      resize(width?: number, height?: number): void;
      render(): void;
      destroy(): void;
      private configureContext;
      private createBuffer;
      private createVertexData;
      private writeUniforms;
      private computeSvgToClipMatrix;
      private createColorAttachment;
      private recreateMsaaTexture;
      private disposeBatchResources;
      private alignTo4;
      private get sampleCount();
  }

}
declare module 'svg2gpu/index' {
  import { ColorParser } from 'svg2gpu/core/ColorParser';
  import { GeometryBuilder } from 'svg2gpu/core/GeometryBuilder';
  import type { GeometryBuilderOptions } from 'svg2gpu/core/GeometryBuilder';
  import { PathNormalizer } from 'svg2gpu/core/PathNormalizer';
  import type { NormalizedContour, NormalizedPath, PathNormalizerOptions } from 'svg2gpu/core/PathNormalizer';
  import { StyleResolver } from 'svg2gpu/core/StyleResolver';
  import { Svg2GPU } from 'svg2gpu/core/Svg2GPU';
  import { SVGParser } from 'svg2gpu/core/SvgParser';
  import { Tessellator } from 'svg2gpu/core/Tessellator';
  import { TransformParser } from 'svg2gpu/core/TransformParser';
  import { WebGPURenderer } from 'svg2gpu/core/WebGPURenderer';
  import type { WebGPURendererOptions } from 'svg2gpu/core/WebGPURenderer';
  import { EPathDType, ESVGElementType } from 'svg2gpu/types/index';
  import type { Point, Matrix2D, Color, TStrokeLineCap, TStrokeLineJoin, TVisibility, TDisplay, TFillRule, SVGStyleProps, PathCommand, SVGStrokeOnlyStyleProps, SVGPath, SVGCircle, SVGEllipse, SVGRect, SVGPolygon, SVGPolyline, SVGLine, SVGText, SVGGroup, SVGElmnt, SVGViewBox, SVGDocumentMetadata, ParsedSVGDocument, Svg2GPUDiagnosticLevel, Svg2GPUDiagnostic, ResolvedRenderStyle, ResolvedSVGElement, ResolvedScene, GeometryPrimitiveKind, GeometryBatch, GpuSceneStats, GpuScene, Svg2GPUFitMode, Svg2GPUOptions, Svg2GPUCompileOptions, MeshOutput, LineOutput, WebGLOutput } from 'svg2gpu/types/index';
  import { Defaults } from 'svg2gpu/utils/Defaults';
  import { Guard } from 'svg2gpu/utils/Guard';
  import { Logger } from 'svg2gpu/utils/Logger';
  export { ColorParser, GeometryBuilder, PathNormalizer, StyleResolver, Svg2GPU, SVGParser, Tessellator, TransformParser, WebGPURenderer, EPathDType, ESVGElementType, Defaults, Guard, Logger };
  export type { GeometryBuilderOptions, NormalizedContour, NormalizedPath, PathNormalizerOptions, WebGPURendererOptions, Point, Matrix2D, Color, TStrokeLineCap, TStrokeLineJoin, TVisibility, TDisplay, TFillRule, SVGStyleProps, PathCommand, SVGStrokeOnlyStyleProps, SVGPath, SVGCircle, SVGEllipse, SVGRect, SVGPolygon, SVGPolyline, SVGLine, SVGText, SVGGroup, SVGElmnt, SVGViewBox, SVGDocumentMetadata, ParsedSVGDocument, Svg2GPUDiagnosticLevel, Svg2GPUDiagnostic, ResolvedRenderStyle, ResolvedSVGElement, ResolvedScene, GeometryPrimitiveKind, GeometryBatch, GpuSceneStats, GpuScene, Svg2GPUFitMode, Svg2GPUOptions, Svg2GPUCompileOptions, MeshOutput, LineOutput, WebGLOutput };

}
declare module 'svg2gpu/types/index' {
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
  export type TStrokeLineCap = "butt" | "round" | "square";
  export type TStrokeLineJoin = "miter" | "round" | "bevel";
  export type TVisibility = "visible" | "hidden" | "collapse";
  export type TDisplay = "inline" | "none";
  export type TFillRule = "nonzero" | "evenodd";
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
      z = "z"
  }
  export type PathCommand = {
      type: EPathDType | string;
      params: number[];
  };
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
      GROUP = "group"
  }
  export type SVGPath = SVGStyleProps & {
      type: ESVGElementType.PATH;
      d: any[];
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
      clipPath?: string;
      filter?: string;
  };
  /**
   * Represents a generic SVG element with properties for rendering in WebGL.
   */
  export type SVGElmnt = SVGPath | SVGCircle | SVGEllipse | SVGRect | SVGPolygon | SVGPolyline | SVGLine | SVGText | SVGGroup;
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

}
declare module 'svg2gpu/utils/Defaults' {
  import { Color, TDisplay, TFillRule, TStrokeLineCap, TStrokeLineJoin, TVisibility } from "svg2gpu/types/index";
  export class Defaults {
      /** Fallback viewport width when the root SVG has no width/viewBox. */
      static VIEWBOX_WIDTH: number;
      /** Fallback viewport height when the root SVG has no height/viewBox. */
      static VIEWBOX_HEIGHT: number;
      /** Default value for the stroke-width attribute in SVG elements */
      static STROKE_WIDTH: number;
      /** SVG initial fill paint: black. */
      static FILL: Color;
      /** SVG initial stroke paint: none. */
      static STROKE: Color | undefined;
      /** Default value for the roundness of corners in SVG elements. */
      static ROUNDING: number;
      /** Full opacity - From 0.0 to 1.0 */
      static OPACITY: number;
      /** Default stroke line cap */
      static STROKE_LINECAP: TStrokeLineCap;
      /** Default stroke line join */
      static STROKE_LINEJOIN: TStrokeLineJoin;
      /** Default visibility */
      static VISIBILITY: TVisibility;
      /** Default display */
      static DISPLAY: TDisplay;
      /** Full fill opacity - From 0.0 to 1.0 */
      static FILL_OPACITY: number;
      /** Full stroke opacity - From 0.0 to 1.0 */
      static STROKE_OPACITY: number;
      /** Default fill rule */
      static FILL_RULE: TFillRule;
      /** Default stroke dash offset */
      static STROKE_DASHOFFSET: undefined;
      /** Default stroke dash array */
      static STROKE_DASHARRAY: undefined;
      /** Default transform */
      static TRANSFORM: undefined;
  }

}
declare module 'svg2gpu/utils/Guard' {
  export class Guard {
      private static exists;
      private static elementToString;
      /** Checks for a valid number
       *
       * @param name - The name of the attribute for error messages
       * @param val - The value to check
       * @param el - The element where the attribute is defined, for error context
       */
      static number(name: string, val: any | null, el: Element | null): number | undefined;
      /** Checks for a valid positive number >= 0
       *
       * @param name - The name of the attribute for error messages
       * @param val - The value to check
       * @param el - The element where the attribute is defined, for error context
       */
      static positiveNumber(name: string, val: any | null, el: Element | null): number | undefined;
      /** Checks for a valid integer
       *
       * @param name - The name of the attribute for error messages
       * @param val - The value to check
       * @param el - The element where the attribute is defined, for error context
       */
      static integer(name: string, val: any | null, el: Element | null): number | undefined;
      /** Checks for a valid, positive integer >= 0
       *
       * @param name - The name of the attribute for error messages
       * @param val - The value to check
       * @param el - The element where the attribute is defined, for error context
       */
      static positiveInteger(name: string, val: any | null, el: Element | null): number | undefined;
      /** Checks for a non-empty array of points (required for polygons/polylines) */
      static pointArray(val?: any, name?: string, minPoints?: number, el?: Element): [number, number][] | undefined;
  }

}
declare module 'svg2gpu/utils/Logger' {
  /**
   * Logger utility for logging messages in the svg2gpu library.
   *
   * By default, all log levels are enabled:
   *
   * ```typescript
   * Logger.SHOW_ERRORS = true;
   * Logger.SHOW_WARNINGS = true;
   * Logger.SHOW_DEBUG = true;
   * Logger.SHOW_INFO = true;
   * Logger.SHOW_LOG = true;
   * ```
   *
   * You can control the visibility of each log level by setting these properties to `false`.
   */
  export class Logger {
      static SHOW_ERRORS: boolean;
      static SHOW_WARNINGS: boolean;
      static SHOW_DEBUG: boolean;
      static SHOW_INFO: boolean;
      static SHOW_LOG: boolean;
      static error(message: string, context?: any): void;
      static warn(message: string, context?: any): void;
      static info(message: string, context?: any): void;
      static debug(message: string, context?: any): void;
      static log(message: any, context?: any): void;
  }

}
declare module 'svg2gpu' {
  import main = require('svg2gpu/index');
  export = main;
}