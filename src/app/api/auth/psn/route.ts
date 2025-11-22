// app/api/auth/psn/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PSNAuthService } from '@/lib/psn-auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  
  if (!code) {
    // Redirect to PSN OAuth
    const authUrl = PSNAuthService.getOAuthUrl();
    return NextResponse.redirect(authUrl);
  }

  try {
    const tokens = await PSNAuthService.handleOAuthCallback(code);
    
    // Store tokens securely (httpOnly cookies recommended)
    const response = NextResponse.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    
    response.cookies.set('psn_access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokens.expiresIn,
      sameSite: 'lax'
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(`${process.env.FRONTEND_URL}/auth/error`);
  }
}