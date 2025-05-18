// filepath: src\controllers\cart.controller.ts
// Controller for cart-related endpoints
// Handles HTTP requests related to shopping cart operations

import { Response, NextFunction } from 'express';
import { CartService } from '../services/cart.service';
import { httpStatus } from '../config/httpStatusCodes';
import logger from '../config/logger';
import { IAuthRequest } from '../interfaces/authUser.interface';
import { ApplicationError } from '../utils/application.error';

export class CartController {
  private cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }

  /**
   * Get the current user's cart
   * @route GET /api/cart
   */
  getCart = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      logger.info(`CartController: getCart called for user: ${userId}`);
      const cart = await this.cartService.getOrCreateCart(userId);

      res.status(httpStatus.OK).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      logger.error('CartController: Error in getCart', error);
      next(error);
    }
  };

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

  /**
   * Remove a product from the user's cart
   * @route DELETE /api/cart/remove/:productId
   */
  removeFromCart = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { productId } = req.params;

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

      logger.info(`CartController: removeFromCart called for user: ${userId}, product: ${productId}`);
      const updatedCart = await this.cartService.removeProductFromCart(userId, productId);

      res.status(httpStatus.OK).json({
        success: true,
        message: 'Product removed from cart successfully',
        data: updatedCart,
      });
    } catch (error) {
      logger.error('CartController: Error in removeFromCart', error);

      if (error instanceof ApplicationError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }

      next(error);
    }
  };

  /**
   * Update the quantity of a product in the user's cart
   * @route PUT /api/cart/update/:productId
   */
  updateQuantity = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { productId } = req.params;
      const { quantity } = req.body;

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

      if (quantity === undefined || quantity === null) {
        res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Quantity is required',
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
        `CartController: updateQuantity called for user: ${userId}, product: ${productId}, quantity: ${quantityNum}`,
      );
      const updatedCart = await this.cartService.updateProductQuantity(userId, productId, quantityNum);

      res.status(httpStatus.OK).json({
        success: true,
        message: 'Product quantity updated successfully',
        data: updatedCart,
      });
    } catch (error) {
      logger.error('CartController: Error in updateQuantity', error);

      if (error instanceof ApplicationError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }

      next(error);
    }
  };
}

export default CartController;
