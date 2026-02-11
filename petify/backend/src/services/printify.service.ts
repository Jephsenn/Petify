import axios from 'axios';
import { PrintifyProductRequest, PrintifyProductResponse } from '../types/index.js';

/**
 * Printify Service for creating and managing print-on-demand products
 */
class PrintifyService {
  private apiKey: string;
  private apiUrl: string;
  private shopId: string;

  constructor() {
    this.apiKey = process.env.PRINTIFY_API_KEY || '';
    this.apiUrl = 'https://api.printify.com/v1';
    this.shopId = process.env.PRINTIFY_SHOP_ID || '';
    
    if (!this.apiKey) {
      console.warn('[Printify Service] Warning: PRINTIFY_API_KEY not set. Product creation will not work.');
    }
    if (!this.shopId) {
      console.warn('[Printify Service] Warning: PRINTIFY_SHOP_ID not set. Product creation will not work.');
    }
  }

  /**
   * Creates a Printify product with a generated image
   */
  async createProduct(request: PrintifyProductRequest): Promise<PrintifyProductResponse> {
    if (!this.apiKey || !this.shopId) {
      throw new Error('Printify API credentials not configured');
    }

    console.log(`[Printify Service] Creating product: ${request.title}`);

    try {
      // First, upload the image to Printify
      const imageId = await this.uploadImage(request.imageUrl);

      // Then create the product
      const response = await axios.post(
        `${this.apiUrl}/shops/${this.shopId}/products.json`,
        {
          title: request.title,
          description: request.description,
          blueprint_id: 3, // Example: Unisex t-shirt - adjust based on product type
          print_provider_id: 99, // Example provider - adjust based on your needs
          variants: request.variants || this.getDefaultVariants(imageId),
          print_areas: [
            {
              variant_ids: [0], // Apply to all variants
              placeholders: [
                {
                  position: 'front',
                  images: [
                    {
                      id: imageId,
                      x: 0.5,
                      y: 0.5,
                      scale: 1,
                      angle: 0
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const productData = response.data;

      console.log(`[Printify Service] Product created with ID: ${productData.id}`);

      return {
        productId: productData.id,
        variants: productData.variants,
        previewUrl: productData.images?.[0]?.src || ''
      };
    } catch (error) {
      console.error('[Printify Service] Error creating product:', error);
      throw new Error(`Printify product creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Uploads an image to Printify
   */
  private async uploadImage(imageUrl: string): Promise<string> {
    console.log(`[Printify Service] Uploading image to Printify`);

    try {
      const response = await axios.post(
        `${this.apiUrl}/uploads/images.json`,
        {
          file_name: `pet_artwork_${Date.now()}.png`,
          url: imageUrl
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const imageId = response.data.id;
      console.log(`[Printify Service] Image uploaded with ID: ${imageId}`);
      
      return imageId;
    } catch (error) {
      console.error('[Printify Service] Error uploading image:', error);
      throw new Error(`Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets default variant configuration
   */
  private getDefaultVariants(imageId: string): any[] {
    return [
      { id: 0, price: 2999, is_enabled: true }, // $29.99
    ];
  }

  /**
   * Publishes a product to Shopify
   */
  async publishToShopify(productId: string): Promise<void> {
    console.log(`[Printify Service] Publishing product ${productId} to Shopify`);

    try {
      await axios.post(
        `${this.apiUrl}/shops/${this.shopId}/products/${productId}/publish.json`,
        {
          title: true,
          description: true,
          images: true,
          variants: true,
          tags: true
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      console.log(`[Printify Service] Product published successfully`);
    } catch (error) {
      console.error('[Printify Service] Error publishing product:', error);
      throw new Error(`Product publish failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const printifyService = new PrintifyService();
