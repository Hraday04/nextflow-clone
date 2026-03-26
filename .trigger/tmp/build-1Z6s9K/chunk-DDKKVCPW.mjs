import {
  task
} from "./chunk-4BTWBZNE.mjs";
import {
  __name,
  init_esm
} from "./chunk-O543HE5X.mjs";

// trigger/tasks/croptask.ts
init_esm();
var cropTask = task({
  id: "crop-task",
  run: /* @__PURE__ */ __name(async (payload) => {
    console.log("CROP TASK RUNNING", payload);
    return {
      output: payload.image_url
    };
  }, "run")
});

export {
  cropTask
};
//# sourceMappingURL=chunk-DDKKVCPW.mjs.map
