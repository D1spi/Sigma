// filepath: src\controllers\order.controller.ts
// Controller for order-related endpoints
// Handles HTTP requests related to order operations

import { Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { httpStatus } from '../config/httpStatusCodes';
import logger from '../config/logger';
import { IAuthRequest } from '../interfaces/authUser.interface';
import { ApplicationError } from '../utils/application.error';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  /**
   * Confirm the purchase of selected products in the user's cart
   * @route POST /api/v1/orders/confirm
   */
  confirmPurchase = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      logger.info(`OrderController: confirmPurchase called for user: ${userId}`);
      const order = await this.orderService.confirmPurchase(userId);

      res.status(httpStatus.OK).json({
        success: true,
        message: 'Purchase confirmed successfully',
        data: order,
      });
    } catch (error) {
      logger.error('OrderController: Error in confirmPurchase', error);

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
   * Get the current user's orders
   * @route GET /api/v1/orders
   */
  getOrders = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      logger.info(`OrderController: getOrders called for user: ${userId}`);
      const orders = await this.orderService.getOrdersByUser(userId);

      res.status(httpStatus.OK).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      logger.error('OrderController: Error in getOrders', error);
      next(error);
    }
  };
}

export default OrderController;
