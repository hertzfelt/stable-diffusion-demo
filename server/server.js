const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const Replicate = require('replicate');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.VITE_REPLICATE_API_TOKEN,
});

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for the React app
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Allow both ports
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON request bodies
app.use(express.json({ limit: '50mb' }));

// Proxy endpoint for text-to-image
app.post('/api/text-to-image', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.replicate.com/v1/models/stability-ai/stable-diffusion-3.5-large/predictions',
      req.body,
      {
        headers: {
          'Authorization': `Token ${process.env.VITE_REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying to Replicate API:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'An error occurred while calling the Replicate API',
    });
  }
});

// Helper function to convert base64 to a buffer
const base64ToBuffer = (base64) => {
  // Remove the data:image/png;base64, prefix if it exists
  const base64Data = base64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
  return Buffer.from(base64Data, 'base64');
};

// Store predictions in memory for the polling endpoint
const predictions = {};

// Proxy endpoint for inpainting
app.post('/api/inpainting', async (req, res) => {
  console.log('Inpainting endpoint called');
  console.log('Using API token:', process.env.VITE_REPLICATE_API_TOKEN ? 'Token exists' : 'Token missing');
  console.log('Request body structure:', Object.keys(req.body));
  console.log('Input structure:', req.body.input ? Object.keys(req.body.input) : 'No input field');
  
  // Validate input
  if (!req.body.input || !req.body.input.image || !req.body.input.mask || !req.body.input.prompt) {
    console.error('Missing required input fields');
    return res.status(400).json({ error: 'Missing required input fields' });
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
});

// Endpoint to check prediction status
app.get('/api/predictions/:id', (req, res) => {
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
  res.json({
    id: predictionId,
    status: prediction.status,
    created_at: prediction.created_at,
    completed_at: prediction.completed_at,
    input: prediction.input,
    output: prediction.output,
    error: prediction.error
  });
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
