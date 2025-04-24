import { useState, useEffect, useCallback } from 'react';
import { updateBentoItemSpan } from '@/utils/bento-helpers';
import axios from 'axios';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for managing bento grid item spans and settings
 * @param {string} userId - User ID to fetch bento items for
 * @returns {object} Methods and state for managing bento items
 */
const useBentoItems = (userId, initialItems = []) => {
  const [bentoItems, setBentoItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Parse initial items if they are a string
  useEffect(() => {
    if (!initialItems) return;

    try {
      if (typeof initialItems === 'string') {
        setBentoItems(JSON.parse(initialItems));
      } else if (Array.isArray(initialItems)) {
        setBentoItems(initialItems);
      }
    } catch (error) {
      console.error('Error parsing bento items:', error);
      setBentoItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [initialItems]);

  /**
   * Update the span setting for a specific item
   * @param {string} itemId - ID of the item to update
   * @param {string} span - New span class or span option ID
   */
  const updateItemSpan = useCallback(
    async (itemId, span) => {
      try {
        // Update local state
        const updatedItems = updateBentoItemSpan(bentoItems, itemId, span);
        setBentoItems(updatedItems);

        // Send to server
        await axios.post('/api/users/update-bento-spans', {
          bentoItems: updatedItems,
        });

        toast.success('Layout updated');
      } catch (error) {
        console.error('Error updating item span:', error);
        toast.error('Failed to update layout');
        setError('Failed to update item span');
      }
    },
    [bentoItems]
  );

  /**
   * Update the order of multiple items
   * @param {Array} items - Array of items with id, type, and order properties
   */
  const updateItemsOrder = useCallback(async items => {
    try {
      // Send to server
      await axios.post('/api/users/update-bento-order', {
        items,
      });

      toast.success('Order updated');
    } catch (error) {
      console.error('Error updating items order:', error);
      toast.error('Failed to update order');
      setError('Failed to update items order');
    }
  }, []);

  /**
   * Get the span setting for a specific item
   * @param {string} itemId - ID of the item to get span for
   * @returns {string} Span class for the item or default span
   */
  const getItemSpan = useCallback(
    itemId => {
      const item = bentoItems.find(item => item.id === itemId);
      return item?.span || '';
    },
    [bentoItems]
  );

  return {
    bentoItems,
    isLoading,
    error,
    updateItemSpan,
    updateItemsOrder,
    getItemSpan,
  };
};

export default useBentoItems;
