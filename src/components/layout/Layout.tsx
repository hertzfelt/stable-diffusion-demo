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
      <Box as="main" maxW="7xl" mx="auto" px={8} py={8}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
