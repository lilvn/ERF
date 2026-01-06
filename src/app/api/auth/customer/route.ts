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

    // Get customer tags from Shopify (checking for membership)
    // Note: Customer Account API doesn't expose tags directly
    // We'll need to check orders for membership products instead
    const hasCeramicsMembership = customer.orders.edges.some((edge: any) =>
      edge.node.lineItems.edges.some((item: any) =>
        item.node.title.toLowerCase().includes('ceramics')
      )
    );

    const response = {
      id: customer.id,
      customerId,
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.emailAddress?.emailAddress || '',
      hasCeramicsMembership,
      orders: customer.orders.edges.map((edge: any) => ({
        id: edge.node.id,
        orderNumber: edge.node.number,
        totalPrice: edge.node.totalPrice.amount,
        currency: edge.node.totalPrice.currencyCode,
        items: edge.node.lineItems.edges.map((item: any) => ({
          title: item.node.title,
          quantity: item.node.quantity,
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

