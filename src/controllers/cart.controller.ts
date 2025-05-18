// filepath: src\controllers\cart.controller.ts
// Controller for cart-related endpoints
// Handles HTTP requests related to shopping cart operations

import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cart.service';
import { httpStatus } from '../config/httpStatusCodes';
import logger from '../config/logger';
import { IAuthRequest } from '../interfaces/authUser.interface';

export class CartController {
  private cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }
  // Método getCart temporalmente eliminado para simplificar

  /**
   * Add a product to the user's cart
   * @route POST /api/cart/add/:productId
   */
  addToCart = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { productId } = req.params;
      const { quantity = 1 } = req.body;

      if (!userId) {
        res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      if (!productId) {
        res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Product ID is required',
        });
        return;
      }

      // Ensure quantity is a number
      const quantityNum = Number(quantity);
      if (isNaN(quantityNum) || quantityNum <= 0) {
        res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Quantity must be a positive number',
        });
        return;
      }

      logger.info(
        `CartController: addToCart called for user: ${userId}, product: ${productId}, quantity: ${quantityNum}`,
      );
      const updatedCart = await this.cartService.addProductToCart(userId, productId, quantityNum);

      res.status(httpStatus.OK).json({
        success: true,
        message: 'Product added to cart successfully',
        data: updatedCart,
      });
    } catch (error) {
      logger.error('CartController: Error in addToCart', error);
      next(error);
    }
  };
}

export default CartController;
