import {
  task
} from "./chunk-4BTWBZNE.mjs";
import {
  __name,
  init_esm
} from "./chunk-O543HE5X.mjs";

// trigger/tasks/llmtask.ts
init_esm();
var llmTask = task({
  id: "llm-task",
  run: /* @__PURE__ */ __name(async (payload) => {
    console.log("LLM TASK RUNNING", payload);
    return {
      output: `AI Response: ${payload.user_message}`
    };
  }, "run")
});

export {
  llmTask
};
//# sourceMappingURL=chunk-KMGDG3EC.mjs.map
