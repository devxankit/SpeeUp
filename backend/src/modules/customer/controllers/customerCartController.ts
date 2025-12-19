
import { Request, Response } from 'express';
import Cart from '../../../models/Cart';
import CartItem from '../../../models/CartItem';
import Product from '../../../models/Product';

// Helper to calculate cart total
const calculateCartTotal = async (cartId: any) => {
    const items = await CartItem.find({ cart: cartId }).populate('product');
    let total = 0;
    items.forEach((item: any) => {
        if (item.product) {
            total += item.product.price * item.quantity;
        }
    });
    return total;
};

// Get current user's cart
export const getCart = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        let cart = await Cart.findOne({ customer: userId }).populate({
            path: 'items',
            populate: { path: 'product', select: 'productName price mainImage stock pack mrp category' }
        });

        if (!cart) {
            cart = await Cart.create({ customer: userId, items: [], total: 0 });
        }

        return res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching cart',
            error: error.message
        });
    }
};

// Add item to cart
export const addToCart = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { productId, quantity = 1, variation } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        // Get or create cart
        let cart = await Cart.findOne({ customer: userId });
        if (!cart) {
            cart = await Cart.create({ customer: userId, items: [], total: 0 });
        }

        // Check if item already exists in cart
        let cartItem = await CartItem.findOne({
            cart: cart._id,
            product: productId,
            variation: variation || null
        });

        if (cartItem) {
            // Update quantity
            cartItem.quantity += quantity;
            await cartItem.save();
        } else {
            // Create new cart item
            cartItem = await CartItem.create({
                cart: cart._id,
                product: productId,
                quantity,
                variation
            });
            cart.items.push(cartItem._id as any);
        }

        // Update total
        cart.total = await calculateCartTotal(cart._id);
        await cart.save();

        // Return updated cart
        const updatedCart = await Cart.findById(cart._id).populate({
            path: 'items',
            populate: { path: 'product', select: 'productName price mainImage stock pack mrp category' }
        });

        return res.status(200).json({
            success: true,
            message: 'Item added to cart',
            data: updatedCart
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: 'Error adding to cart',
            error: error.message
        });
    }
};

// Update item quantity
export const updateCartItem = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
        }

        const cart = await Cart.findOne({ customer: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        const cartItem = await CartItem.findOne({ _id: itemId, cart: cart._id });
        if (!cartItem) {
            return res.status(404).json({ success: false, message: 'Item not found in cart' });
        }

        cartItem.quantity = quantity;
        await cartItem.save();

        cart.total = await calculateCartTotal(cart._id);
        await cart.save();

        const updatedCart = await Cart.findById(cart._id).populate({
            path: 'items',
            populate: { path: 'product', select: 'productName price mainImage stock pack mrp category' }
        });

        return res.status(200).json({
            success: true,
            message: 'Cart updated',
            data: updatedCart
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: 'Error updating cart item',
            error: error.message
        });
    }
};

// Remove item from cart
export const removeFromCart = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { itemId } = req.params;

        const cart = await Cart.findOne({ customer: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        await CartItem.findOneAndDelete({ _id: itemId, cart: cart._id });

        // Remove from cart array
        cart.items = cart.items.filter(id => id.toString() !== itemId);

        cart.total = await calculateCartTotal(cart._id);
        await cart.save();

        const updatedCart = await Cart.findById(cart._id).populate({
            path: 'items',
            populate: { path: 'product', select: 'productName price mainImage stock pack mrp category' }
        });

        return res.status(200).json({
            success: true,
            message: 'Item removed from cart',
            data: updatedCart
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: 'Error removing from cart',
            error: error.message
        });
    }
};

// Clear cart
export const clearCart = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const cart = await Cart.findOne({ customer: userId });

        if (cart) {
            await CartItem.deleteMany({ cart: cart._id });
            cart.items = [];
            cart.total = 0;
            await cart.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Cart cleared',
            data: { items: [], total: 0 }
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: 'Error clearing cart',
            error: error.message
        });
    }
};
