import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  Text,
  Image,
  Card,
  CardBody,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Badge,
  HStack,
  VStack,
  Tabs,
  TabList,
  Tab,
} from '@chakra-ui/react';
import { DownloadIcon, DeleteIcon, ViewIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { getAllGalleryItems, deleteGalleryItem, filterGalleryItems } from '../services/galleryService';
import type { GalleryItem } from '../services/galleryService';

// Helper function to download an image from a URL
const downloadImage = async (imageUrl: string, filename: string = 'stability-ai-image.png') => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading image:', error);
  }
};

const GalleryPage = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  // Current filter type is tracked by the service directly
  
  // Load gallery items on component mount
  useEffect(() => {
    const items = getAllGalleryItems();
    setGalleryItems(items);
  }, []);

  const handleDelete = (id: string) => {
    const success = deleteGalleryItem(id);
    if (success) {
      setGalleryItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleFilterChange = (filter: 'all' | 'text-to-image' | 'inpainting') => {
    const filtered = filterGalleryItems(filter);
    setGalleryItems(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Gallery</Heading>
        <HStack>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} variant="outline">
              Sort By
            </MenuButton>
            <MenuList bg="gray.800" borderColor="gray.700">
              <MenuItem bg="gray.800" _hover={{ bg: 'gray.700' }}>Newest First</MenuItem>
              <MenuItem bg="gray.800" _hover={{ bg: 'gray.700' }}>Oldest First</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      <Tabs variant="soft-rounded" colorScheme="purple" mb={6}>
        <TabList>
          <Tab 
            _active={{ bg: 'brand.primary' }}
            _selected={{ color: 'white', bg: 'brand.primary' }}
            onClick={() => handleFilterChange('all')}
          >
            All
          </Tab>
          <Tab 
            _active={{ bg: 'brand.primary' }}
            _selected={{ color: 'white', bg: 'brand.primary' }}
            onClick={() => handleFilterChange('text-to-image')}
          >
            Text-to-Image
          </Tab>
          <Tab 
            _active={{ bg: 'brand.primary' }}
            _selected={{ color: 'white', bg: 'brand.primary' }}
            onClick={() => handleFilterChange('inpainting')}
          >
            Inpainting
          </Tab>
        </TabList>
      </Tabs>

      {galleryItems.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text color="gray.400">No images found</Text>
          <Text fontSize="sm" color="gray.500" mt={2}>
            Generate some images using the Text to Image or Inpainting tools
          </Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {galleryItems.map((item) => (
            <Card 
              key={item.id} 
              bg="gray.800" 
              overflow="hidden"
              transition="all 0.3s"
              _hover={{ 
                transform: 'translateY(-4px)',
                boxShadow: '0 0 15px rgba(51, 0, 102, 0.3)'
              }}
            >
              <Box position="relative">
                <Image 
                  src={item.imageUrl} 
                  alt={item.prompt} 
                  width="100%" 
                  height="200px"
                  objectFit="cover"
                  cursor="pointer"
                  onClick={() => {
                    setSelectedImage(item);
                    onOpen();
                  }}
                />
                <HStack position="absolute" top={2} right={2} spacing={1}>
                  <IconButton
                    aria-label="View image"
                    icon={<ViewIcon />}
                    size="sm"
                    colorScheme="blackAlpha"
                    onClick={() => {
                      setSelectedImage(item);
                      onOpen();
                    }}
                  />
                  <IconButton
                    aria-label="Download image"
                    icon={<DownloadIcon />}
                    size="sm"
                    colorScheme="purple"
                    variant="ghost"
                    onClick={() => downloadImage(item.imageUrl, `stability-ai-${item.type}-${item.id}.png`)}
                  />
                  <IconButton
                    aria-label="Delete image"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="blackAlpha"
                    onClick={() => handleDelete(item.id)}
                  />
                </HStack>
                <Badge 
                  position="absolute" 
                  bottom={2} 
                  left={2} 
                  colorScheme={item.type === 'text-to-image' ? 'purple' : 'blue'}
                >
                  {item.type === 'text-to-image' ? 'Text to Image' : 'Inpainting'}
                </Badge>
              </Box>
              <CardBody py={3} px={4}>
                <Text fontSize="sm" noOfLines={2} title={item.prompt}>
                  {item.prompt}
                </Text>
                <Text fontSize="sm" color="gray.400">Type: {item.type}</Text>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {formatDate(item.timestamp)}
                </Text>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* Image Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bg="gray.800" color="white">
          <ModalHeader>Image Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedImage && (
              <VStack spacing={4} align="stretch">
                <Box borderRadius="md" overflow="hidden">
                  <Image 
                    src={selectedImage.imageUrl} 
                    alt={selectedImage.prompt} 
                    width="100%" 
                    height="auto"
                  />
                </Box>
                
                <Box>
                  <Heading size="sm" mb={1}>Prompt</Heading>
                  <Text>{selectedImage.prompt}</Text>
                </Box>
                
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Heading size="sm" mb={1}>Type</Heading>
                    <Badge colorScheme={selectedImage.type === 'text-to-image' ? 'purple' : 'blue'}>
                      {selectedImage.type === 'text-to-image' ? 'Text to Image' : 'Inpainting'}
                    </Badge>
                  </Box>
                  <Box>
                    <Heading size="sm" mb={1}>Created</Heading>
                    <Text fontSize="sm" color="gray.400">{formatDate(selectedImage.timestamp)}</Text>
                  </Box>
                  <Box>
                    <Heading size="sm" mb={1}>Parameters</Heading>
                    <Text fontSize="sm" color="gray.400" noOfLines={2}>
                      {selectedImage.parameters ? 
                        Object.keys(selectedImage.parameters).join(', ') : 
                        'No parameters'}
                    </Text>
                  </Box>
                </SimpleGrid>
                
                <Flex justify="flex-end" mt={2}>
                  <Button 
                    leftIcon={<DownloadIcon />}
                    colorScheme="purple"
                    bg="brand.primary"
                    onClick={() => {
                      // In a real app, this would trigger a download
                      alert('Download functionality would be implemented here');
                    }}
                  >
                    Download
                  </Button>
                </Flex>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default GalleryPage;
