import { task } from "@trigger.dev/sdk/v3";

export const cropTask = task({
  id: "crop-task",

  run: async (payload: { image_url: string }) => {
    console.log("CROP TASK RUNNING", payload);

    return {
      output: payload.image_url,
    };
  },
});
