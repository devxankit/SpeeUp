import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addToWishlist, removeFromWishlist, getWishlist } from '../services/api/customerWishlistService';

/**
 * Custom hook for managing wishlist state and toggle functionality
 * @param productId - The product ID to check/manage in wishlist
 * @returns Object with isWishlisted state and toggleWishlist function
 */
export function useWishlist(productId?: string) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only check wishlist if user is authenticated and productId is provided
    if (!isAuthenticated || !productId) {
      setIsWishlisted(false);
      return;
    }

    const checkWishlist = async () => {
      try {
        const res = await getWishlist();
        if (res.success && res.data && res.data.products) {
          const exists = res.data.products.some(
            (p: any) => String(p._id || p.id) === String(productId)
          );
          setIsWishlisted(exists);
        }
      } catch (e) {
        // Silently fail if not logged in or error
        setIsWishlisted(false);
      }
    };
    checkWishlist();
  }, [productId, isAuthenticated]);

  const toggleWishlist = async (e?: React.MouseEvent | React.TouchSplat) => {
    if (e) {
      if ('preventDefault' in e) e.preventDefault();
      if ('stopPropagation' in e) e.stopPropagation();
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!productId) {
      console.error('Product ID is required to toggle wishlist');
      return;
    }

    try {
      if (isWishlisted) {
        await removeFromWishlist(productId);
        setIsWishlisted(false);
      } else {
        await addToWishlist(productId);
        setIsWishlisted(true);
      }
    } catch (e) {
      console.error('Failed to toggle wishlist:', e);
    }
  };

  return { isWishlisted, toggleWishlist };
}

