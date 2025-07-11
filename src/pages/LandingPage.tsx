// Landing page component for unauthenticated users
// Showcases app features and provides authentication entry points
import { Box, Button, Flex, Heading, SimpleGrid, Text, VStack, Icon, HStack, Image } from '@chakra-ui/react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import { FaImage, FaPaintBrush, FaRocket, FaLock, FaUsers, FaBolt } from 'react-icons/fa';
import { HeroImg } from '../assets';

/**
 * Landing page component displayed to unauthenticated users
 * 
 * Features:
 * - Hero section with compelling headline and CTA buttons
 * - Feature showcase grid highlighting app capabilities
 * - Secondary CTA section to drive sign-ups
 * - Uses Clerk authentication components for seamless auth flow
 * - Responsive design that works on all device sizes
 * 
 * Note: All auth buttons use Clerk's modal mode for better UX
 */
const LandingPage = () => {
  return (
    <Box width="100%">
      {/* Hero Section */}
      <Flex direction={{ base: 'column', lg: 'row' }} align="center" justify="space-between" mb={16} gap={12} width="100%">
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
            Experience the power of cutting-edge AI image generation and editing. Create stunning visuals from text prompts, edit images with precision, and explore the future of creative AI.
          </Text>
          <HStack spacing={4} width="100%" justify={{ base: 'center', lg: 'flex-start' }}>
            <SignUpButton mode="modal">
              <Button size="lg" colorScheme="purple" bg="brand.primary" _hover={{ bg: 'brand.primaryHover' }}>
                Get Started Free
              </Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button size="lg" variant="outline" borderColor="brand.primary" color="brand.primary" _hover={{ bg: 'brand.primary', color: 'white' }}>
                Sign In
              </Button>
            </SignInButton>
          </HStack>
        </VStack>
        
        <Box 
          borderRadius="lg" 
          overflow="hidden" 
          flex="1"
          maxW={{ base: "100%", lg: "500px" }}
          display="flex"
          justifyContent="center"
        >
          <Image
            src={HeroImg}
            alt="AI-generated showcase image demonstrating Stability AI capabilities"
            borderRadius="lg"
            maxW={{ base: '100%', lg: '500px' }}
            height="300px"
            objectFit="cover"
            fallback={
              <Box 
                bg="gray.800" 
                width="100%" 
                height="300px" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                borderRadius="lg"
              >
                <VStack spacing={4}>
                  <Icon as={FaImage} w={16} h={16} color="brand.primary" />
                  <Text color="gray.400" fontSize="lg" fontWeight="medium">AI-Generated Showcase</Text>
                </VStack>
              </Box>
            }
            onError={(e) => console.log('Image load error:', e)}
          />
        </Box>
      </Flex>

      {/* Features Section */}
      <Box mb={16}>
        <VStack spacing={8} textAlign="center" mb={12}>
          <Heading size="xl">Unleash Your Creative Potential</Heading>
          <Text fontSize="lg" color="gray.400" maxW="600px">
            Join thousands of creators using AI to bring their imagination to life. No technical expertise required.
          </Text>
        </VStack>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          <FeatureCard 
            icon={FaImage}
            title="Text to Image" 
            description="Transform your ideas into stunning visuals with state-of-the-art Stable Diffusion models"
          />
          <FeatureCard 
            icon={FaPaintBrush}
            title="Image Inpainting" 
            description="Edit and enhance images with AI-powered precision tools for professional results"
          />
          <FeatureCard 
            icon={FaRocket}
            title="Lightning Fast" 
            description="Generate high-quality images in seconds with our optimized AI infrastructure"
          />
          <FeatureCard 
            icon={FaLock}
            title="Secure & Private" 
            description="Your creations are protected with enterprise-grade security and privacy controls"
          />
          <FeatureCard 
            icon={FaUsers}
            title="Community Driven" 
            description="Learn from a vibrant community of creators and share your amazing AI-generated art"
          />
          <FeatureCard 
            icon={FaBolt}
            title="Always Improving" 
            description="Regular updates with the latest AI models and cutting-edge features"
          />
        </SimpleGrid>
      </Box>

      {/* CTA Section */}
      <Box textAlign="center" py={12} bg="gray.900" borderRadius="lg" border="1px solid" borderColor="brand.primary">
        <VStack spacing={6}>
          <Heading size="lg">Ready to Create Something Amazing?</Heading>
          <Text fontSize="lg" color="gray.300" maxW="500px">
            Join our community of creators and start generating incredible AI art in minutes.
          </Text>
          <HStack spacing={4}>
            <SignUpButton mode="modal">
              <Button size="lg" colorScheme="purple" bg="brand.primary" _hover={{ bg: 'brand.primaryHover' }}>
                Start Creating Now
              </Button>
            </SignUpButton>
            <Text color="gray.400">or</Text>
            <SignInButton mode="modal">
              <Button size="lg" variant="ghost" color="brand.primary" _hover={{ bg: 'brand.primary', color: 'white' }}>
                Sign In
              </Button>
            </SignInButton>
          </HStack>
          <Text fontSize="sm" color="gray.500">
            Free to start • No credit card required • Premium features available
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

/**
 * Props interface for the FeatureCard component
 * @param icon - React icon component to display (from react-icons)
 * @param title - Feature title/heading text
 * @param description - Detailed feature description
 */
interface FeatureCardProps {
  icon: React.ComponentType; // React icon component type
  title: string;
  description: string;
}

/**
 * Reusable feature card component for highlighting app capabilities
 * 
 * Features:
 * - Hover animations for better interactivity
 * - Consistent styling with brand colors
 * - Accessible structure with proper heading hierarchy
 * - Icon integration for visual appeal
 * 
 * Used in the features grid section of the landing page
 */
const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <Box 
      borderWidth="1px" 
      borderColor="gray.700" 
      borderRadius="lg" 
      p={6}
      bg="gray.900"
      transition="all 0.3s" // Smooth transition for hover effects
      _hover={{ 
        transform: 'translateY(-4px)', // Subtle lift effect
        boxShadow: '0 0 20px rgba(51, 0, 102, 0.4)', // Purple glow matching brand
        borderColor: 'brand.primary' // Highlight border on hover
      }}
    >
      <VStack spacing={4} align="center" textAlign="center">
        <Icon as={icon} w={8} h={8} color="brand.primary" />
        <Heading size="md">{title}</Heading>
        <Text color="gray.400">{description}</Text>
      </VStack>
    </Box>
  );
};

export default LandingPage;
