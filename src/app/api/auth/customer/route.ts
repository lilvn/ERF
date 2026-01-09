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
    let membershipType: string | null = null;
    let membershipPurchaseDate: string | null = null;
    let membershipExpiryDate: string | null = null;
    
    // Check for different membership types
    const ceramicsOrder = customer.orders?.edges?.find((edge: any) =>
      edge.node.lineItems?.edges?.some((item: any) =>
        item.node.title?.toLowerCase().includes('ceramics')
      )
    );

    const woodshopOrder = customer.orders?.edges?.find((edge: any) =>
      edge.node.lineItems?.edges?.some((item: any) =>
        item.node.title?.toLowerCase().includes('woodshop')
      )
    );

    const studioOrder = customer.orders?.edges?.find((edge: any) =>
      edge.node.lineItems?.edges?.some((item: any) =>
        item.node.title?.toLowerCase().includes('studio')
      )
    );

    // Determine which membership to use (prioritize most recent)
    const membershipOrders = [
      { order: ceramicsOrder, type: 'Ceramics' },
      { order: woodshopOrder, type: 'Woodshop' },
      { order: studioOrder, type: 'Studio' },
    ].filter(m => m.order);

    if (membershipOrders.length > 0) {
      // Sort by date to get most recent
      membershipOrders.sort((a, b) => {
        const dateA = new Date(a.order.node.processedAt).getTime();
        const dateB = new Date(b.order.node.processedAt).getTime();
        return dateB - dateA;
      });

      const latestMembership = membershipOrders[0];
      membershipType = latestMembership.type;
      
      // Get the actual order creation date (purchase date)
      const orderDate = latestMembership.order.node.processedAt;
      const purchaseDate = new Date(orderDate);
      membershipPurchaseDate = purchaseDate.toISOString();
      
      // Calculate expiry date (30 days from actual purchase date)
      const expiryDate = new Date(purchaseDate);
      expiryDate.setDate(expiryDate.getDate() + 30);
      membershipExpiryDate = expiryDate.toISOString();
    }

    const hasCeramicsMembership = !!ceramicsOrder;
    const isMembershipActive = membershipExpiryDate 
      ? new Date(membershipExpiryDate) > new Date()
      : false;

    const response = {
      id: customer.id,
      customerId,
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.emailAddress?.emailAddress || '',
      hasCeramicsMembership,
      isMembershipActive,
      membershipType,
      membershipExpiryDate,
      orders: (customer.orders?.edges || []).map((edge: any) => ({
        id: edge.node.id,
        orderNumber: edge.node.number,
        totalPrice: '0.00',
        currency: 'USD',
        createdAt: edge.node.processedAt || new Date().toISOString(),
        items: (edge.node.lineItems?.edges || []).map((item: any) => ({
          title: item.node.title || 'Unknown',
          variantTitle: item.node.variantTitle || null,
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

