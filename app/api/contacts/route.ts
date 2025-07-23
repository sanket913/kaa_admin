import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Get search query parameter
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    
    // Build search filter
    const filter = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { course: { $regex: search, $options: 'i' } },
        { contactId: { $regex: search, $options: 'i' } }
      ]
    } : {};
    
    // Fetch contacts from MongoDB
    const contacts = await db
      .collection('contacts')
      .find(filter)
      .sort({ submittedAt: -1 })
      .toArray();
    
    return NextResponse.json({
      success: true,
      data: contacts
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}