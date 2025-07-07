import express, { Request, Response } from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import axios from 'axios';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

// Environment variables interface
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VITE_REPLICATE_API_TOKEN?: string;
    }
  }
}

interface Prediction {
  id: string;
  status: 'processing' | 'succeeded' | 'failed';
  created_at: string;
  completed_at?: string;
  input: any;
  output?: any;
  error?: string;
  replicate_id?: string;
}

interface PredictionStorage {
  [key: string]: Prediction;
}

const app = express();

// In-memory storage for predictions (will be lost on function restart)
// For production, consider using a database like FaunaDB or DynamoDB
const predictions: PredictionStorage = {};

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// Add Clerk authentication middleware to all routes
// This ensures all endpoints require a valid Clerk session
app.use(ClerkExpressRequireAuth());

// Add debug routes
app.get('/', (req, res) => {
  res.json({ status: 'API is running', path: req.path, url: req.url });
});

app.get('/api', (req, res) => {
  res.json({ status: 'API is running', path: req.path, url: req.url });
});

app.get('/api/', (req, res) => {
  res.json({ status: 'API is running', path: req.path, url: req.url });
});

// Helper function to convert base64 to buffer
function base64ToBuffer(base64String: string): Buffer {
  // Remove data URI prefix if present
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

// Text-to-Image endpoint - handle both /text-to-image and /api/text-to-image
app.post('/text-to-image', async (req, res) => {
  await handleTextToImage(req, res);
});

app.post('/api/text-to-image', async (req, res) => {
  await handleTextToImage(req, res);
});

async function handleTextToImage(req: Request, res: Response): Promise<Response | void> {
  // Validate required fields
  if (!req.body.input || !req.body.input.prompt) {
    return res.status(400).json({ error: 'Missing required fields: prompt' });
  }

  try {
    // Generate a unique ID for this prediction
    const predictionId = `pred_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    console.log(`Creating prediction with ID: ${predictionId}`);
    
    // Store initial prediction state
    predictions[predictionId] = {
      id: predictionId,
      status: 'processing',
      created_at: new Date().toISOString(),
      input: req.body.input,
    };
    
    console.log(`Stored prediction ${predictionId} in memory. Total predictions:`, Object.keys(predictions).length);
    
    // Return the prediction ID immediately
    const responseData = {
      id: predictionId,
      status: 'processing',
      created_at: new Date().toISOString(),
      input: req.body.input
    };
    
    console.log(`Returning initial response for ${predictionId}:`, responseData);
    res.json(responseData);
    
    // Process the prediction asynchronously
    try {
      // Create a prediction with the Replicate API
      const createPredictionResponse = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
          input: req.body.input
        },
        {
          headers: {
            'Authorization': `Token ${process.env.VITE_REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('Prediction created:', createPredictionResponse.data);
      
      // Get the prediction ID from the response
      const replicatePredictionId = createPredictionResponse.data.id;
      
      // Store the Replicate prediction ID in our local prediction for reference
      predictions[predictionId].replicate_id = replicatePredictionId;
      
      // Poll for the prediction result
      let predictionResult = createPredictionResponse.data;
      let pollCount = 0;
      const maxPolls = 60; // Maximum number of polls (60 seconds)
      
      while (predictionResult.status !== 'succeeded' && predictionResult.status !== 'failed' && pollCount < maxPolls) {
        // Wait for a second before polling again
        await new Promise(resolve => setTimeout(resolve, 1000));
        pollCount++;
        
        // Check the prediction status
        try {
          const checkStatusResponse = await axios.get(
            `https://api.replicate.com/v1/predictions/${replicatePredictionId}`,
            {
              headers: {
                'Authorization': `Token ${process.env.VITE_REPLICATE_API_TOKEN}`,
              },
            }
          );
          
          predictionResult = checkStatusResponse.data;
          console.log(`Prediction status (poll ${pollCount}/${maxPolls}):`, predictionResult.status);
        } catch (pollError) {
          console.error('Error polling prediction status:', pollError.message);
          if (pollError.response) {
            console.error('Poll response data:', pollError.response.data);
            console.error('Poll response status:', pollError.response.status);
          }
          // Continue polling despite errors
        }
      }
      
      // Update our local prediction with the result
      if (predictionResult.status === 'succeeded') {
        console.log('Prediction succeeded:', predictionResult.output);
        predictions[predictionId].status = 'succeeded';
        predictions[predictionId].output = predictionResult.output;
        predictions[predictionId].completed_at = new Date().toISOString();
      } else if (predictionResult.status === 'failed') {
        console.error('Prediction failed:', predictionResult.error);
        predictions[predictionId].status = 'failed';
        predictions[predictionId].error = predictionResult.error || 'Prediction failed';
        predictions[predictionId].completed_at = new Date().toISOString();
      } else {
        // Timed out
        console.error('Prediction timed out after', maxPolls, 'seconds');
        predictions[predictionId].status = 'failed';
        predictions[predictionId].error = 'Prediction timed out';
        predictions[predictionId].completed_at = new Date().toISOString();
      }
    } catch (error) {
      console.error('Error in async processing:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        console.error('Response headers:', error.response.headers);
      }
      
      // Store detailed error information
      const errorMessage = error.response?.data?.detail || error.message;
      predictions[predictionId].status = 'failed';
      predictions[predictionId].error = errorMessage;
      predictions[predictionId].completed_at = new Date().toISOString();
    }
  } catch (error) {
    console.error('Error using Replicate API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    res.status(500).json({
      error: error.message || 'An error occurred while calling the Replicate API',
    });
  }
}

// Inpainting endpoint - handle both /inpainting and /api/inpainting
app.post('/inpainting', async (req, res) => {
  await handleInpainting(req, res);
});

app.post('/api/inpainting', async (req, res) => {
  await handleInpainting(req, res);
});

async function handleInpainting(req: Request, res: Response): Promise<Response | void> {
  // Validate required fields
  if (!req.body.input || !req.body.input.image || !req.body.input.mask || !req.body.input.prompt) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['image', 'mask', 'prompt'],
      received: Object.keys(req.body.input || {})
    });
  }
  
  try {
    // Store the prediction in memory for status checks
    const predictionId = `pred_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    console.log(`Creating prediction with ID: ${predictionId}`);
    predictions[predictionId] = {
      id: predictionId,
      status: 'processing',
      created_at: new Date().toISOString(),
      input: req.body.input,
    };
    
    console.log(`Stored prediction ${predictionId} in memory. Total predictions:`, Object.keys(predictions).length);
    
    // Return the prediction ID immediately
    // Make sure we're returning a properly formatted prediction object that matches what the frontend expects
    const responseData = {
      id: predictionId,
      status: 'processing',
      created_at: new Date().toISOString(),
      input: req.body.input
    };
    
    console.log(`Returning initial response for ${predictionId}:`, responseData);
    res.json(responseData);
    
    // Process the prediction asynchronously
    try {
      console.log('Processing inpainting request...');
      
      // Convert base64 to data URIs that Replicate can handle
      let imageData = req.body.input.image;
      let maskData = req.body.input.mask;
      
      // Ensure data URIs are properly formatted
      if (!imageData.startsWith('data:')) {
        imageData = `data:image/png;base64,${imageData}`;
      }
      if (!maskData.startsWith('data:')) {
        maskData = `data:image/png;base64,${maskData}`;
      }
      
      // Prepare input for the prediction using base64 images directly
      const modelInput = {
        prompt: req.body.input.prompt,
        image: imageData,
        mask: maskData,
        negative_prompt: req.body.input.negative_prompt || '',
        num_inference_steps: req.body.input.num_inference_steps || 25,
        guidance_scale: req.body.input.guidance_scale || 7.5,
        scheduler: req.body.input.scheduler || 'DPMSolverMultistep',
        seed: req.body.input.seed || Math.floor(Math.random() * 1000000),
      };
      
      console.log('Making request to Replicate API for inpainting with input:', JSON.stringify(modelInput, null, 2));
      
      // Create a prediction with the Replicate API
      const createPredictionResponse = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: "95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3",
          input: modelInput
        },
        {
          headers: {
            'Authorization': `Token ${process.env.VITE_REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('Prediction created:', createPredictionResponse.data);
      
      // Get the prediction ID from the response
      const replicatePredictionId = createPredictionResponse.data.id;
      
      // Store the Replicate prediction ID in our local prediction for reference
      predictions[predictionId].replicate_id = replicatePredictionId;
      
      // Poll for the prediction result
      let predictionResult = createPredictionResponse.data;
      let pollCount = 0;
      const maxPolls = 60; // Maximum number of polls (60 seconds)
      
      while (predictionResult.status !== 'succeeded' && predictionResult.status !== 'failed' && pollCount < maxPolls) {
        // Wait for a second before polling again
        await new Promise(resolve => setTimeout(resolve, 1000));
        pollCount++;
        
        // Check the prediction status
        try {
          const checkStatusResponse = await axios.get(
            `https://api.replicate.com/v1/predictions/${replicatePredictionId}`,
            {
              headers: {
                'Authorization': `Token ${process.env.VITE_REPLICATE_API_TOKEN}`,
              },
            }
          );
          
          predictionResult = checkStatusResponse.data;
          console.log(`Prediction status (poll ${pollCount}/${maxPolls}):`, predictionResult.status);
        } catch (pollError) {
          console.error('Error polling prediction status:', pollError.message);
          if (pollError.response) {
            console.error('Poll response data:', pollError.response.data);
            console.error('Poll response status:', pollError.response.status);
          }
          // Continue polling despite errors
        }
      }
      
      // Update our local prediction with the result
      if (predictionResult.status === 'succeeded') {
        console.log('Prediction succeeded:', predictionResult.output);
        predictions[predictionId].status = 'succeeded';
        predictions[predictionId].output = predictionResult.output;
        predictions[predictionId].completed_at = new Date().toISOString();
      } else if (predictionResult.status === 'failed') {
        console.error('Prediction failed:', predictionResult.error);
        predictions[predictionId].status = 'failed';
        predictions[predictionId].error = predictionResult.error || 'Prediction failed';
        predictions[predictionId].completed_at = new Date().toISOString();
      } else {
        // Timed out
        console.error('Prediction timed out after', maxPolls, 'seconds');
        predictions[predictionId].status = 'failed';
        predictions[predictionId].error = 'Prediction timed out';
        predictions[predictionId].completed_at = new Date().toISOString();
      }
    } catch (error) {
      console.error('Error in async processing:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        console.error('Response headers:', error.response.headers);
      }
      
      // Store detailed error information
      const errorMessage = error.response?.data?.detail || error.message;
      predictions[predictionId].status = 'failed';
      predictions[predictionId].error = errorMessage;
      predictions[predictionId].completed_at = new Date().toISOString();
    }
  } catch (error) {
    console.error('Error using Replicate API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    res.status(500).json({
      error: error.message || 'An error occurred while calling the Replicate API',
    });
  }
}

// Endpoint to check prediction status - handle both /predictions/:id and /api/predictions/:id
app.get('/predictions/:id', (req, res) => {
  handlePredictionStatus(req, res);
});

app.get('/api/predictions/:id', (req, res) => {
  handlePredictionStatus(req, res);
});

function handlePredictionStatus(req: Request, res: Response): Response {
  const predictionId = req.params.id;
  console.log(`Checking status for prediction ${predictionId}`);
  console.log('Available predictions:', Object.keys(predictions));
  
  if (!predictions[predictionId]) {
    console.log(`Prediction ${predictionId} not found in predictions storage`);
    console.log('Full predictions object:', JSON.stringify(predictions, null, 2));
    return res.status(404).json({
      error: 'Prediction not found',
      requested_id: predictionId,
      available_ids: Object.keys(predictions)
    });
  }
  
  // Ensure we're returning a properly formatted prediction object that matches what the frontend expects
  const prediction = predictions[predictionId];
  console.log(`Returning prediction status for ${predictionId}:`, prediction.status);
  
  // Make sure the response format matches what the frontend expects
  return res.json({
    id: predictionId,
    status: prediction.status,
    created_at: prediction.created_at,
    completed_at: prediction.completed_at,
    input: prediction.input,
    output: prediction.output,
    error: prediction.error
  });
}

/**
 * Netlify function handler with Clerk authentication
 * 
 * This function is secured using Clerk's ClerkExpressRequireAuth middleware which:
 * - Validates JWT tokens from Clerk sessions automatically
 * - Provides user context through req.auth for authenticated requests
 * - Rejects requests without valid Clerk sessions with 401 responses
 * 
 * All routes defined in the Express app above are now protected
 * and require a valid Clerk authentication session.
 */
export const handler = serverless(app);
