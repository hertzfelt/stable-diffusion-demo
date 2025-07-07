import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Stability AI color scheme
const colors = {
  brand: {
    primary: '#330066', // Stability AI purple
    50: '#f5e9ff',
    100: '#d9c2ff',
    200: '#bf9aff',
    300: '#a571ff',
    400: '#8c49ff',
    500: '#7322ff',
    600: '#5a0de6',
    700: '#4200b3',
    800: '#2d0080',
    900: '#19004d',
  },
  gray: {
    50: '#f2f2f2',
    100: '#d9d9d9',
    200: '#bfbfbf',
    300: '#a6a6a6',
    400: '#8c8c8c',
    500: '#737373',
    600: '#595959',
    700: '#404040',
    800: '#262626',
    900: '#0d0d0d',
  },
};

// Dark mode configuration
const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

// Font configuration
const fonts = {
  heading: 'Inter, sans-serif',
  body: 'Inter, sans-serif',
};

// Component style overrides
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'medium',
      borderRadius: 'md',
    },
    variants: {
      solid: {
        bg: 'brand.primary',
        color: 'white',
        _hover: {
          bg: 'brand.600',
        },
        _active: {
          bg: 'brand.700',
        },
      },
      outline: {
        borderColor: 'brand.primary',
        color: 'white',
        _hover: {
          bg: 'rgba(51, 0, 102, 0.1)',
        },
      },
      ghost: {
        color: 'white',
        _hover: {
          bg: 'rgba(51, 0, 102, 0.1)',
        },
      },
    },
  },
  Modal: {
    baseStyle: {
      dialog: {
        bg: 'gray.900',
        borderColor: 'brand.primary',
        borderWidth: '1px',
      },
    },
  },
  Link: {
    baseStyle: {
      color: 'brand.200',
      _hover: {
        color: 'brand.100',
        textDecoration: 'none',
      },
    },
  },
};

// Global styles
const styles = {
  global: {
    body: {
      bg: 'gray.900',
      color: 'white',
    },
  },
};

const theme = extendTheme({
  colors,
  config,
  fonts,
  components,
  styles,
});

export default theme;
