import esbuild from "esbuild";

const start = async () => {
  const ctx = await esbuild.context({
    bundle: true,
    minify: true,
    target: "es2015",
    outfile: "dist/index.js",
    entryPoints: ["src/index.ts"],
    sourcemap: true,
  });

  await ctx.watch();
  await ctx.serve({ servedir: "dist", host: "localhost", port: 5000 });
};

start();
