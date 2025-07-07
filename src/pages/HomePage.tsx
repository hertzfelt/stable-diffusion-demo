import { Box, Button, Flex, Heading, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const HomePage = () => {
  return (
    <Box>
      <Flex direction={{ base: 'column', lg: 'row' }} align="center" justify="space-between" mb={12} gap={8}>
        <VStack align="flex-start" spacing={6} maxW="600px">
          <Heading size="2xl" lineHeight="shorter">
            Stable Diffusion Showcase
          </Heading>
          <Text fontSize="xl" color="gray.300">
            Experience the power of Stability AI's cutting-edge image generation and editing models through an intuitive, modern interface.
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
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
          boxShadow="0 0 20px rgba(51, 0, 102, 0.4)"
          maxW={{ base: "100%", lg: "500px" }}
        >
          {/* Placeholder for a hero image - would be replaced with an actual Stable Diffusion generated image */}
          <Box bg="gray.800" width="100%" height="300px" display="flex" alignItems="center" justifyContent="center">
            <Text color="gray.500">Showcase Image</Text>
          </Box>
        </Box>
      </Flex>
      
      <Box mt={16}>
        <Heading size="lg" mb={6} textAlign="center">Featured Capabilities</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          <FeatureCard 
            title="Text to Image" 
            description="Generate stunning images from text prompts using Stable Diffusion 3.5"
            linkTo="/text-to-image"
          />
          <FeatureCard 
            title="Image Inpainting" 
            description="Edit specific parts of images with precise control"
            linkTo="/inpainting"
          />
          <FeatureCard 
            title="Gallery & History" 
            description="Browse and manage your generated images"
            linkTo="/gallery"
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
}

const FeatureCard = ({ title, description, linkTo }: FeatureCardProps) => {
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
      <Box bg="gray.800" height="160px" />
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
