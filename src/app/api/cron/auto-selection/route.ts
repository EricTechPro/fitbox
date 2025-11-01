import { NextRequest, NextResponse } from 'next/server'
import { AutoSelectionService } from '@/lib/services/auto-selection-service'
import { DeadlineService } from '@/lib/services/deadline-service'

/**
 * Cron job endpoint for processing auto-meal selections
 * Should be called every hour to check for missed deadlines
 * Vercel Cron: https://vercel.com/docs/cron-jobs
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const currentWeekStart = DeadlineService.getCurrentWeekStart()

    // Process auto-selections for subscriptions with missed deadlines
    await AutoSelectionService.processAutoSelections(currentWeekStart)

    // Also check next week in case we're at the transition
    const nextWeekStart = DeadlineService.getNextWeekStart()
    await AutoSelectionService.processAutoSelections(nextWeekStart)

    return NextResponse.json({
      success: true,
      message: 'Auto-selection processing completed',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Auto-selection cron job failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Auto-selection processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Manual trigger endpoint for testing
 */
export async function POST(request: NextRequest) {
  try {
    const { weekStart } = await request.json()

    const targetWeekStart = weekStart
      ? new Date(weekStart)
      : DeadlineService.getCurrentWeekStart()

    await AutoSelectionService.processAutoSelections(targetWeekStart)

    return NextResponse.json({
      success: true,
      message: 'Manual auto-selection completed',
      weekStart: targetWeekStart.toISOString(),
    })
  } catch (error) {
    console.error('Manual auto-selection failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Manual auto-selection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
