import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
// import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import css from "rollup-plugin-css-only";

// eslint-disable-next-line
const production = !process.env.DEBUG;

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;

      process.on("SIGTERM", toExit); // eslint-disable-line
      process.on("exit", toExit); // eslint-disable-line
    },
  };
}

export default {
  input: "src/main.ts",
  output: {
    sourcemap: !production,
    format: "iife",
    name: "app",
    file: "public/build/bundle.js",
  },
  plugins: [
    svelte({
      preprocess: sveltePreprocess({
        sourceMap: !production,
        postcss: {
          plugins: [
            require("tailwindcss"), // eslint-disable-line
            require("autoprefixer"), // eslint-disable-line
          ],
        },
      }),
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
      },
      onwarn: (warning, handler) => {
        const { code } = warning;
        if (code === "css-unused-selector") return;

        handler(warning);
      },
    }),
    // we'll extract any component CSS out into
    // a separate file - better for performance
    css({ output: "bundle.css" }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    commonjs(),
    typescript({
      sourceMap: !production,
      inlineSources: !production,
    }),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    // !production && livereload("public"),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};
