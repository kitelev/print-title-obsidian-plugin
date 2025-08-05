import esbuild from 'esbuild';
import process from 'process';

const isProd = process.argv[2] === 'production';

esbuild.build({
    entryPoints: ['src/main.ts'],
    bundle: true,
    external: ['obsidian'],
    format: 'cjs',
    target: 'es2016',
    logLevel: 'info',
    sourcemap: isProd ? false : 'inline',
    treeShaking: true,
    outfile: 'main.js',
}).catch(() => process.exit(1));