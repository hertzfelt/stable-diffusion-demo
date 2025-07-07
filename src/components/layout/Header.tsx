import { Box, Flex, Heading, HStack, Link as ChakraLink } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const Header = () => {
  return (
    <Box as="header" bg="gray.900" borderBottom="1px solid" borderColor="brand.primary" py={4}>
      <Flex maxW="container.xl" mx="auto" px={4} align="center" justify="space-between">
        <Heading as="h1" size="md" color="white">
          <ChakraLink as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
            Stability AI Showcase
          </ChakraLink>
        </Heading>
        
        <HStack spacing={8}>
          <ChakraLink as={RouterLink} to="/text-to-image" color="white" fontWeight="medium">
            Text to Image
          </ChakraLink>
          <ChakraLink as={RouterLink} to="/inpainting" color="white" fontWeight="medium">
            Inpainting
          </ChakraLink>
          <ChakraLink as={RouterLink} to="/gallery" color="white" fontWeight="medium">
            Gallery
          </ChakraLink>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
