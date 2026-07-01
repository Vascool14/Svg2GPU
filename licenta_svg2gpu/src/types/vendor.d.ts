declare module "earcut" {
	type Earcut = {
		(
			data: number[] | Float32Array | Float64Array,
			holeIndices?: number[] | null,
			dimensions?: number
		): number[];
		deviation(
			data: number[] | Float32Array | Float64Array,
			holeIndices: number[] | null | undefined,
			dimensions: number,
			triangles: number[]
		): number;
		flatten(data: number[][][]): {
			vertices: number[];
			holes: number[];
			dimensions: number;
		};
	};

	const earcut: Earcut;
	export = earcut;
}
