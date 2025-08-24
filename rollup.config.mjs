import commonjs from "@rollup/plugin-commonjs"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import terser from "@rollup/plugin-terser"
import json from "@rollup/plugin-json"

export default [
    {
        input: [
            "src/client/views/index.js",
            "src/client/views/folder.js",
            "src/client/views/sharedFolder.js",
            "src/client/views/signup.js",
            "src/client/views/header.js",
            "src/client/views/sidebar.js",
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
