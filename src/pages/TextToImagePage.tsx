import { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  SimpleGrid,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Textarea,
  VStack,
  Text,
  useToast,
  Image,
  Spinner,
  Card,
  CardBody,
  Select,
  HStack,
  Tooltip,
  IconButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { InfoIcon, DownloadIcon } from '@chakra-ui/icons';
import { generateImage } from '../services/replicateService';
import { addGalleryItem } from '../services/galleryService';
import type { TextToImageParams } from '../services/replicateService';

// Helper function to download an image from a URL
const downloadImage = async (imageUrl: string, filename: string = 'generated-image.png') => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading image:', error);
  }
};

const TextToImagePage = () => {
  const toast = useToast();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Model parameters
  const [settings, setSettings] = useState({
    model: 'stable-diffusion-3.5-large',
    width: 512,
    height: 512,
    numInferenceSteps: 25,
    guidanceScale: 7.5,
    seed: -1, // -1 means random
    negativePrompt: '',
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsGenerating(true);
    setApiError(null);
    
    try {
      // Check if API token is configured
      if (!import.meta.env.VITE_REPLICATE_API_TOKEN) {
        throw new Error('Replicate API token is not configured. Please set the VITE_REPLICATE_API_TOKEN environment variable.');
      }
      
      // Prepare parameters for the API call
      const params: TextToImageParams = {
        prompt: prompt,
        negative_prompt: settings.negativePrompt,
        width: settings.width,
        height: settings.height,
        num_inference_steps: settings.numInferenceSteps,
        guidance_scale: settings.guidanceScale,
        seed: settings.seed === -1 ? undefined : settings.seed,
      };
      
      // Call the API service
      const images = await generateImage(params);
      
      if (images && images.length > 0) {
        setGeneratedImage(images[0]);
        
        // Save to gallery
        addGalleryItem({
          imageUrl: images[0],
          prompt: params.prompt,
          type: 'text-to-image',
          parameters: {
            negative_prompt: params.negative_prompt,
            num_inference_steps: params.num_inference_steps,
            guidance_scale: params.guidance_scale,
            // Store model settings as parameters
            model: 'stable-diffusion-3.5-large',
            seed: params.seed
          }
        });
        
        toast({
          title: 'Image generated successfully',
          description: 'Image has been saved to your gallery',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('No images were returned from the API');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setApiError(errorMessage);
      toast({
        title: 'Failed to generate image',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSettingChange = (setting: string, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <Box>
      <Heading mb={6}>Text to Image Generation</Heading>
      
      <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
        {/* Left side - Controls */}
        <VStack spacing={6} align="stretch" flex="1">
          <FormControl>
            <FormLabel>Prompt</FormLabel>
            <Textarea 
              placeholder="Describe the image you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              size="lg"
              minHeight="120px"
              bg="gray.800"
              border="1px solid"
              borderColor="gray.700"
              _hover={{ borderColor: 'brand.primary' }}
              _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #330066' }}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Negative Prompt</FormLabel>
            <Textarea 
              placeholder="Elements to avoid in the generated image..."
              value={settings.negativePrompt}
              onChange={(e) => handleSettingChange('negativePrompt', e.target.value)}
              size="md"
              minHeight="80px"
              bg="gray.800"
              border="1px solid"
              borderColor="gray.700"
              _hover={{ borderColor: 'brand.primary' }}
              _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #330066' }}
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Model</FormLabel>
            <Select 
              value={settings.model} 
              onChange={(e) => handleSettingChange('model', e.target.value)}
              bg="gray.800"
              border="1px solid"
              borderColor="gray.700"
            >
              <option value="stable-diffusion-3.5-large">Stable Diffusion 3.5 Large</option>
              <option value="stable-diffusion-3.5-medium">Stable Diffusion 3.5 Medium</option>
              <option value="stable-diffusion-3.5-base">Stable Diffusion 3.5 Base</option>
            </Select>
          </FormControl>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel>Width</FormLabel>
              <Select 
                value={settings.width} 
                onChange={(e) => handleSettingChange('width', Number(e.target.value))}
                bg="gray.800"
                border="1px solid"
                borderColor="gray.700"
              >
                <option value={512}>512px</option>
                <option value={768}>768px</option>
                <option value={1024}>1024px</option>
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel>Height</FormLabel>
              <Select 
                value={settings.height} 
                onChange={(e) => handleSettingChange('height', Number(e.target.value))}
                bg="gray.800"
                border="1px solid"
                borderColor="gray.700"
              >
                <option value={512}>512px</option>
                <option value={768}>768px</option>
                <option value={1024}>1024px</option>
              </Select>
            </FormControl>
          </SimpleGrid>
          
          <FormControl>
            <HStack justify="space-between">
              <FormLabel mb={0}>Guidance Scale</FormLabel>
              <Text fontSize="sm" color="gray.400">{settings.guidanceScale}</Text>
            </HStack>
            <Slider 
              min={1} 
              max={20} 
              step={0.1}
              value={settings.guidanceScale} 
              onChange={(val) => handleSettingChange('guidanceScale', val)}
              mt={2}
            >
              <SliderTrack bg="gray.700">
                <SliderFilledTrack bg="brand.primary" />
              </SliderTrack>
              <SliderThumb boxSize={4} bg="white" />
            </Slider>
            <Flex justify="space-between">
              <Text fontSize="xs" color="gray.500">Less creative</Text>
              <Text fontSize="xs" color="gray.500">More creative</Text>
            </Flex>
          </FormControl>
          
          <FormControl>
            <HStack justify="space-between">
              <FormLabel mb={0}>Inference Steps</FormLabel>
              <Text fontSize="sm" color="gray.400">{settings.numInferenceSteps}</Text>
            </HStack>
            <Slider 
              min={10} 
              max={50} 
              step={1}
              value={settings.numInferenceSteps} 
              onChange={(val) => handleSettingChange('numInferenceSteps', val)}
              mt={2}
            >
              <SliderTrack bg="gray.700">
                <SliderFilledTrack bg="brand.primary" />
              </SliderTrack>
              <SliderThumb boxSize={4} bg="white" />
            </Slider>
            <Flex justify="space-between">
              <Text fontSize="xs" color="gray.500">Faster</Text>
              <Text fontSize="xs" color="gray.500">Higher quality</Text>
            </Flex>
          </FormControl>
          
          <FormControl>
            <HStack>
              <FormLabel mb={0}>Seed</FormLabel>
              <Tooltip label="Use -1 for random seed or specify a number for reproducible results">
                <InfoIcon color="gray.500" />
              </Tooltip>
            </HStack>
            <Flex gap={4} align="center">
              <Textarea 
                value={settings.seed === -1 ? '' : settings.seed.toString()} 
                placeholder="Random"
                onChange={(e) => {
                  const value = e.target.value.trim();
                  handleSettingChange('seed', value === '' ? -1 : parseInt(value) || 0);
                }}
                size="sm"
                bg="gray.800"
                border="1px solid"
                borderColor="gray.700"
              />
              <Button 
                onClick={() => handleSettingChange('seed', -1)}
                size="sm"
                variant="outline"
              >
                Random
              </Button>
            </Flex>
          </FormControl>
          
          <Button 
            onClick={handleGenerate}
            isLoading={isGenerating}
            loadingText="Generating..."
            size="lg"
            bg="brand.primary"
            _hover={{ bg: 'brand.600' }}
            mt={4}
          >
            Generate Image
          </Button>
        </VStack>
        
        {/* Right side - Results */}
        <Box flex="1">
          <Card bg="gray.800" borderRadius="md" overflow="hidden" height="100%">
            <CardBody p={0} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
              {apiError && (
                <Alert status="error" variant="solid" borderRadius="md" mb={4}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>API Error</AlertTitle>
                    <AlertDescription fontSize="sm">{apiError}</AlertDescription>
                  </Box>
                </Alert>
              )}
              {isGenerating ? (
                <VStack spacing={4} p={8}>
                  <Spinner size="xl" color="brand.primary" thickness="4px" />
                  <Text>Generating your image...</Text>
                  <Text fontSize="sm" color="gray.400">This may take up to a minute</Text>
                </VStack>
              ) : generatedImage ? (
                <Box position="relative" width="100%">
                  <Image 
                    src={generatedImage} 
                    alt="Generated image" 
                    width="100%" 
                    height="auto"
                  />
                  <IconButton
                    aria-label="Download image"
                    icon={<DownloadIcon />}
                    position="absolute"
                    bottom={4}
                    right={4}
                    colorScheme="blackAlpha"
                    onClick={() => downloadImage(generatedImage, `sd-${Date.now()}.png`)}
                  />
                </Box>
              ) : (
                <VStack spacing={2} p={8} textAlign="center">
                  <Text color="gray.400">Your generated image will appear here</Text>
                  <Text fontSize="sm" color="gray.500">Enter a prompt and click Generate</Text>
                </VStack>
              )}
            </CardBody>
          </Card>
        </Box>
      </Flex>
    </Box>
  );
};

export default TextToImagePage;
