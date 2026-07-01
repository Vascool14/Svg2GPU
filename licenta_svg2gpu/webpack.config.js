const path = require("path");
const NpmDtsPlugin = require("npm-dts-webpack-plugin");

const BASE_CONFIG = {
	entry: "./src/index.ts",
	resolve: { extensions: [".ts", ".js"] },
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},
};

// 1st config: UMD build for browser and Node.js
const umdConfig = {
	...BASE_CONFIG,
	output: {
		filename: "svg2gpu.min.js",
		path: path.resolve(__dirname, "lib"),
		library: { name: "svg2gpu", type: "umd" },
		globalObject: "this",
		clean: false,
	},
	plugins: [
		new NpmDtsPlugin({
			output: "lib/index.d.ts",
		}),
	],
};

// 2nd config: ESM build for modern environments
const esmConfig = {
	...BASE_CONFIG,
	output: {
		filename: "svg2gpu.mjs",
		path: path.resolve(__dirname, "lib"),
		library: { type: "module" },
		module: true,
		clean: false,
	},
	experiments: { outputModule: true },
};

module.exports = [
	umdConfig,
	esmConfig
];
