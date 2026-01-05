const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

const STOREFRONT_API_URL = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`;

async function shopifyFetch<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
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

// Customer Login
export async function customerLogin(email: string, password: string) {
  const mutation = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const response = await shopifyFetch<{
    customerAccessTokenCreate: {
      customerAccessToken?: {
        accessToken: string;
        expiresAt: string;
      };
      customerUserErrors: Array<{ message: string }>;
    };
  }>(mutation, {
    input: { email, password },
  });

  const { customerAccessToken, customerUserErrors } = response.customerAccessTokenCreate;

  if (customerUserErrors.length > 0) {
    throw new Error(customerUserErrors[0].message);
  }

  if (!customerAccessToken) {
    throw new Error('Failed to create access token');
  }

  return customerAccessToken;
}

// Get Customer Data
export async function getCustomerData(accessToken: string) {
  const query = `
    query getCustomer($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
        firstName
        lastName
        email
        tags
        orders(first: 10) {
          edges {
            node {
              id
              orderNumber
              processedAt
              totalPriceV2 {
                amount
                currencyCode
              }
              lineItems(first: 10) {
                edges {
                  node {
                    title
                    quantity
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch<{
    customer: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      tags: string[];
      orders: {
        edges: Array<{
          node: {
            id: string;
            orderNumber: number;
            processedAt: string;
            totalPriceV2: {
              amount: string;
              currencyCode: string;
            };
            lineItems: {
              edges: Array<{
                node: {
                  title: string;
                  quantity: number;
                };
              }>;
            };
          };
        }>;
      };
    } | null;
  }>(query, { customerAccessToken: accessToken });

  return response.customer;
}

// Get Membership Products
export async function getMembershipProducts() {
  const query = `
    query getProducts($query: String!) {
      products(first: 10, query: $query) {
        edges {
          node {
            id
            title
            description
            tags
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 10) {
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
            images(first: 1) {
              edges {
                node {
                  url
                  altText
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
          tags: string[];
          priceRange: {
            minVariantPrice: {
              amount: string;
              currencyCode: string;
            };
          };
          variants: {
            edges: Array<{
              node: {
                id: string;
                title: string;
                priceV2: {
                  amount: string;
                  currencyCode: string;
                };
                availableForSale: boolean;
              };
            }>;
          };
          images: {
            edges: Array<{
              node: {
                url: string;
                altText: string | null;
              };
            }>;
          };
        };
      }>;
    };
  }>(query, { query: 'tag:membership' });

  return response.products.edges.map(edge => edge.node);
}

// Create Checkout
export async function createCheckout(variantId: string, quantity: number = 1) {
  const mutation = `
    mutation checkoutCreate($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout {
          id
          webUrl
        }
        checkoutUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const response = await shopifyFetch<{
    checkoutCreate: {
      checkout?: {
        id: string;
        webUrl: string;
      };
      checkoutUserErrors: Array<{ message: string }>;
    };
  }>(mutation, {
    input: {
      lineItems: [{ variantId, quantity }],
    },
  });

  const { checkout, checkoutUserErrors } = response.checkoutCreate;

  if (checkoutUserErrors.length > 0) {
    throw new Error(checkoutUserErrors[0].message);
  }

  if (!checkout) {
    throw new Error('Failed to create checkout');
  }

  return checkout;
}

// Customer Logout
export async function customerLogout(accessToken: string) {
  const mutation = `
    mutation customerAccessTokenDelete($customerAccessToken: String!) {
      customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
        deletedAccessToken
        deletedCustomerAccessTokenId
        userErrors {
          field
          message
        }
      }
    }
  `;

  await shopifyFetch(mutation, { customerAccessToken: accessToken });
}

// Get Customer ID from Access Token (helper for QR codes)
export function extractCustomerIdFromGid(gid: string): string {
  // Shopify GID format: gid://shopify/Customer/123456
  return gid.split('/').pop() || '';
}

