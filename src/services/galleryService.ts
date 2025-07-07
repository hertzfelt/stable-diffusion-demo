// Types for gallery items
export interface GalleryItem {
  id: string;
  imageUrl: string;
  prompt: string;
  type: 'text-to-image' | 'inpainting';
  timestamp: string;
  parameters?: Record<string, unknown>;
}

// Local storage key for gallery items
const GALLERY_STORAGE_KEY = 'stability-ai-gallery';

/**
 * Get all gallery items from local storage
 */
export const getAllGalleryItems = (): GalleryItem[] => {
  try {
    const storedItems = localStorage.getItem(GALLERY_STORAGE_KEY);
    return storedItems ? JSON.parse(storedItems) : [];
  } catch (error) {
    console.error('Error retrieving gallery items:', error);
    return [];
  }
};

/**
 * Add a new item to the gallery
 */
export const addGalleryItem = (item: Omit<GalleryItem, 'id' | 'timestamp'>): GalleryItem => {
  try {
    const newItem: GalleryItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    
    const currentItems = getAllGalleryItems();
    const updatedItems = [newItem, ...currentItems];
    
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(updatedItems));
    return newItem;
  } catch (error) {
    console.error('Error adding gallery item:', error);
    throw error;
  }
};

/**
 * Delete an item from the gallery
 */
export const deleteGalleryItem = (id: string): boolean => {
  try {
    const currentItems = getAllGalleryItems();
    const updatedItems = currentItems.filter(item => item.id !== id);
    
    if (currentItems.length === updatedItems.length) {
      return false; // Item not found
    }
    
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(updatedItems));
    return true;
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    return false;
  }
};

/**
 * Filter gallery items by type
 */
export const filterGalleryItems = (type: 'all' | 'text-to-image' | 'inpainting'): GalleryItem[] => {
  const items = getAllGalleryItems();
  
  if (type === 'all') {
    return items;
  }
  
  return items.filter(item => item.type === type);
};
