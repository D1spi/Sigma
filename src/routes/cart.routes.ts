// filepath: src\routes\cart.routes.ts
// Routes for cart-related endpoints
// Defines the HTTP routes for shopping cart operations

import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const cartController = new CartController();
export const cartRouter = Router();

// All cart routes require authentication
cartRouter.use(authMiddleware);

// Route to get the current user's cart
cartRouter.get('/', cartController.getCart);

// Route to add a product to the cart
// Example: POST /api/v1/cart/add/5f9d5c5b8b8c8c2e6c8b4568
// Body: { "quantity": 2 }
cartRouter.post('/add/:productId', cartController.addToCart);

// Route to remove a product from the cart
// Example: DELETE /api/v1/cart/remove/5f9d5c5b8b8c8c2e6c8b4568
cartRouter.delete('/remove/:productId', cartController.removeFromCart);

export default cartRouter;
