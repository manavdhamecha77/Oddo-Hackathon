import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateOTP, storeOTP, sendOTPEmail } from '@/lib/otp'

const prisma = new PrismaClient()

export async function POST(req) {
  try {
    const { email, name } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Generate and store OTP
    const otp = generateOTP()
    storeOTP(email, otp)

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, name)

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send OTP email' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'OTP sent successfully to your email' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error sending OTP:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
