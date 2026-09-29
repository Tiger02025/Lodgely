import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Stripe } from 'stripe';
import { PaymentStatus, BookingStatus } from '../common/enums';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private readonly prisma: PrismaService) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(
    dto: { bookingId: string; amount: number; currency?: string },
    userId: string,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: {
        property: true,
        user: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new BadRequestException('You can only create payment for your own booking');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(dto.amount * 100),
      currency: dto.currency || 'usd',
      metadata: {
        bookingId: booking.id,
        userId: booking.userId,
        propertyId: booking.propertyId,
      },
    });

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        amount: dto.amount,
        currency: dto.currency || 'USD',
        status: PaymentStatus.PENDING,
        stripePaymentIntentId: paymentIntent.id,
        bookingId: booking.id,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
    };
  }

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata.bookingId;

        await this.prisma.payment.updateMany({
          where: { stripePaymentIntentId: paymentIntent.id },
          data: { status: PaymentStatus.SUCCEEDED },
        });

        if (bookingId) {
          await this.prisma.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.APPROVED },
          });
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.prisma.payment.updateMany({
          where: { stripePaymentIntentId: paymentIntent.id },
          data: { status: PaymentStatus.FAILED },
        });
        break;
      }
      default:
        break;
    }

    return { received: true };
  }

  async createConnectAccount(user: { id: string; email: string }) {
    const account = await this.stripe.accounts.create({
      type: 'express',
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { stripeAccountId: account.id },
    });

    const accountLink = await this.stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/onboarding/refresh`,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/onboarding/return`,
      type: 'account_onboarding',
    });

    return { url: accountLink.url };
  }
}
