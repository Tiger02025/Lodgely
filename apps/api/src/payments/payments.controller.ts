import {
  Body,
  Controller,
  Headers,
  Post,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreatePaymentIntentDto } from './dto/payment.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe payment intent for a booking' })
  async createPaymentIntent(@Body() dto: CreatePaymentIntentDto, @Request() req: any) {
    const result = await this.paymentsService.createPaymentIntent(dto, req.user.id);
    return { data: result, success: true };
  }

  @Post('onboarding')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe Connect onboarding link for landlords' })
  async createOnboardingLink(@Request() req: any) {
    const result = await this.paymentsService.createConnectAccount(req.user);
    return { data: result, success: true };
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  async stripeWebhook(@Headers('stripe-signature') signature: string, @Body() payload: any) {
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature');
    }
    return this.paymentsService.handleWebhook(payload);
  }
}
