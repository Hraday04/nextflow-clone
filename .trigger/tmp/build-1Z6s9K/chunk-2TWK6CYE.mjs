import {
  task
} from "./chunk-4BTWBZNE.mjs";
import {
  __name,
  init_esm
} from "./chunk-O543HE5X.mjs";

// trigger/crop-image.ts
init_esm();
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
var execAsync = promisify(exec);
var cropImageTask = task({
  id: "crop-image",
  run: /* @__PURE__ */ __name(async (payload) => {
    const { imageUrl, x, y, width, height } = payload;
    try {
      const tempDir = "/tmp/crop-processing";
      await execAsync(`mkdir -p ${tempDir}`);
      const inputPath = path.join(tempDir, "input.jpg");
      const outputPath = path.join(tempDir, "output.jpg");
      await execAsync(`curl -o ${inputPath} "${imageUrl}"`);
      const cropCommand = `ffmpeg -i ${inputPath} -vf "crop=${width}:${height}:${x}:${y}" -y ${outputPath}`;
      await execAsync(cropCommand);
      const outputBuffer = fs.readFileSync(outputPath);
      const outputBase64 = outputBuffer.toString("base64");
      await execAsync(`rm -rf ${tempDir}`);
      return {
        success: true,
        croppedImage: `data:image/jpeg;base64,${outputBase64}`,
        base64: outputBase64,
        mimeType: "image/jpeg"
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }, "run")
});

export {
  cropImageTask
};
//# sourceMappingURL=chunk-2TWK6CYE.mjs.map
