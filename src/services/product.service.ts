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
   * Helper function to replace spaces with underscores in strings
   * @param text Input text
   * @returns Text with spaces replaced by underscores
   */
  private replaceSpacesWithUnderscores(text: string): string {
    return text.replace(/\s+/g, '_');
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

      // Log a sample of the external products
      if (externalProducts.length > 0) {
        const sample: any = externalProducts[0];
        logger.info(`Sample external product title: "${sample.title}"`);
      }
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
        logger.info(`Notice: All product names have spaces replaced with underscores to improve search functionality`);
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
  private transformExternalProduct(externalProduct: {
    title?: string;
    description?: string;
    images?: string[];
    rating?: number;
  }): IProduct {
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
      'Casement_Window',
      'Double-Hung_Window',
      'Sliding_Window',
      'Bay_Window',
      'Awning_Window',
      'Picture_Window',
      'Hopper_Window',
      'Skylight_Window',
      'Fixed_Window',
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

    // Get the product title from external API and replace spaces with underscores
    const productName = externalProduct.title || 'Unnamed_Window';
    const formattedName = this.replaceSpacesWithUnderscores(productName);

    // Transform to our product schema
    return {
      name: formattedName,
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
      'Premium_Window',
      'Elegant_Window',
      'Classic_Window',
      'Modern_Window',
      'Designer_Window',
      'Energy-Saving_Window',
      'Luxury_Window',
      'Custom_Window',
      'Standard_Window',
      'Executive_Window',
      'SmartGlass_Window',
      'Ultra-Thin_Window',
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
        'Casement_Window',
        'Double-Hung_Window',
        'Sliding_Window',
        'Bay_Window',
        'Awning_Window',
        'Picture_Window',
        'Hopper_Window',
        'Skylight_Window',
        'Fixed_Window',
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

  /**
   * Get a product by its ID
   * @param id The ID of the product to retrieve
   * @returns The product with the specified ID
   * @throws Error if the product is not found
   */
  async getProductById(id: string): Promise<IProduct> {
    try {
      logger.info(`Service: Getting product with ID: ${id}`);
      const product = await this.productRepository.findById(id);

      if (!product) {
        logger.error(`Product with ID ${id} not found`);
        throw new Error(`Product with ID ${id} not found`);
      }

      logger.info(`Retrieved product: ${product.name}`);
      return product;
    } catch (error) {
      logger.error(`Error retrieving product with ID ${id}:`, error);
      throw error;
    }
  }
}

export default ProductService;
