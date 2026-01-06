import { NextRequest, NextResponse } from 'next/server';
import { getCustomerData, extractCustomerId } from '@/lib/customerAccountApi';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('customer_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch customer data from Shopify
    const customer = await getCustomerData(accessToken);

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Transform data to match our app's format
    const customerId = extractCustomerId(customer.id);

    // Check orders for membership products and get purchase date
    let ceramicsMembershipPurchaseDate: string | null = null;
    let ceramicsMembershipExpiryDate: string | null = null;
    
    const ceramicsOrder = customer.orders?.edges?.find((edge: any) =>
      edge.node.lineItems?.edges?.some((item: any) =>
        item.node.title?.toLowerCase().includes('ceramics')
      )
    );

    if (ceramicsOrder) {
      // Get the order creation date (purchase date)
      // For Customer Account API, we'll use current date as placeholder
      // In production, you'd store this in customer metafields
      const purchaseDate = new Date(); // This should come from order data or metafields
      ceramicsMembershipPurchaseDate = purchaseDate.toISOString();
      
      // Calculate expiry date (30 days from purchase)
      const expiryDate = new Date(purchaseDate);
      expiryDate.setDate(expiryDate.getDate() + 30);
      ceramicsMembershipExpiryDate = expiryDate.toISOString();
    }

    const hasCeramicsMembership = !!ceramicsOrder;
    const isMembershipActive = ceramicsMembershipExpiryDate 
      ? new Date(ceramicsMembershipExpiryDate) > new Date()
      : false;

    const response = {
      id: customer.id,
      customerId,
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.emailAddress?.emailAddress || '',
      hasCeramicsMembership,
      isMembershipActive,
      membershipExpiryDate: ceramicsMembershipExpiryDate,
      orders: (customer.orders?.edges || []).map((edge: any) => ({
        id: edge.node.id,
        orderNumber: edge.node.number,
        totalPrice: '0.00',
        currency: 'USD',
        items: (edge.node.lineItems?.edges || []).map((item: any) => ({
          title: item.node.title || 'Unknown',
          quantity: item.node.quantity || 0,
        })),
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer data' },
      { status: 500 }
    );
  }
}

