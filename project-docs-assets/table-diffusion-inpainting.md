# stability-ai / stable-diffusion-inpainting

A powerful inpainting model built on Stable Diffusion 2. It allows you to fill in masked parts of an image using a text prompt. This is ideal for content-aware editing, object removal, or imaginative replacement.

- **Model Type:** Text-to-Image Inpainting
- **Runs:** 20.2M+
- **GPU:** Nvidia A100 (80GB)
- **Cost:** ~$0.0018 per image
- **License:** CreativeML Open RAIL++-M
- **Developers:** Robin Rombach, Patrick Esser

---

## Quick Start (Node.js)

### 1. Use the CLI Tool

```bash
npx create-replicate --model=stability-ai/stable-diffusion-inpainting
```

Or install the client manually:

```bash
npm install replicate
```

### 2. Set Your API Token

```bash
export REPLICATE_API_TOKEN=r8_NFY**********************************
```

> 🔒 Keep this token secret. Learn more about [authentication](https://replicate.com/docs/authentication)

### 3. Example Code

```js
import Replicate from "replicate";
import fs from "node:fs";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const output = await replicate.run(
  "stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3",
  {
    input: {
      mask: "https://replicate.delivery/pbxt/HtGQBqO9MtVbPm0G0K43nsvvjBB0E0PaWOhuNRrRBBT4ttbf/mask.png",
      image: "https://replicate.delivery/pbxt/HtGQBfA5TrqFYZBf0UL18NTqHrzt8UiSIsAkUuMHtjvFDO6p/overture-creations-5sI6fQgYIuo.png",
      width: 512,
      height: 512,
      prompt: "Face of a yellow cat, high resolution, sitting on a park bench",
      scheduler: "DPMSolverMultistep",
      num_outputs: 1,
      guidance_scale: 7.5,
      num_inference_steps: 25
    }
  }
);

// To access or save the output:
console.log(output[0].url());       // Output URL
fs.writeFile("my-image.png", output[0]); // Save image to disk
```

---

## Model Architecture

This model is built on **Stable Diffusion v2**, resumed from the `512-base-ema.ckpt`, and trained with a mask-generation strategy inspired by **LAMA**. It combines:

- Latent VAE representations
- OpenCLIP-ViT/H text encoder
- Cross-attention UNet backbone

Training was performed using **LAION-5B** and its subsets, filtered with NSFW detection. It uses a reconstruction objective and the *v-objective* described in [this paper](https://arxiv.org/abs/2202.00512).

---

## Use Cases

- Object removal
- Context-aware image repair
- Fantasy image editing
- Design iteration with AI-assisted control

Explore the full schema and more examples on [Replicate](https://replicate.com/stability-ai/stable-diffusion-inpainting).