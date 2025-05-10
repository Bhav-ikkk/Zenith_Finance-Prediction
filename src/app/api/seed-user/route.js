import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const user = await prisma.user.create({
      data: {
        userId: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      },
    });

    return new Response(JSON.stringify({ message: 'User created', user }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Failed to create user', details: err.message }), { status: 500 });
  }
}
