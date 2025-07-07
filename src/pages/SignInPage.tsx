import { Box, Container, Heading } from '@chakra-ui/react';
import { SignIn } from '@clerk/clerk-react';

const SignInPage = () => {
  return (
    <Container maxW="md" py={12}>
      <Box textAlign="center" mb={8}>
        <Heading as="h1" size="xl" color="white" mb={4}>
          Sign In
        </Heading>
      </Box>
      <Box display="flex" justifyContent="center">
        <SignIn 
          routing="path"
          path="/sign-in"
          redirectUrl="/"
          appearance={{
            elements: {
              formButtonPrimary: {
                backgroundColor: '#00D4FF',
                '&:hover': {
                  backgroundColor: '#00B8E6'
                }
              }
            }
          }}
        />
      </Box>
    </Container>
  );
};

export default SignInPage;
