import { NextRequest, NextResponse } from 'next/server';

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!;
const STOREFRONT_API_URL = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`;

async function shopifyFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(STOREFRONT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.statusText}`);
  }

  const json = await response.json();
  
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }

  return json.data;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: string;
  availableForSale: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  handle: string;
  productType: string;
  images: string[];
  variants: ProductVariant[];
  priceRange: {
    min: string;
    max: string;
  };
}

async function getMerchProducts(): Promise<Product[]> {
  const query = `
    query getProducts {
      products(first: 20, query: "tag:merch") {
        edges {
          node {
            id
            title
            description
            handle
            productType
            images(first: 5) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 20) {
              edges {
                node {
                  id
                  title
                  priceV2 {
                    amount
                    currencyCode
                  }
                  availableForSale
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch<{
    products: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          description: string;
          handle: string;
          productType: string;
          images: {
            edges: Array<{
              node: {
                url: string;
                altText: string | null;
              };
            }>;
          };
          priceRange: {
            minVariantPrice: { amount: string; currencyCode: string };
            maxVariantPrice: { amount: string; currencyCode: string };
          };
          variants: {
            edges: Array<{
              node: {
                id: string;
                title: string;
                priceV2: { amount: string; currencyCode: string };
                availableForSale: boolean;
              };
            }>;
          };
        };
      }>;
    };
  }>(query);

  return response.products.edges.map(({ node }) => ({
    id: node.id,
    title: node.title,
    description: node.description,
    handle: node.handle,
    productType: node.productType,
    images: node.images.edges.map(img => img.node.url),
    priceRange: {
      min: node.priceRange.minVariantPrice.amount,
      max: node.priceRange.maxVariantPrice.amount,
    },
    variants: node.variants.edges.map(({ node: variant }) => ({
      id: variant.id,
      title: variant.title,
      price: variant.priceV2.amount,
      availableForSale: variant.availableForSale,
    })),
  }));
}

export async function GET(request: NextRequest) {
  try {
    const products = await getMerchProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
