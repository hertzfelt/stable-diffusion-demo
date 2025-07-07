import { useState, useRef } from 'react';
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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { InfoIcon, DownloadIcon, EditIcon } from '@chakra-ui/icons';
import { MdFileUpload as UploadIcon } from 'react-icons/md';
import { inpaintImage } from '../services/replicateService';
import { addGalleryItem } from '../services/galleryService';
import DrawMask from '../components/DrawMask';
import type { InpaintingParams } from '../services/replicateService';

// Helper function to download an image from a URL
const downloadImage = async (imageUrl: string, filename: string = 'inpainted-image.png') => {
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

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., 'data:image/png;base64,')
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

const InpaintingPage = () => {
  const toast = useToast();
  const [prompt, setPrompt] = useState('');
  const [isInpainting, setIsInpainting] = useState(false);
  const [inpaintedImage, setInpaintedImage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // File uploads
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [maskImage, setMaskImage] = useState<File | null>(null);
  const [maskImagePreview, setMaskImagePreview] = useState<string | null>(null);
  
  // Model parameters
  const [settings, setSettings] = useState({
    scheduler: 'DPMSolverMultistep',
    numInferenceSteps: 25,
    guidanceScale: 7.5,
    seed: -1, // -1 means random
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setImagePreview: (url: string) => void, setImageFile?: (file: File) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (setImageFile) {
        setImageFile(file);
      }
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Mask upload is now handled through the drawing interface

  const handleMaskFromDrawing = (maskBase64: string) => {
    setMaskImage(null); // Clear any uploaded file
    setMaskImagePreview(`data:image/png;base64,${maskBase64}`);
    
    // Convert base64 to file for API submission
    const byteString = atob(maskBase64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([ab], { type: 'image/png' });
    const file = new File([blob], 'drawn-mask.png', { type: 'image/png' });
    setMaskImage(file);
  };

  const handleInpaint = async () => {
    if (!originalImage) {
      toast({
        title: 'Original image is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!maskImage) {
      toast({
        title: 'Mask image is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!prompt.trim()) {
      toast({
        title: 'Prompt is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsInpainting(true);
    setApiError(null);
    
    try {
      // Check if API token is configured
      if (!import.meta.env.VITE_REPLICATE_API_TOKEN) {
        throw new Error('Replicate API token is not configured. Please set the VITE_REPLICATE_API_TOKEN environment variable.');
      }
      
      // Convert images to base64
      const originalImageBase64 = await fileToBase64(originalImage);
      const maskImageBase64 = await fileToBase64(maskImage);
      
      // Prepare parameters for the API call
      const params: InpaintingParams = {
        prompt: prompt,
        image: originalImageBase64,
        mask: maskImageBase64,
        num_inference_steps: settings.numInferenceSteps,
        guidance_scale: settings.guidanceScale,
        scheduler: settings.scheduler,
        seed: settings.seed === -1 ? undefined : settings.seed,
      };
      
      // Call the API service
      const images = await inpaintImage(params);
      
      if (images && images.length > 0) {
        setInpaintedImage(images[0]);
        
        // Save to gallery
        addGalleryItem({
          imageUrl: images[0],
          prompt: params.prompt,
          type: 'inpainting',
          parameters: {
            model: 'stable-diffusion-inpainting',
            num_inference_steps: params.num_inference_steps,
            guidance_scale: params.guidance_scale,
            scheduler: params.scheduler,
            seed: params.seed
          }
        });
        
        toast({
          title: 'Image inpainted successfully',
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
        title: 'Failed to inpaint image',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsInpainting(false);
    }
  };

  const handleSettingChange = (setting: string, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const maskFileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Box>
      <Heading mb={6}>Image Inpainting</Heading>
      
      <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
        {/* Left side - Controls */}
        <VStack spacing={6} align="stretch" flex="1">
          <Card bg="gray.800" p={4}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md" mb={2}>1. Upload Original Image</Heading>
                <Box 
                  border="2px dashed" 
                  borderColor="gray.600" 
                  borderRadius="md" 
                  p={4} 
                  textAlign="center"
                  cursor="pointer"
                  onClick={() => fileInputRef.current?.click()}
                  height="200px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="gray.900"
                  position="relative"
                >
                  {originalImagePreview ? (
                    <Image 
                      src={originalImagePreview} 
                      alt="Original" 
                      maxH="100%" 
                      maxW="100%" 
                      objectFit="contain"
                    />
                  ) : (
                    <Text color="gray.400">Click to upload an image</Text>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, setOriginalImagePreview, setOriginalImage)}
                  />
                </Box>
                {originalImagePreview && (
                  <Button 
                    size="sm" 
                    onClick={() => setOriginalImagePreview(null)}
                    variant="outline"
                    alignSelf="center"
                  >
                    Remove Image
                  </Button>
                )}
              </VStack>
            </CardBody>
          </Card>

          <Card bg="gray.800" p={4}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md" mb={2}>2. Create Mask</Heading>
                <Tabs variant="soft-rounded" colorScheme="purple" mb={4} isLazy>
                  <TabList>
                    <Tab>
                      <HStack spacing={2}>
                        <UploadIcon />
                        <Text>Upload Mask</Text>
                      </HStack>
                    </Tab>
                    <Tab>
                      <HStack spacing={2}>
                        <EditIcon />
                        <Text>Draw Mask</Text>
                      </HStack>
                    </Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel px={0}>
                      <Box 
                        border="2px dashed" 
                        borderColor="gray.600" 
                        borderRadius="md" 
                        p={4} 
                        textAlign="center"
                        cursor="pointer"
                        onClick={() => maskFileInputRef.current?.click()}
                        height="200px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        bg="gray.900"
                      >
                        {maskImagePreview ? (
                          <Image 
                            src={maskImagePreview} 
                            alt="Mask" 
                            maxH="100%" 
                            maxW="100%" 
                            objectFit="contain"
                          />
                        ) : (
                          <Text color="gray.400">Click to upload a mask image</Text>
                        )}
                        <input
                          type="file"
                          ref={maskFileInputRef}
                          style={{ display: 'none' }}
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, setMaskImagePreview, setMaskImage)}
                        />
                      </Box>
                      {maskImagePreview && (
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setMaskImage(null);
                            setMaskImagePreview(null);
                          }}
                          variant="outline"
                          alignSelf="center"
                          mt={2}
                        >
                          Remove Mask
                        </Button>
                      )}
                      <Text fontSize="sm" color="gray.400" mt={2}>
                        The mask should be a black and white image where white areas will be inpainted.
                      </Text>
                    </TabPanel>
                    <TabPanel px={0}>
                      {originalImagePreview ? (
                        <DrawMask 
                          imageUrl={originalImagePreview} 
                          onMaskCreated={handleMaskFromDrawing} 
                        />
                      ) : (
                        <Text color="gray.400">
                          Please upload an image first before drawing a mask.
                        </Text>
                      )}
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </VStack>
            </CardBody>
          </Card>

          <FormControl>
            <FormLabel>Prompt (for masked area)</FormLabel>
            <Textarea 
              placeholder="Describe what should appear in the masked area..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              size="lg"
              minHeight="100px"
              bg="gray.800"
              border="1px solid"
              borderColor="gray.700"
              _hover={{ borderColor: 'brand.primary' }}
              _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #330066' }}
            />
          </FormControl>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel>Scheduler</FormLabel>
              <Select 
                value={settings.scheduler} 
                onChange={(e) => handleSettingChange('scheduler', e.target.value)}
                bg="gray.800"
                border="1px solid"
                borderColor="gray.700"
              >
                <option value="DPMSolverMultistep">DPM-Solver Multistep</option>
                <option value="DDIM">DDIM</option>
                <option value="K_EULER">K Euler</option>
                <option value="K_EULER_ANCESTRAL">K Euler Ancestral</option>
              </Select>
            </FormControl>
            
            <FormControl>
              <HStack>
                <FormLabel mb={0}>Seed</FormLabel>
                <Tooltip label="Use -1 for random seed or specify a number for reproducible results">
                  <InfoIcon color="gray.500" />
                </Tooltip>
              </HStack>
              <Flex gap={2}>
                <Input 
                  value={settings.seed === -1 ? '' : settings.seed.toString()} 
                  placeholder="Random"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value.trim();
                    handleSettingChange('seed', value === '' ? -1 : parseInt(value) || 0);
                  }}
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
          </FormControl>
          
          <Button 
            onClick={handleInpaint}
            isLoading={isInpainting}
            loadingText="Inpainting..."
            size="lg"
            bg="brand.primary"
            _hover={{ bg: 'brand.600' }}
            mt={4}
            isDisabled={!originalImage || !maskImage || !prompt.trim()}
          >
            Inpaint Image
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
              {isInpainting ? (
                <VStack spacing={4} p={8}>
                  <Spinner size="xl" color="brand.primary" thickness="4px" />
                  <Text>Inpainting your image...</Text>
                  <Text fontSize="sm" color="gray.400">This may take up to a minute</Text>
                </VStack>
              ) : inpaintedImage ? (
                <Box position="relative" width="100%">
                  <Image 
                    src={inpaintedImage} 
                    alt="Inpainted image" 
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
                    onClick={() => downloadImage(inpaintedImage, `inpainted-${Date.now()}.png`)}
                  />
                </Box>
              ) : (
                <VStack spacing={2} p={8} textAlign="center">
                  <Text color="gray.400">Your inpainted result will appear here</Text>
                  <Text fontSize="sm" color="gray.500">Upload an image and mask, then enter a prompt</Text>
                </VStack>
              )}
            </CardBody>
          </Card>
        </Box>
      </Flex>
    </Box>
  );
};

// Custom Input component that combines HTML input props with Chakra Box props
type InputProps = React.ComponentPropsWithoutRef<'input'> & {
  bg?: string;
  border?: string;
  borderColor?: string;
};

const Input = ({ bg, border, borderColor, ...rest }: InputProps) => (
  <Box
    as="input"
    py={2}
    px={3}
    borderRadius="md"
    fontSize="sm"
    bg={bg}
    border={border}
    borderColor={borderColor}
    {...rest}
  />
);

export default InpaintingPage;
