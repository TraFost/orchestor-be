import { build } from "esbuild";
import type { BuildOptions } from "esbuild";

const options = {
	bundle: true,
	entryPoints: ["./src/worker.ts"],
	platform: "node",
	outfile: "./dist/_worker.js",
	minify: true,
	format: "esm",
	mainFields: ["module", "main"],
	conditions: ["worker", "browser", "import"],
	external: [
		"fs",
		"path",
		"os",
		"crypto",
		"stream",
		"http",
		"https",
		"url",
		"zlib",
		"punycode",
	],
	logLevel: "info",
} satisfies BuildOptions;

const buildApp = async () => {
	try {
		await build(options);
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};

await buildApp();
