import { task } from "@trigger.dev/sdk/v3";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

export const extractFrameTask = task({
  id: "extract-frame",
  run: async (payload: {
    videoUrl: string;
    timestamp: number; // in seconds
    frameNumber?: number; // alternative to timestamp
  }) => {
    const { videoUrl, timestamp, frameNumber } = payload;

    try {
      // Create temp directory
      const tempDir = "/tmp/frame-processing";
      await execAsync(`mkdir -p ${tempDir}`);

      // Download input video
      const inputPath = path.join(tempDir, "input.mp4");
      const outputPath = path.join(tempDir, "frame.jpg");

      // Download video using curl
      await execAsync(`curl -o ${inputPath} "${videoUrl}"`);

      // Extract frame using FFmpeg
      let frameCommand;
      if (frameNumber !== undefined) {
        // Extract specific frame number
        frameCommand = `ffmpeg -i ${inputPath} -vf "select=eq(n\\,${frameNumber})" -vframes 1 -y ${outputPath}`;
      } else {
        // Extract frame at specific timestamp
        frameCommand = `ffmpeg -i ${inputPath} -ss ${timestamp} -vframes 1 -y ${outputPath}`;
      }

      await execAsync(frameCommand);

      // Read the output file
      const outputBuffer = fs.readFileSync(outputPath);
      const outputBase64 = outputBuffer.toString("base64");

      // Get video info
      const infoCommand = `ffprobe -v quiet -print_format json -show_format -show_streams ${inputPath}`;
      const { stdout: videoInfo } = await execAsync(infoCommand);
      const info = JSON.parse(videoInfo);

      // Cleanup
      await execAsync(`rm -rf ${tempDir}`);

      return {
        success: true,
        extractedFrame: `data:image/jpeg;base64,${outputBase64}`,
        base64: outputBase64,
        mimeType: "image/jpeg",
        videoInfo: info,
        extractedAt: timestamp || frameNumber,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});
