# stability-ai / stable-diffusion-3.5-large

A state-of-the-art text-to-image model by Stability AI that generates high-resolution images with fine details. It supports a wide range of artistic styles and can produce diverse outputs from the same prompt, enabled by Query-Key Normalization.

- **Model Type:** Text-to-Image
- **Runs:** 1.5M+
- **Cost:** $0.065 per image
- **Commercial Use:** Allowed
- **Resources:** [Weights], [Paper], [License]

---

## Quick Start (Node.js)

Use Replicate's Node.js client library to run the model.

### 1. Install the Replicate Client

```bash
npm install replicate
```

### 2. Set Your API Token

```bash
export REPLICATE_API_TOKEN=r8_NFY**********************************
```

> 🔒 Learn more about [authentication](https://replicate.com/docs/authentication)

### 3. Example Code

```js
import { writeFile } from "fs/promises";
import Replicate from "replicate";

const replicate = new Replicate();

const input = {
  prompt: "~*~aesthetic~*~ #boho #fashion, full-body 30-something woman laying on microfloral grass, candid pose, overlay reads Stable Diffusion 3.5, cheerful cursive typography font"
};

const output = await replicate.run("stability-ai/stable-diffusion-3.5-large", { input });

for (const [index, item] of Object.entries(output)) {
  await writeFile(`output_${index}.webp`, item);
}
```

➡️ This will write the generated image(s) to disk, e.g., `output_0.webp`.

---

## API Options

You can also interact via:

- [Node.js](https://replicate.com/docs/client-libraries/node)
- [Python](https://replicate.com/docs/client-libraries/python)
- [HTTP](https://replicate.com/docs/reference/http)

Explore the full [schema](https://replicate.com/stability-ai/stable-diffusion-3.5-large/versions) for detailed inputs and outputs.