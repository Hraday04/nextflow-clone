import { task } from "@trigger.dev/sdk/v3";

export const llmTask = task({
  id: "llm-task",

  run: async (payload: {
    system_prompt?: string;
    user_message: string;
    images?: string[];
  }) => {
    console.log("LLM TASK RUNNING", payload);

    // TEMP mock
    return {
      output: `AI Response: ${payload.user_message}`,
    };
  },
});
