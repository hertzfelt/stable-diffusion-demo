# Stability AI Showcase

![Stability AI Logo](https://stability.ai/assets/images/stability-ai-logo.svg)

A modern React application showcasing Stability AI's Stable Diffusion models using the Replicate API. This application demonstrates text-to-image generation and image inpainting capabilities with an intuitive, branded UI built with Chakra UI.

## Features

- **Text-to-Image Generation**: Create stunning images from text prompts using Stable Diffusion 3.5-large
- **Image Inpainting**: Edit specific parts of images with precise control
- **Parameter Adjustment**: Fine-tune model parameters for optimal results
- **Gallery View**: Browse and manage your generated images
- **Modern UI**: Clean, responsive interface with Stability AI branding

## Technologies

- React with TypeScript
- Vite for fast development and building
- Chakra UI for component styling
- React Router for navigation
- Replicate API for AI model integration

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Replicate API token (get one at [replicate.com](https://replicate.com))

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/stability-ai-demo.git
cd stability-ai-demo
```

2. Install dependencies

```bash
npm install
# or
yarn
```

3. Create a `.env` file in the root directory and add your Replicate API token

```
VITE_REPLICATE_API_TOKEN=your_replicate_api_token_here
```

4. Start the development server

```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Usage

### Text-to-Image Generation

1. Navigate to the "Text to Image" page
2. Enter a descriptive prompt
3. Optionally, add a negative prompt to specify what you don't want in the image
4. Adjust parameters like guidance scale and inference steps
5. Click "Generate Image"
6. Download your creation when complete

### Image Inpainting

1. Navigate to the "Inpainting" page
2. Upload an original image
3. Upload or create a mask (white areas will be inpainted)
4. Enter a prompt describing what should appear in the masked area
5. Adjust parameters as needed
6. Click "Inpaint"
7. Download your edited image when complete

## Models

This application uses the following Stable Diffusion models via Replicate:

- **Text-to-Image**: `stability-ai/stable-diffusion-3.5-large`
- **Inpainting**: `stability-ai/stable-diffusion-inpainting`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Stability AI](https://stability.ai) for creating Stable Diffusion
- [Replicate](https://replicate.com) for providing API access to AI models
- [Chakra UI](https://chakra-ui.com) for the component library
