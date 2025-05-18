// Routes for product-related endpoints
// Defines the HTTP routes for product operations

import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

const productController = new ProductController();
export const productRouter = Router();

// Route to reset products collection
// This endpoint is publicly accessible (no authentication required)
productRouter.post('/reset', productController.resetProducts);

export default productRouter;
