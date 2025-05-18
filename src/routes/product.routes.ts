// Routes for product-related endpoints
// Defines the HTTP routes for product operations

import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

const productController = new ProductController();
export const productRouter = Router();

// Route to reset products collection
// This endpoint is publicly accessible (no authentication required)
productRouter.post('/reset', productController.resetProducts);

// Route to search products by name (received as a query parameter)
// Example: GET /api/v1/products/search?name=Window
productRouter.get('/search', productController.searchProducts);

// Route to get the top 10 products sorted alphabetically by name
productRouter.get('/top', productController.getTopProducts);

// Route to get a specific product by ID
// Example: GET /api/v1/products/5f9d5c5b8b8c8c2e6c8b4568
productRouter.get('/:id', productController.getProductById);

export default productRouter;
