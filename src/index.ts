import * as test1 from "./tests/test1";
import * as test2 from "./tests/test2";
import * as test3 from "./tests/test3";

//@ts-ignore 2349
// window.LiveReloadOptions = { host: "localhost" };
// import "livereload-js";

const setup = async () => {
  test2.init();
};

setup();
