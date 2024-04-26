import resolve from '@rollup/plugin-node-resolve' // 查找外部模块（node modules）
import commonjs from "@rollup/plugin-commonjs"; // 解析commonjs模块
import {terser} from "rollup-plugin-terser"; // 代码压缩
import cleanupPlugin from "rollup-plugin-cleanup";  // 去除无效代码

export default [
    {
        input:'./src/index.js',
        output:{
            dir: 'dist',
            format: 'cjs',
            entryFileNames: '[name].cjs.js'
        },
        plugins:[resolve(), commonjs(), terser(), cleanupPlugin()]
    },
    {
        input:'./src/index.js',
        output:{
            dir:'dist',
            format: 'esm',
            entryFileNames: '[name].esm.js'
        },
        plugins: [resolve(), commonjs(), terser(), cleanupPlugin()]
    }
]
