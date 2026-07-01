import {
	GpuScene,
	GpuSceneStats,
	Svg2GPUCompileOptions,
	Svg2GPUOptions,
} from "../types";
import { GeometryBuilder } from "./GeometryBuilder";
import { SVGParser } from "./SvgParser";
import { StyleResolver } from "./StyleResolver";
import { WebGPURenderer } from "./WebGPURenderer";

export class Svg2GPU {
	readonly ready: Promise<void>;

	private canvas: HTMLCanvasElement;
	private renderer: WebGPURenderer | null = null;
	private scene: GpuScene | null = null;
	private options: Svg2GPUOptions;

	constructor(rootElementId: string, options: Svg2GPUOptions) {
		this.options = options;
		this.canvas = this.resolveCanvas(rootElementId, options.canvas);
		this.ready = this.initialize();
	}

	static compile(svgString: string, options: Svg2GPUCompileOptions = {}): GpuScene {
		const document = SVGParser.parseDocument(svgString);
		const resolvedScene = StyleResolver.resolve(document.children, document.metadata);
		return GeometryBuilder.build(resolvedScene, {
			flattenTolerance: options.flattenTolerance,
		});
	}

	async update(svgString: string): Promise<void> {
		this.options = {
			...this.options,
			svg: svgString,
		};
		this.scene = Svg2GPU.compile(svgString, {
			flattenTolerance: this.options.flattenTolerance,
		});
		await this.ready;
		this.renderer?.setScene(this.scene);
		this.render();
	}

	render(): void {
		this.renderer?.render();
	}

	resize(): void {
		this.renderer?.resize();
	}

	destroy(): void {
		this.renderer?.destroy();
		this.renderer = null;
	}

	getScene(): GpuScene | null {
		return this.scene;
	}

	getStats(): GpuSceneStats | null {
		return this.scene?.stats ?? null;
	}

	private async initialize(): Promise<void> {
		this.scene = Svg2GPU.compile(this.options.svg, {
			flattenTolerance: this.options.flattenTolerance,
		});
		this.renderer = await WebGPURenderer.create(this.canvas, {
			antialias: this.options.antialias,
			background: this.options.background,
			dpr: this.options.dpr,
			fit: this.options.fit,
		});
		this.renderer.setScene(this.scene);
		this.renderer.render();
	}

	private resolveCanvas(
		rootElementId: string,
		providedCanvas?: HTMLCanvasElement
	): HTMLCanvasElement {
		if (providedCanvas) return providedCanvas;

		const root = document.getElementById(rootElementId);
		if (!root) {
			throw new Error(`Svg2GPU root element "${rootElementId}" was not found.`);
		}

		if (root instanceof HTMLCanvasElement) {
			return root;
		}

		const canvas = document.createElement("canvas");
		canvas.style.display = "block";
		canvas.style.width = "100%";
		canvas.style.height = "100%";
		root.appendChild(canvas);
		return canvas;
	}
}
