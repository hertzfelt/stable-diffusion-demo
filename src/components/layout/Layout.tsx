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
      <Box as="main" maxW="container.xl" mx="auto" px={4} py={8}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
