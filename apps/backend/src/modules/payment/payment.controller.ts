import { Body, Controller, Post, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/common/types/types';
import { CreatePaymentDto } from './dto/create-payment.dto';
import type { Request } from 'express';

@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Auth()
  @Post()
  createPayment(@CurrentUser() user: AuthUser, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.createPayment(createPaymentDto, user.userId);
  }

  @Post('webhook')
  webhook(@Req() req: Request & { rawBody: Buffer }) {
    return this.paymentService.handleCallback(req.rawBody, req.headers);
  }
}
