// API base URL for our proxy server
// Use relative URL in production for Netlify functions, fallback to local dev server
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/api'
  : 'http://localhost:3001/api';

// API error handling is done inline in each function

// Model identifiers are now handled by the proxy server

// Types for model parameters
export interface TextToImageParams {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  seed?: number;
}

export interface InpaintingParams {
  prompt: string;
  image: string; // base64 or URL
  mask: string; // base64 or URL
  negative_prompt?: string;
  num_inference_steps?: number;
  guidance_scale?: number;
  scheduler?: string;
  seed?: number;
}

/**
 * Generate an image from text prompt using Stable Diffusion 3.5
 */
export const generateImage = async (params: TextToImageParams): Promise<string[]> => {
  try {
    // First, create the prediction
    const createResponse = await fetch(`${API_BASE_URL}/text-to-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          prompt: params.prompt,
          negative_prompt: params.negative_prompt || '',
          width: params.width || 512,
          height: params.height || 512,
          num_inference_steps: params.num_inference_steps || 25,
          guidance_scale: params.guidance_scale || 7.5,
          seed: params.seed || Math.floor(Math.random() * 1000000),
        },
      }),
    });

    if (!createResponse.ok) {
      try {
        const errorText = await createResponse.text();
        console.error('Error response from text-to-image API:', errorText);
        // Try to parse as JSON, but fall back to using the raw text if it fails
        let errorMessage = 'Failed to create prediction';
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) errorMessage = errorData.error;
        } catch {
          // If parsing fails, use the raw error text (truncated if too long)
          errorMessage = `${errorMessage}: ${errorText.substring(0, 100)}`;
        }
        throw new Error(errorMessage);
      } catch {
        throw new Error(`Failed to create prediction: ${createResponse.status} ${createResponse.statusText}`);
      }
    }

    const prediction = await createResponse.json();
    
    // Poll for the prediction result
    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const statusResponse = await fetch(`${API_BASE_URL}/predictions/${prediction.id}`);
      if (!statusResponse.ok) {
        throw new Error('Failed to check prediction status');
      }
      
      result = await statusResponse.json();
    }
    
    if (result.status === 'failed') {
      throw new Error(result.error || 'Prediction failed');
    }
    
    return result.output as string[];
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};

/**
 * Inpaint an image using Stable Diffusion inpainting model
 */
export const inpaintImage = async (params: InpaintingParams): Promise<string[]> => {
  try {
    console.log('Calling inpainting API with params:', {
      prompt: params.prompt,
      // Don't log full base64 strings as they're too large
      imageLength: params.image ? params.image.length : 0,
      maskLength: params.mask ? params.mask.length : 0,
      negative_prompt: params.negative_prompt || '',
      num_inference_steps: params.num_inference_steps || 25,
      guidance_scale: params.guidance_scale || 7.5,
      scheduler: params.scheduler || 'DPMSolverMultistep',
      seed: params.seed || Math.floor(Math.random() * 1000000),
    });
    
    // First, create the prediction
    const createResponse = await fetch(`${API_BASE_URL}/inpainting`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          prompt: params.prompt,
          image: params.image,
          mask: params.mask,
          negative_prompt: params.negative_prompt || '',
          num_inference_steps: params.num_inference_steps || 25,
          guidance_scale: params.guidance_scale || 7.5,
          scheduler: params.scheduler || 'DPMSolverMultistep',
          seed: params.seed || Math.floor(Math.random() * 1000000),
        },
      }),
    });

    console.log('Inpainting API response status:', createResponse.status);
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Error response from inpainting API:', errorText);
      // Try to parse as JSON, but fall back to using the raw text if it fails
      let errorMessage = 'Failed to create prediction';
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) errorMessage = errorData.error;
      } catch {
        // If parsing fails, use the raw error text
        errorMessage = `${errorMessage}: ${errorText}`;
      }
      throw new Error(errorMessage);
    }

    const prediction = await createResponse.json();
    
    // Poll for the prediction result
    let result = prediction;
    let pollAttempts = 0;
    const maxPollAttempts = 60; // 60 seconds maximum
    
    while (result.status !== 'succeeded' && result.status !== 'failed' && pollAttempts < maxPollAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      pollAttempts++;
      
      const statusResponse = await fetch(`${API_BASE_URL}/predictions/${prediction.id}`);
      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        console.error(`Failed to check prediction status (attempt ${pollAttempts}):`, statusResponse.status, errorText);
        
        // If it's a 404, wait a bit longer and try again (server might still be processing)
        if (statusResponse.status === 404 && pollAttempts < 5) {
          console.log(`Prediction not found yet, waiting longer (attempt ${pollAttempts}/5)...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 more seconds
          continue;
        }
        
        throw new Error(`Failed to check prediction status: ${statusResponse.status} - ${errorText}`);
      }
      
      result = await statusResponse.json();
      console.log(`Poll attempt ${pollAttempts}: status = ${result.status}`);
    }
    
    if (pollAttempts >= maxPollAttempts) {
      throw new Error('Prediction timed out after 60 seconds');
    }
    
    if (result.status === 'failed') {
      throw new Error(result.error || 'Prediction failed');
    }
    
    return result.output as string[];
  } catch (error) {
    console.error('Error inpainting image:', error);
    throw error;
  }
};
