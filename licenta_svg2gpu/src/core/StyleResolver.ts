import {
	ESVGElementType,
	Matrix2D,
	ResolvedRenderStyle,
	ResolvedScene,
	ResolvedSVGElement,
	SVGDocumentMetadata,
	SVGElmnt,
	SVGStyleProps,
} from "../types";
import { Defaults } from "../utils/Defaults";
import { TransformParser } from "./TransformParser";

export class StyleResolver {
	static resolve(
		children: SVGElmnt[],
		metadata: SVGDocumentMetadata
	): ResolvedScene {
		const rootStyle = this.defaultStyle();
		const rootTransform = TransformParser.identity();

		return {
			metadata,
			children: children.map((child) =>
				this.resolveElement(child, rootStyle, rootTransform)
			),
			diagnostics: [],
		};
	}

	private static resolveElement(
		element: SVGElmnt,
		parentStyle: ResolvedRenderStyle,
		parentTransform: Matrix2D
	): ResolvedSVGElement {
		const style = this.mergeStyle(parentStyle, element);
		const localTransform = TransformParser.parse((element as SVGStyleProps).transform);
		const transform = TransformParser.multiply(parentTransform, localTransform);

		if (element.type === ESVGElementType.GROUP) {
			return {
				type: element.type,
				source: element,
				style,
				transform,
				children: (element.children ?? []).map((child) =>
					this.resolveElement(child, style, transform)
				),
			};
		}

		return {
			type: element.type,
			source: element,
			style,
			transform,
		};
	}

	private static mergeStyle(
		parent: ResolvedRenderStyle,
		element: SVGStyleProps
	): ResolvedRenderStyle {
		const specified = element.specifiedStyle ?? {};
		const opacity =
			(specified.opacity ? element.opacity ?? Defaults.OPACITY : Defaults.OPACITY) *
			parent.opacity;
		const elementFillRule = (element as SVGStyleProps & { fillRule?: ResolvedRenderStyle["fillRule"] }).fillRule;

		return {
			fill: specified.fill ? element.fill : parent.fill,
			fillOpacity: specified.fillOpacity
				? element.fillOpacity ?? Defaults.FILL_OPACITY
				: parent.fillOpacity,
			fillRule: specified.fillRule ? elementFillRule ?? parent.fillRule : parent.fillRule,
			stroke: specified.stroke ? element.stroke : parent.stroke,
			strokeWidth: specified.strokeWidth
				? element.strokeWidth ?? Defaults.STROKE_WIDTH
				: parent.strokeWidth,
			strokeOpacity: specified.strokeOpacity
				? element.strokeOpacity ?? Defaults.STROKE_OPACITY
				: parent.strokeOpacity,
			strokeLinecap: specified.strokeLinecap
				? element.strokeLinecap ?? Defaults.STROKE_LINECAP
				: parent.strokeLinecap,
			strokeLinejoin: specified.strokeLinejoin
				? element.strokeLinejoin ?? Defaults.STROKE_LINEJOIN
				: parent.strokeLinejoin,
			opacity,
			display: specified.display ? element.display ?? Defaults.DISPLAY : parent.display,
			visibility: specified.visibility
				? element.visibility ?? Defaults.VISIBILITY
				: parent.visibility,
		};
	}

	private static defaultStyle(): ResolvedRenderStyle {
		return {
			fill: Defaults.FILL,
			fillOpacity: Defaults.FILL_OPACITY,
			fillRule: Defaults.FILL_RULE,
			stroke: Defaults.STROKE,
			strokeWidth: Defaults.STROKE_WIDTH,
			strokeOpacity: Defaults.STROKE_OPACITY,
			strokeLinecap: Defaults.STROKE_LINECAP,
			strokeLinejoin: Defaults.STROKE_LINEJOIN,
			opacity: Defaults.OPACITY,
			display: Defaults.DISPLAY,
			visibility: Defaults.VISIBILITY,
		};
	}
}
