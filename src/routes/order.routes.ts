// filepath: src\routes\order.routes.ts
// Routes for order-related endpoints
// Defines the HTTP routes for order operations

import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const orderController = new OrderController();
export const orderRouter = Router();

// All order routes require authentication
orderRouter.use(authMiddleware);

// Route to get all orders for the current user
// GET /api/v1/orders
orderRouter.get('/', orderController.getOrders);

// Route to confirm purchase (checkout) of selected items in the cart
// POST /api/v1/orders/confirm
orderRouter.post('/confirm', orderController.confirmPurchase);

export default orderRouter;
