import { Box, Button, Flex, Heading, Image, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { HeroImg, TextToImageImg, InpaintingImg, GalleryImg } from '../assets';

const HomePage = () => {
  return (
    <Box>
      <Flex direction={{ base: 'column', lg: 'row' }} align="center" justify="space-between" mb={12} gap={12} width="100%">
        <VStack align={{ base: 'center', lg: 'flex-start' }} spacing={6} flex="1" maxW={{ base: "100%", lg: "600px" }} textAlign={{ base: 'center', lg: 'left' }}>
          <VStack spacing={1} align={{ base: 'center', lg: 'flex-start' }}>
            <Text 
              fontSize="3xl" 
              bgGradient="linear(to-r, brand.200, brand.primary)" 
              bgClip="text" 
              fontWeight="bold" 
              textTransform="uppercase" 
              letterSpacing="wide"
              textShadow="0 0 20px rgba(123, 97, 255, 0.3)"
            >
              Stability AI Showcase
            </Text>
            <Heading 
              size="4xl" 
              lineHeight="shorter" 
              color="white"
              fontWeight="bold"
            >
              Welcome to diemel.systems
            </Heading>
          </VStack>
          <Text fontSize="xl" color="gray.300">
            Experience the power of Stability AI's cutting-edge image generation and editing models through an intuitive, modern interface.
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%" justifyItems={{ base: 'center', md: 'start' }}>
            <Button as={RouterLink} to="/text-to-image" size="lg" colorScheme="purple" bg="brand.primary">
              Text to Image
            </Button>
            <Button as={RouterLink} to="/inpainting" size="lg" variant="outline" borderColor="brand.primary">
              Image Inpainting
            </Button>
          </SimpleGrid>
        </VStack>
        
        <Box 
          borderRadius="md" 
          overflow="hidden" 
          flex="1"
          maxW={{ base: "100%", lg: "500px" }}
          display="flex"
          justifyContent="center"
        >
          <Image
            src={HeroImg}
            alt="AI generated fantasy landscape hero image"
            borderRadius="md"
            maxW={{ base: '100%', lg: '500px' }}
            height="300px"
            objectFit="cover"
          />
        </Box>
      </Flex>
      
      <Box mt={16}>
        <Heading size="lg" mb={6} textAlign="center">Featured Capabilities</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          <FeatureCard 
            title="Text to Image" 
            description="Generate stunning images from text prompts using Stable Diffusion 3.5"
            linkTo="/text-to-image"
            imageSrc={TextToImageImg}
            alt="Text to Image generation preview"
          />
          <FeatureCard 
            title="Image Inpainting" 
            description="Edit specific parts of images with precise control"
            linkTo="/inpainting"
            imageSrc={InpaintingImg}
            alt="Image inpainting preview"
          />
          <FeatureCard 
            title="Gallery & History" 
            description="Browse and manage your generated images"
            linkTo="/gallery"
            imageSrc={GalleryImg}
            alt="Gallery and history preview"
          />
        </SimpleGrid>
      </Box>
    </Box>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  linkTo: string;
  imageSrc: string;
  alt: string;
}

const FeatureCard = ({ title, description, linkTo, imageSrc, alt }: FeatureCardProps) => {
  return (
    <Box 
      borderWidth="1px" 
      borderColor="gray.700" 
      borderRadius="md" 
      overflow="hidden"
      transition="all 0.3s"
      _hover={{ 
        transform: 'translateY(-4px)',
        boxShadow: '0 0 15px rgba(51, 0, 102, 0.3)'
      }}
    >
      <Image
        src={imageSrc}
        alt={alt}
        height="160px"
        width="100%"
        objectFit="cover"
      />
      <Box p={5}>
        <Heading size="md" mb={2}>{title}</Heading>
        <Text color="gray.400" mb={4}>{description}</Text>
        <Button as={RouterLink} to={linkTo} variant="ghost" color="brand.200" size="sm">
          Explore →
        </Button>
      </Box>
    </Box>
  );
};

export default HomePage;
