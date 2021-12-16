import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';

export default {
  input: 'src/main.ts',
  output: {
    dir: 'dist',
    format: 'umd',
    name: 'Bluefish'
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    typescript(),
    commonjs(),
    nodeResolve()],
};