// filepath: src\services\product.service.ts
// Service layer for product-related operations
// Contains business logic for managing products

import axios from 'axios';
import { IProduct } from '../models/product.model';
import ProductRepository from '../repositories/product.repository';
import logger from '../config/logger';

export class ProductService {
  private productRepository: ProductRepository;
  private readonly externalApiUrl = 'https://dummyjson.com/products/category/furniture?limit=12';

  constructor() {
    this.productRepository = new ProductRepository();
  }

  /**
   * Resets the products collection by fetching data from an external API
   * and transforming it to match our product schema
   */
  async resetProducts(): Promise<{ count: number; message: string }> {
    try {
      logger.info('Resetting products collection');

      // Get products from external API
      const response = await axios.get(this.externalApiUrl);

      if (!response.data || !response.data.products || !Array.isArray(response.data.products)) {
        throw new Error('Invalid response from external API');
      }

      const externalProducts = response.data.products;
      logger.info(`Fetched ${externalProducts.length} products from external API`);
      // Transform external products to match our schema
      let transformedProducts = externalProducts.map(this.transformExternalProduct);

      // If we have less than 12 products, generate additional random products
      if (transformedProducts.length < 12) {
        logger.info(
          `Got only ${transformedProducts.length} products from API, generating ${12 - transformedProducts.length} additional products`,
        );
        const additionalProducts = this.generateAdditionalProducts(12 - transformedProducts.length);
        transformedProducts = [...transformedProducts, ...additionalProducts];
      }

      // If we have more than 12 products, keep only 12
      if (transformedProducts.length > 12) {
        transformedProducts = transformedProducts.slice(0, 12);
        logger.info(`Limited products to 12`);
      }

      // Clear existing products
      await this.productRepository.deleteAll();
      logger.info('Deleted all existing products');

      // Create new products
      const createdProducts = await this.productRepository.createMany(transformedProducts);
      logger.info(`Created ${createdProducts.length} products`);

      // Log some sample data for verification
      if (createdProducts.length > 0) {
        const sample = createdProducts[0];
        logger.info(`Sample product - Name: "${sample.name}", Type: ${sample.type}`);
        logger.info(`Sample product features: ${sample.features.join(', ')}`);
      }

      return {
        count: createdProducts.length,
        message: `Successfully reset products collection with ${createdProducts.length} items`,
      };
    } catch (error) {
      logger.error('Error resetting products:', error);
      throw error;
    }
  }

  /**
   * Transforms a product from the external API format to our schema
   * @param externalProduct Product data from external API
   * @returns Transformed product matching our schema
   */
  private transformExternalProduct(externalProduct: any): IProduct {
    // Generate random dimensions suitable for windows
    const width = Math.floor(Math.random() * 100) + 50; // Random width between 50-150cm
    const height = Math.floor(Math.random() * 100) + 80; // Random height between 80-180cm
    const depth = Math.floor(Math.random() * 10) + 2; // Random depth between 2-12cm

    // Generate random price between $50 and $500
    const price = Number((Math.random() * 450 + 50).toFixed(2));

    // Generate random stock quantity between 0 and 100
    const stockQuantity = Math.floor(Math.random() * 101);

    // Window types
    const windowTypes = [
      'Casement Window',
      'Double-Hung Window',
      'Sliding Window',
      'Bay Window',
      'Awning Window',
      'Picture Window',
      'Hopper Window',
      'Skylight Window',
      'Fixed Window',
    ];

    // Window materials
    const windowMaterials = ['Vinyl', 'Aluminum', 'Wood', 'Fiberglass', 'Composite', 'Glass', 'Steel'];

    // Window features
    const possibleFeatures = [
      'Energy Efficient',
      'UV Protection',
      'Soundproof',
      'Tinted',
      'Impact Resistant',
      'Low-E Glass',
      'Triple Glazed',
      'Double Glazed',
      'Anti-Condensation',
      'Security Lock',
    ];

    // Select random features (between 1 and 5)
    const featureCount = Math.floor(Math.random() * 5) + 1;
    const features: string[] = [];
    for (let i = 0; i < featureCount; i++) {
      const randomFeature = possibleFeatures[Math.floor(Math.random() * possibleFeatures.length)];
      if (!features.includes(randomFeature)) {
        features.push(randomFeature);
      }
    }

    // Transform to our product schema
    return {
      name: externalProduct.title || 'Unnamed Window',
      description: externalProduct.description || 'No description available',
      type: windowTypes[Math.floor(Math.random() * windowTypes.length)],
      material: windowMaterials[Math.floor(Math.random() * windowMaterials.length)],
      dimensions: {
        width,
        height,
        depth,
      },
      features,
      price,
      imageUrl:
        externalProduct.images && externalProduct.images.length > 0
          ? externalProduct.images[0]
          : 'https://placehold.co/600x400?text=Window+Image',
      stockQuantity,
      rating: externalProduct.rating || Math.random() * 5,
    };
  }

  /**
   * Generates additional random products when needed to ensure we have exactly 12 products
   * @param count Number of products to generate
   * @returns Array of generated products
   */
  private generateAdditionalProducts(count: number): IProduct[] {
    const additionalProducts: IProduct[] = [];

    // Window names for random generation
    const windowNames = [
      'Premium Window',
      'Elegant Window',
      'Classic Window',
      'Modern Window',
      'Designer Window',
      'Energy-Saving Window',
      'Luxury Window',
      'Custom Window',
      'Standard Window',
      'Executive Window',
      'SmartGlass Window',
      'Ultra-Thin Window',
    ];

    // Window descriptions for random generation
    const windowDescriptions = [
      'High-quality window with excellent insulation properties',
      'Elegant design with modern materials and finishes',
      'Classic style window suitable for traditional homes',
      'Contemporary window design with clean lines',
      'Designer window that adds character to any room',
      'Energy-efficient window that reduces heating costs',
      'Luxury window with premium materials and craftsmanship',
      'Customizable window that fits any architectural style',
      'Standard window with reliable performance',
      'Executive-grade window with enhanced security features',
      'Smart glass window with adjustable transparency',
      'Ultra-thin profile window maximizing natural light',
    ];

    for (let i = 0; i < count; i++) {
      // Generate random dimensions suitable for windows
      const width = Math.floor(Math.random() * 100) + 50; // Random width between 50-150cm
      const height = Math.floor(Math.random() * 100) + 80; // Random height between 80-180cm
      const depth = Math.floor(Math.random() * 10) + 2; // Random depth between 2-12cm

      // Generate random price between $50 and $500
      const price = Number((Math.random() * 450 + 50).toFixed(2));

      // Generate random stock quantity between 0 and 100
      const stockQuantity = Math.floor(Math.random() * 101);

      // Window types
      const windowTypes = [
        'Casement Window',
        'Double-Hung Window',
        'Sliding Window',
        'Bay Window',
        'Awning Window',
        'Picture Window',
        'Hopper Window',
        'Skylight Window',
        'Fixed Window',
      ];

      // Window materials
      const windowMaterials = ['Vinyl', 'Aluminum', 'Wood', 'Fiberglass', 'Composite', 'Glass', 'Steel'];

      // Window features
      const possibleFeatures = [
        'Energy Efficient',
        'UV Protection',
        'Soundproof',
        'Tinted',
        'Impact Resistant',
        'Low-E Glass',
        'Triple Glazed',
        'Double Glazed',
        'Anti-Condensation',
        'Security Lock',
      ];

      // Select random features (between 1 and 5)
      const featureCount = Math.floor(Math.random() * 5) + 1;
      const features: string[] = [];
      for (let j = 0; j < featureCount; j++) {
        const randomFeature = possibleFeatures[Math.floor(Math.random() * possibleFeatures.length)];
        if (!features.includes(randomFeature)) {
          features.push(randomFeature);
        }
      }

      // Create product
      additionalProducts.push({
        name: windowNames[i % windowNames.length],
        description: windowDescriptions[i % windowDescriptions.length],
        type: windowTypes[Math.floor(Math.random() * windowTypes.length)],
        material: windowMaterials[Math.floor(Math.random() * windowMaterials.length)],
        dimensions: {
          width,
          height,
          depth,
        },
        features,
        price,
        imageUrl: `https://placehold.co/600x400?text=Window+${i + 1}`,
        stockQuantity,
        rating: Math.random() * 5,
      });
    }

    return additionalProducts;
  }

  /**
   * Search for products by name (case-insensitive partial match)
   * @param name The name to search for
   * @returns Array of products that match the search query
   */
  async searchProductsByName(name: string): Promise<IProduct[]> {
    try {
      logger.info(`Searching for products with name containing: ${name}`);
      const products = await this.productRepository.findByName(name);
      logger.info(`Found ${products.length} products matching query: ${name}`);
      return products;
    } catch (error) {
      logger.error(`Error searching products by name: ${name}`, error);
      throw error;
    }
  }

  /**
   * Get the first 10 products sorted alphabetically by name
   * @returns Array of the first 10 products sorted by name
   */
  async getTopTenProducts(): Promise<IProduct[]> {
    try {
      logger.info('Getting top 10 products sorted alphabetically');
      const products = await this.productRepository.findTopTenSortedByName();
      logger.info(`Retrieved ${products.length} products`);
      return products;
    } catch (error) {
      logger.error('Error retrieving top 10 products', error);
      throw error;
    }
  }
}

export default ProductService;
