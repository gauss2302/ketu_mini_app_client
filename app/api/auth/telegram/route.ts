import { NextResponse } from 'next/server';
import { validate, parse } from '@tma.js/init-data-node';
import { generateTokens } from '@/app/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { initData } = body;

    if (!initData) {
      return NextResponse.json(
        { error: 'initData parameter is missing', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      console.error('Telegram bot token not configured');
      return NextResponse.json(
        { error: 'Telegram authentication not configured', code: 'INTERNAL_SERVER_ERROR' },
        { status: 500 }
      );
    }

    // Validate Telegram init data
    // 3 hours expiration time matching the Go reference
    const INIT_DATA_EXPIRATION = 3 * 60 * 60; 

    try {
      validate(initData, botToken, {
        expiresIn: INIT_DATA_EXPIRATION,
      });
    } catch (e) {
      console.error('Telegram init data validation failed', e);
      return NextResponse.json(
        { error: 'Invalid Telegram authentication data', code: 'TG_VALIDATION_FAILED' },
        { status: 401 }
      );
    }

    // Parse user data from initData
    const parsedData = parse(initData);
    const user = parsedData.user;

    if (!user) {
       return NextResponse.json(
        { error: 'User data missing in initData', code: 'INVALID_USER_DATA' },
        { status: 400 }
      );
    }

    // Generate tokens
    // In a real app, you would upsert the user in your database here
    const tokens = await generateTokens({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    return NextResponse.json({
      message: 'Telegram login successful',
      tokens,
      user: user, // Optional: return parsed user data
    });

  } catch (error) {
    console.error('Login failed', error);
    return NextResponse.json(
      { error: 'Login failed', code: 'LOGIN_FAILED' },
      { status: 500 }
    );
  }
}
