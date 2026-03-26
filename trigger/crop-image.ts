import { task } from "@trigger.dev/sdk/v3";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

export const cropImageTask = task({
  id: "crop-image",
  run: async (payload: {
    imageUrl: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }) => {
    const { imageUrl, x, y, width, height } = payload;

    try {
      // Create temp directory
      const tempDir = "/tmp/crop-processing";
      await execAsync(`mkdir -p ${tempDir}`);

      // Download input image
      const inputPath = path.join(tempDir, "input.jpg");
      const outputPath = path.join(tempDir, "output.jpg");

      // Download image using curl
      await execAsync(`curl -o ${inputPath} "${imageUrl}"`);

      // Crop image using FFmpeg
      const cropCommand = `ffmpeg -i ${inputPath} -vf "crop=${width}:${height}:${x}:${y}" -y ${outputPath}`;
      await execAsync(cropCommand);

      // Read the output file
      const outputBuffer = fs.readFileSync(outputPath);
      const outputBase64 = outputBuffer.toString("base64");

      // Cleanup
      await execAsync(`rm -rf ${tempDir}`);

      return {
        success: true,
        croppedImage: `data:image/jpeg;base64,${outputBase64}`,
        base64: outputBase64,
        mimeType: "image/jpeg",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
});
