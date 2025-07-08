import { Box, Flex, Heading, HStack, Link as ChakraLink } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { UserButton, SignedIn, SignedOut } from '@clerk/clerk-react';

const Header = () => {
  return (
    <Box as="header" bg="gray.900" borderBottom="1px solid" borderColor="brand.primary" py={4}>
      <Flex maxW="1400px" mx="auto" px={8} align="center" justify="space-between">
        <Heading as="h1" size="md" color="white">
          <ChakraLink as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
            diemel.systems
          </ChakraLink>
        </Heading>
        
        <HStack spacing={8}>
          {/* Navigation Links - Only show for signed in users */}
          <SignedIn>
            <ChakraLink as={RouterLink} to="/text-to-image" color="white" fontWeight="medium">
              Text to Image
            </ChakraLink>
            <ChakraLink as={RouterLink} to="/inpainting" color="white" fontWeight="medium">
              Inpainting
            </ChakraLink>
            <ChakraLink as={RouterLink} to="/gallery" color="white" fontWeight="medium">
              Gallery
            </ChakraLink>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: {
                    width: '32px',
                    height: '32px'
                  }
                }
              }}
            />
          </SignedIn>
          
          {/* Authentication Components */}
          <SignedOut>
            <HStack spacing={4}>
              <ChakraLink as={RouterLink} to="/sign-in" color="white" fontWeight="medium">
                Sign In
              </ChakraLink>
              <ChakraLink as={RouterLink} to="/sign-up" color="white" fontWeight="medium">
                Sign Up
              </ChakraLink>
            </HStack>
          </SignedOut>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
