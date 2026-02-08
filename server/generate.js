import { InferenceClient } from "@huggingface/inference";
import fs from "fs";
import path from "path";

const client = new InferenceClient(process.env.HF_TOKEN);

export async function generateImage(prompt) {
  const image = await client.textToImage({
    model: "stabilityai/stable-diffusion-xl-base-1.0",
    provider: "hf-inference",
    inputs: prompt,
    parameters: {
      width: 512,
      height: 512,
      num_inference_steps: 20,
    },
  });

  const outputPath = path.join(
    "public",
    "generated",
    `door-${Date.now()}.png`
  );

  const buffer = Buffer.from(await image.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);

  return outputPath;
}
