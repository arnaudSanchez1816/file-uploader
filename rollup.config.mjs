import commonjs from "@rollup/plugin-commonjs"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import terser from "@rollup/plugin-terser"
import json from "@rollup/plugin-json"

export default [
    {
        input: [
            "js/index.js",
            "js/folder.js",
            "js/signup.js",
            "js/header.js",
            "js/sidebar.js",
        ],
        output: {
            dir: "public",
            entryFileNames: "scripts/[name].min.js",
            chunkFileNames: "scripts/chunks/[name].min.js",
            format: "es",
            sourcemap: true,
        },
        plugins: [
            json(),
            nodeResolve({
                preferBuiltins: true,
            }),
            commonjs(),
            terser(),
        ],
    },
]
