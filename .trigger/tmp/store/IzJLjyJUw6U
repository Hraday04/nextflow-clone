import {
  task
} from "./chunk-4BTWBZNE.mjs";
import {
  __name,
  init_esm
} from "./chunk-O543HE5X.mjs";

// trigger/extract-frame.ts
init_esm();
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
var execAsync = promisify(exec);
var extractFrameTask = task({
  id: "extract-frame",
  run: /* @__PURE__ */ __name(async (payload) => {
    const { videoUrl, timestamp, frameNumber } = payload;
    try {
      const tempDir = "/tmp/frame-processing";
      await execAsync(`mkdir -p ${tempDir}`);
      const inputPath = path.join(tempDir, "input.mp4");
      const outputPath = path.join(tempDir, "frame.jpg");
      await execAsync(`curl -o ${inputPath} "${videoUrl}"`);
      let frameCommand;
      if (frameNumber !== void 0) {
        frameCommand = `ffmpeg -i ${inputPath} -vf "select=eq(n\\,${frameNumber})" -vframes 1 -y ${outputPath}`;
      } else {
        frameCommand = `ffmpeg -i ${inputPath} -ss ${timestamp} -vframes 1 -y ${outputPath}`;
      }
      await execAsync(frameCommand);
      const outputBuffer = fs.readFileSync(outputPath);
      const outputBase64 = outputBuffer.toString("base64");
      const infoCommand = `ffprobe -v quiet -print_format json -show_format -show_streams ${inputPath}`;
      const { stdout: videoInfo } = await execAsync(infoCommand);
      const info = JSON.parse(videoInfo);
      await execAsync(`rm -rf ${tempDir}`);
      return {
        success: true,
        extractedFrame: `data:image/jpeg;base64,${outputBase64}`,
        base64: outputBase64,
        mimeType: "image/jpeg",
        videoInfo: info,
        extractedAt: timestamp || frameNumber
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
  extractFrameTask
};
//# sourceMappingURL=chunk-E3X6CTIO.mjs.map
