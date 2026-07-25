import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const senderId = parseInt((session.user as any).id);
  const isAdmin = (session.user as any).role === 'admin';
  const { toUserId: rawTo, subject, body, coins, type } = await req.json();
  const toUserId = parseInt(rawTo);

  if (!toUserId || !subject) return NextResponse.json({ error: 'Recipient and subject required' }, { status: 400 });

  // Handle coin transfer
  let coinAmount = parseInt(coins) || 0;
  if (coinAmount > 0 && !isAdmin) {
    // Deduct from sender (non-admin)
    const senderWallet = await prisma.wallet.findUnique({ where: { userId: senderId } });
    if (!senderWallet || senderWallet.balance < coinAmount) {
      return NextResponse.json({ error: 'Insufficient coins' }, { status: 400 });
    }
    await prisma.wallet.update({ where: { userId: senderId }, data: { balance: { decrement: coinAmount } } });
  }
  // Add to recipient (always)
  if (coinAmount > 0) {
    await prisma.wallet.upsert({
      where: { userId: toUserId },
      update: { balance: { increment: coinAmount } },
      create: { userId: toUserId, balance: 100 + coinAmount },
    });
    await prisma.transaction.create({
      data: { userId: toUserId, amount: coinAmount, reason: 'admin', message: 'Coin transfer from ' + (session.user as any).name },
    });
  }

  const msg = await prisma.message.create({
    data: { fromUserId: senderId, toUserId, type: type || 'general', subject, body, coins: coinAmount },
  });
  return NextResponse.json(msg);
}
