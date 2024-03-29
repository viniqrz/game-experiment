import esbuild from "esbuild";
import liveServer from "live-server";

const start = async (host, port) => {
  const ctx = await esbuild.context({
    bundle: true,
    minify: true,
    target: "es2015",
    outfile: "dist/index.js",
    entryPoints: ["src/index.ts"],
    sourcemap: true,
  });

  await ctx.watch();
  // await ctx.serve({ servedir: "dist", host, port });

  const params = {
    port, // Set the server port. Defaults to 8080.
    host, // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
    root: "dist", // Set root directory that's being served. Defaults to cwd.
    open: false, // When false, it won't load your browser by default.
    ignore: "scss,my/templates", // comma-separated string for paths to ignore
    file: "index.html", // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
    wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
    mount: [["/components", "./node_modules"]], // Mount a directory to a route.
    logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
    middleware: [
      function (req, res, next) {
        next();
      },
    ], // Takes an array of Connect-compatible middleware that are injected into the server middleware stack
  };

  liveServer.start(params);
};

start("localhost", 8000);
