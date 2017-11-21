import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript";
import json from "rollup-plugin-json";
import replace from "rollup-plugin-replace";

import tsc from "typescript";

export default {
    input: "src/pages/index.tsx",
    output: { file: "static/index.js", format: "cjs" },
    plugins: [
        nodeResolve({ browser: true }),
        commonjs({
            namedExports: {
                "node_modules/react/index.js": ["createElement", "Component"],
                "node_modules/react-dom/index.js": ["render"],
            },
        }),
        typescript({ typescript: tsc }),
        replace({ "process.env.NODE_ENV": '"production"' }),
        json(),
    ],
};
