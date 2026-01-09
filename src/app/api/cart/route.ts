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

interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    image?: {
      url: string;
    };
    priceV2: {
      amount: string;
      currencyCode: string;
    };
    product: {
      title: string;
    };
  };
}

interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
  lines: {
    edges: Array<{
      node: CartLine;
    }>;
  };
}

function transformCart(shopifyCart: ShopifyCart) {
  return {
    id: shopifyCart.id,
    checkoutUrl: shopifyCart.checkoutUrl,
    totalQuantity: shopifyCart.totalQuantity,
    totalPrice: shopifyCart.cost.totalAmount.amount,
    items: shopifyCart.lines.edges.map(({ node }) => ({
      id: node.id,
      variantId: node.merchandise.id,
      title: node.merchandise.product.title,
      variantTitle: node.merchandise.title,
      price: node.merchandise.priceV2.amount,
      quantity: node.quantity,
      image: node.merchandise.image?.url,
    })),
  };
}

const CART_FRAGMENT = `
  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              image {
                url
              }
              priceV2 {
                amount
                currencyCode
              }
              product {
                title
              }
            }
          }
        }
      }
    }
  }
`;

async function getCart(cartId: string) {
  const query = `
    query getCart($cartId: ID!) {
      cart(id: $cartId) {
        ...CartFragment
      }
    }
    ${CART_FRAGMENT}
  `;

  const response = await shopifyFetch<{ cart: ShopifyCart | null }>(query, { cartId });
  return response.cart ? transformCart(response.cart) : null;
}

async function createCart(variantId: string, quantity: number) {
  const mutation = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          ...CartFragment
        }
        userErrors {
          code
          field
          message
        }
      }
    }
    ${CART_FRAGMENT}
  `;

  const response = await shopifyFetch<{
    cartCreate: {
      cart: ShopifyCart | null;
      userErrors: Array<{ message: string }>;
    };
  }>(mutation, {
    input: {
      lines: [{ merchandiseId: variantId, quantity }],
    },
  });

  if (response.cartCreate.userErrors.length > 0) {
    throw new Error(response.cartCreate.userErrors[0].message);
  }

  return response.cartCreate.cart ? transformCart(response.cartCreate.cart) : null;
}

async function addToCart(cartId: string, variantId: string, quantity: number) {
  const mutation = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ...CartFragment
        }
        userErrors {
          code
          field
          message
        }
      }
    }
    ${CART_FRAGMENT}
  `;

  const response = await shopifyFetch<{
    cartLinesAdd: {
      cart: ShopifyCart | null;
      userErrors: Array<{ message: string }>;
    };
  }>(mutation, {
    cartId,
    lines: [{ merchandiseId: variantId, quantity }],
  });

  if (response.cartLinesAdd.userErrors.length > 0) {
    throw new Error(response.cartLinesAdd.userErrors[0].message);
  }

  return response.cartLinesAdd.cart ? transformCart(response.cartLinesAdd.cart) : null;
}

async function updateCartLine(cartId: string, lineId: string, quantity: number) {
  const mutation = `
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          ...CartFragment
        }
        userErrors {
          code
          field
          message
        }
      }
    }
    ${CART_FRAGMENT}
  `;

  const response = await shopifyFetch<{
    cartLinesUpdate: {
      cart: ShopifyCart | null;
      userErrors: Array<{ message: string }>;
    };
  }>(mutation, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });

  if (response.cartLinesUpdate.userErrors.length > 0) {
    throw new Error(response.cartLinesUpdate.userErrors[0].message);
  }

  return response.cartLinesUpdate.cart ? transformCart(response.cartLinesUpdate.cart) : null;
}

async function removeCartLine(cartId: string, lineId: string) {
  const mutation = `
    mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          ...CartFragment
        }
        userErrors {
          code
          field
          message
        }
      }
    }
    ${CART_FRAGMENT}
  `;

  const response = await shopifyFetch<{
    cartLinesRemove: {
      cart: ShopifyCart | null;
      userErrors: Array<{ message: string }>;
    };
  }>(mutation, {
    cartId,
    lineIds: [lineId],
  });

  if (response.cartLinesRemove.userErrors.length > 0) {
    throw new Error(response.cartLinesRemove.userErrors[0].message);
  }

  return response.cartLinesRemove.cart ? transformCart(response.cartLinesRemove.cart) : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, cartId, variantId, quantity, lineId } = body;

    let cart;

    switch (action) {
      case 'get':
        if (!cartId) {
          return NextResponse.json({ cart: null });
        }
        cart = await getCart(cartId);
        break;

      case 'add':
        if (!variantId) {
          return NextResponse.json({ error: 'Variant ID required' }, { status: 400 });
        }
        if (cartId) {
          // Check if cart exists first
          const existingCart = await getCart(cartId);
          if (existingCart) {
            cart = await addToCart(cartId, variantId, quantity || 1);
          } else {
            cart = await createCart(variantId, quantity || 1);
          }
        } else {
          cart = await createCart(variantId, quantity || 1);
        }
        break;

      case 'update':
        if (!cartId || !lineId || quantity === undefined) {
          return NextResponse.json({ error: 'Cart ID, line ID, and quantity required' }, { status: 400 });
        }
        cart = await updateCartLine(cartId, lineId, quantity);
        break;

      case 'remove':
        if (!cartId || !lineId) {
          return NextResponse.json({ error: 'Cart ID and line ID required' }, { status: 400 });
        }
        cart = await removeCartLine(cartId, lineId);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Cart API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Cart operation failed' },
      { status: 500 }
    );
  }
}
