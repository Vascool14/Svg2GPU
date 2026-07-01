/// <reference types="@webgpu/types" />

import {
	Color,
	GeometryBatch,
	GpuScene,
	SVGViewBox,
	Svg2GPUFitMode,
} from "../types";

export type WebGPURendererOptions = {
	antialias?: boolean;
	background?: Color;
	dpr?: number;
	fit?: Svg2GPUFitMode;
};

type BatchResource = {
	batch: GeometryBatch;
	vertexBuffer: GPUBuffer;
	indexBuffer: GPUBuffer;
	indexCount: number;
};

const SHADER = `
struct Uniforms {
	transform: mat4x4<f32>,
};

@group(0) @binding(0)
var<uniform> u: Uniforms;

struct VSIn {
	@location(0) position: vec2<f32>,
	@location(1) color: vec4<f32>,
};

struct VSOut {
	@builtin(position) position: vec4<f32>,
	@location(0) color: vec4<f32>,
};

@vertex
fn vs(in: VSIn) -> VSOut {
	var out: VSOut;
	out.position = u.transform * vec4<f32>(in.position, 0.0, 1.0);
	out.color = in.color;
	return out;
}

@fragment
fn fs(in: VSOut) -> @location(0) vec4<f32> {
	return in.color;
}
`;

const UNIFORM_FLOATS = 16;
const UNIFORM_BYTES = UNIFORM_FLOATS * Float32Array.BYTES_PER_ELEMENT;
const VERTEX_FLOATS = 6;
const VERTEX_BYTES = VERTEX_FLOATS * Float32Array.BYTES_PER_ELEMENT;

export class WebGPURenderer {
	private canvas: HTMLCanvasElement;
	private device: GPUDevice;
	private context: GPUCanvasContext;
	private format: GPUTextureFormat;
	private pipeline: GPURenderPipeline;
	private uniformBuffer: GPUBuffer;
	private bindGroup: GPUBindGroup;
	private batchResources: BatchResource[] = [];
	private msaaTexture: GPUTexture | null = null;
	private scene: GpuScene | null = null;
	private options: Required<WebGPURendererOptions>;

	private constructor(
		canvas: HTMLCanvasElement,
		device: GPUDevice,
		context: GPUCanvasContext,
		format: GPUTextureFormat,
		options: Required<WebGPURendererOptions>
	) {
		this.canvas = canvas;
		this.device = device;
		this.context = context;
		this.format = format;
		this.options = options;

		const shader = this.device.createShaderModule({
			label: "svg2gpu/vertex-color-triangle-shader",
			code: SHADER,
		});

		this.pipeline = this.device.createRenderPipeline({
			label: "svg2gpu/vertex-color-triangle-pipeline",
			layout: "auto",
			vertex: {
				module: shader,
				entryPoint: "vs",
				buffers: [
					{
						arrayStride: VERTEX_BYTES,
						stepMode: "vertex",
						attributes: [
							{
								shaderLocation: 0,
								offset: 0,
								format: "float32x2",
							},
							{
								shaderLocation: 1,
								offset: 2 * Float32Array.BYTES_PER_ELEMENT,
								format: "float32x4",
							},
						],
					},
				],
			},
			fragment: {
				module: shader,
				entryPoint: "fs",
				targets: [
					{
						format: this.format,
						blend: {
							color: {
								srcFactor: "src-alpha",
								dstFactor: "one-minus-src-alpha",
								operation: "add",
							},
							alpha: {
								srcFactor: "one",
								dstFactor: "one-minus-src-alpha",
								operation: "add",
							},
						},
					},
				],
			},
			primitive: {
				topology: "triangle-list",
				cullMode: "none",
			},
			multisample: {
				count: this.sampleCount,
			},
		});

		this.uniformBuffer = this.device.createBuffer({
			label: "svg2gpu/uniform-buffer",
			size: UNIFORM_BYTES,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});
		this.bindGroup = this.device.createBindGroup({
			label: "svg2gpu/bind-group",
			layout: this.pipeline.getBindGroupLayout(0),
			entries: [{ binding: 0, resource: { buffer: this.uniformBuffer } }],
		});

		this.configureContext();
	}

	static async create(
		canvas: HTMLCanvasElement,
		options: WebGPURendererOptions = {}
	): Promise<WebGPURenderer> {
		if (!navigator.gpu) {
			throw new Error("WebGPU is not available in this browser.");
		}

		const adapter = await navigator.gpu.requestAdapter();
		if (!adapter) {
			throw new Error("No WebGPU adapter was found.");
		}

		const device = await adapter.requestDevice();
		const context = canvas.getContext("webgpu");
		if (!context) {
			throw new Error("Could not create a WebGPU canvas context.");
		}

		const format = navigator.gpu.getPreferredCanvasFormat();
		return new WebGPURenderer(canvas, device, context, format, {
			antialias: options.antialias ?? true,
			background: options.background ?? [1, 1, 1, 0],
			dpr: options.dpr ?? globalThis.devicePixelRatio ?? 1,
			fit: options.fit ?? "contain",
		});
	}

	setScene(scene: GpuScene): void {
		this.scene = scene;
		this.disposeBatchResources();
		this.batchResources = scene.batches.map((batch) => ({
			batch,
			vertexBuffer: this.createBuffer(
				"svg2gpu/vertex-buffer",
				this.createVertexData(batch),
				GPUBufferUsage.VERTEX
			),
			indexBuffer: this.createBuffer(
				"svg2gpu/index-buffer",
				batch.indices,
				GPUBufferUsage.INDEX
			),
			indexCount: batch.indices.length,
		}));
	}

	resize(width?: number, height?: number): void {
		const rect = this.canvas.getBoundingClientRect();
		const cssWidth = width ?? (rect.width || this.canvas.clientWidth || 1);
		const cssHeight = height ?? (rect.height || this.canvas.clientHeight || 1);
		const nextWidth = Math.max(
			1,
			Math.floor(cssWidth * this.options.dpr)
		);
		const nextHeight = Math.max(
			1,
			Math.floor(cssHeight * this.options.dpr)
		);

		if (this.canvas.width !== nextWidth) this.canvas.width = nextWidth;
		if (this.canvas.height !== nextHeight) this.canvas.height = nextHeight;

		this.configureContext();
		this.recreateMsaaTexture();
	}

	render(): void {
		if (!this.scene) return;
		this.resize();

		const currentTexture = this.context.getCurrentTexture();
		const currentView = currentTexture.createView();
		const colorAttachment = this.createColorAttachment(currentView);
		const encoder = this.device.createCommandEncoder({
			label: "svg2gpu/render-encoder",
		});
		const pass = encoder.beginRenderPass({
			label: "svg2gpu/render-pass",
			colorAttachments: [colorAttachment],
		});

		pass.setPipeline(this.pipeline);
		pass.setBindGroup(0, this.bindGroup);
		this.writeUniforms(this.scene.metadata.viewBox);

		for (const resource of this.batchResources) {
			if (resource.indexCount === 0) continue;
			pass.setVertexBuffer(0, resource.vertexBuffer);
			pass.setIndexBuffer(resource.indexBuffer, "uint32");
			pass.drawIndexed(resource.indexCount);
		}

		pass.end();
		this.device.queue.submit([encoder.finish()]);
	}

	destroy(): void {
		this.disposeBatchResources();
		this.msaaTexture?.destroy();
		this.msaaTexture = null;
		this.uniformBuffer.destroy();
	}

	private configureContext(): void {
		this.context.configure({
			device: this.device,
			format: this.format,
			alphaMode: "premultiplied",
		});
	}

	private createBuffer(
		label: string,
		data: Float32Array | Uint32Array,
		usage: GPUBufferUsageFlags
	): GPUBuffer {
		const buffer = this.device.createBuffer({
			label,
			size: this.alignTo4(data.byteLength),
			usage: usage | GPUBufferUsage.COPY_DST,
		});
		this.device.queue.writeBuffer(buffer, 0, data);
		return buffer;
	}

	private createVertexData(batch: GeometryBatch): Float32Array {
		const source = batch.vertices;
		const vertexCount = source.length / 2;
		const output = new Float32Array(vertexCount * VERTEX_FLOATS);
		const r = batch.color[0];
		const g = batch.color[1];
		const b = batch.color[2];
		const a = batch.color[3] ?? 1;

		for (let sourceIndex = 0, targetIndex = 0; sourceIndex < source.length; sourceIndex += 2) {
			output[targetIndex++] = source[sourceIndex];
			output[targetIndex++] = source[sourceIndex + 1];
			output[targetIndex++] = r;
			output[targetIndex++] = g;
			output[targetIndex++] = b;
			output[targetIndex++] = a;
		}

		return output;
	}

	private writeUniforms(viewBox: SVGViewBox): void {
		const values = new Float32Array(UNIFORM_FLOATS);
		values.set(this.computeSvgToClipMatrix(viewBox), 0);
		this.device.queue.writeBuffer(this.uniformBuffer, 0, values);
	}

	private computeSvgToClipMatrix(viewBox: SVGViewBox): Float32Array {
		const canvasWidth = Math.max(1, this.canvas.width);
		const canvasHeight = Math.max(1, this.canvas.height);
		let scaleX = canvasWidth / viewBox.width;
		let scaleY = canvasHeight / viewBox.height;
		let offsetX = 0;
		let offsetY = 0;

		if (this.options.fit === "contain" || this.options.fit === "cover") {
			const scale =
				this.options.fit === "contain"
					? Math.min(scaleX, scaleY)
					: Math.max(scaleX, scaleY);
			scaleX = scale;
			scaleY = scale;
		}

		if (this.options.fit === "none") {
			scaleX = 1;
			scaleY = 1;
		}

		const sx = (2 * scaleX) / canvasWidth;
		const sy = (-2 * scaleY) / canvasHeight;
		const tx = -1 + (2 * (offsetX - viewBox.x * scaleX)) / canvasWidth;
		const ty = 1 - (2 * (offsetY - viewBox.y * scaleY)) / canvasHeight;

		return new Float32Array([
			sx, 0, 0, 0,
			0, sy, 0, 0,
			0, 0, 1, 0,
			tx, ty, 0, 1,
		]);
	}

	private createColorAttachment(
		currentView: GPUTextureView
	): GPURenderPassColorAttachment {
		const clearValue = {
			r: this.options.background[0],
			g: this.options.background[1],
			b: this.options.background[2],
			a: this.options.background[3] ?? 1,
		};

		if (this.sampleCount > 1) {
			if (!this.msaaTexture) this.recreateMsaaTexture();
			return {
				view: this.msaaTexture!.createView(),
				resolveTarget: currentView,
				clearValue,
				loadOp: "clear",
				storeOp: "store",
			};
		}

		return {
			view: currentView,
			clearValue,
			loadOp: "clear",
			storeOp: "store",
		};
	}

	private recreateMsaaTexture(): void {
		if (this.sampleCount <= 1) return;
		this.msaaTexture?.destroy();
		this.msaaTexture = this.device.createTexture({
			label: "svg2gpu/msaa-texture",
			size: [Math.max(1, this.canvas.width), Math.max(1, this.canvas.height)],
			sampleCount: this.sampleCount,
			format: this.format,
			usage: GPUTextureUsage.RENDER_ATTACHMENT,
		});
	}

	private disposeBatchResources(): void {
		for (const resource of this.batchResources) {
			resource.vertexBuffer.destroy();
			resource.indexBuffer.destroy();
		}
		this.batchResources = [];
	}

	private alignTo4(size: number): number {
		return Math.max(4, Math.ceil(size / 4) * 4);
	}

	private get sampleCount(): 1 | 4 {
		return this.options.antialias ? 4 : 1;
	}
}
