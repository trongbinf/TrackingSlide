import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // Lấy chuỗi cấu hình admin user từ file .env.local
    // Format: ADMIN_USERS="admin:123456,trong:pass123"
    const rawUsers = process.env.ADMIN_USERS || 'admin:123456'; 
    const validUsers = rawUsers.split(',').map(pair => {
      const [u, p] = pair.split(':');
      return { username: u?.trim(), password: p?.trim() };
    });

    const isValid = validUsers.some(
      user => user.username === username && user.password === password
    );

    if (isValid) {
      const response = NextResponse.json({ success: true });
      
      // Set HttpOnly cookie for session
      response.cookies.set({
        name: 'auth_session',
        value: 'authenticated',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      return response;
    }

    return NextResponse.json({ error: 'Tài khoản hoặc mật khẩu không đúng' }, { status: 401 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
