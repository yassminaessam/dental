import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/dental-charts?patientId=xxx - Get dental chart for a patient
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { error: 'patientId is required' },
        { status: 400 }
      );
    }

    const chart = await prisma.dentalChart.findUnique({
      where: { patientId },
    });

    if (!chart) {
      // Return empty chart if not found
      return NextResponse.json({ 
        chart: null,
        patientId 
      });
    }

    return NextResponse.json({ 
      chart: chart.chartData,
      id: chart.id,
      patientId: chart.patientId,
      updatedAt: chart.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching dental chart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dental chart' },
      { status: 500 }
    );
  }
}

// POST /api/dental-charts - Create or update dental chart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, chartData } = body;

    if (!patientId || !chartData) {
      return NextResponse.json(
        { error: 'patientId and chartData are required' },
        { status: 400 }
      );
    }

    // Use upsert to create or update
    const chart = await prisma.dentalChart.upsert({
      where: { patientId },
      create: {
        patientId,
        chartData,
      },
      update: {
        chartData,
      },
    });

    return NextResponse.json({ 
      chart: chart.chartData,
      id: chart.id,
      patientId: chart.patientId,
      updatedAt: chart.updatedAt,
    });
  } catch (error) {
    console.error('Error saving dental chart:', error);
    return NextResponse.json(
      { error: 'Failed to save dental chart' },
      { status: 500 }
    );
  }
}
