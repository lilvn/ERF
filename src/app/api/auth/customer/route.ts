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

    // Check orders for membership products (Customer Account API doesn't expose tags)
    const hasCeramicsMembership = customer.orders?.edges?.some((edge: any) =>
      edge.node.lineItems?.edges?.some((item: any) =>
        item.node.title?.toLowerCase().includes('ceramics')
      )
    ) || false;

    const response = {
      id: customer.id,
      customerId,
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.emailAddress?.emailAddress || '',
      hasCeramicsMembership,
      orders: (customer.orders?.edges || []).map((edge: any) => ({
        id: edge.node.id,
        orderNumber: edge.node.number,
        totalPrice: '0.00', // Customer Account API doesn't expose total price
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

