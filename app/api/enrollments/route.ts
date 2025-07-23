import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const course = searchParams.get('course') || '';
    
    // Build search filter
    let filter: any = {};
    
    if (search) {
      filter.$or = [
        { 'studentInfo.name': { $regex: search, $options: 'i' } },
        { 'studentInfo.email': { $regex: search, $options: 'i' } },
        { 'courseInfo.title': { $regex: search, $options: 'i' } },
        { enrollmentId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (course && course !== 'all') {
      filter['courseInfo.title'] = course;
    }
    
    // Fetch enrollments from MongoDB
    const enrollments = await db
      .collection('enrollments')
      .find(filter)
      .sort({ 'invoiceInfo.enrollmentDate': -1 })
      .toArray();
    
    return NextResponse.json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}