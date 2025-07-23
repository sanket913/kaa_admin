import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Get total contacts
    const totalContacts = await db.collection('contacts').countDocuments();
    
    // Get total enrollments
    const totalEnrollments = await db.collection('enrollments').countDocuments();
    
    // Calculate total revenue from successful payments
    const enrollments = await db.collection('enrollments').find({
      'paymentInfo.paymentStatus': 'success'
    }).toArray();
    
    const totalRevenue = enrollments.reduce((sum, enrollment) => {
      return sum + (enrollment.paymentInfo?.amount || 0);
    }, 0);
    
    // Get recent contacts (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentContacts = await db.collection('contacts').countDocuments({
      submittedAt: { $gte: sevenDaysAgo.toISOString() }
    });
    
    // Get recent enrollments (last 7 days)
    const recentEnrollments = await db.collection('enrollments').countDocuments({
      'invoiceInfo.enrollmentDate': { $gte: sevenDaysAgo.toISOString() }
    });
    
    // Get recent revenue (last 7 days)
    const recentRevenueData = await db.collection('enrollments').find({
      'paymentInfo.paymentStatus': 'success',
      'paymentInfo.paymentDate': { $gte: sevenDaysAgo.toISOString() }
    }).toArray();
    
    const recentRevenue = recentRevenueData.reduce((sum, enrollment) => {
      return sum + (enrollment.paymentInfo?.amount || 0);
    }, 0);
    
    return NextResponse.json({
      success: true,
      data: {
        totalContacts,
        totalEnrollments,
        totalRevenue,
        recentContacts,
        recentEnrollments,
        recentRevenue
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}