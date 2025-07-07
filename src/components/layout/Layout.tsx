import { Box } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Box minH="100vh" bg="gray.900">
      <Header />
      <Box 
        as="main" 
        maxW="1400px" 
        mx="auto" 
        px={8} 
        py={8}
        width="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Box width="100%" maxW="1200px">
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
