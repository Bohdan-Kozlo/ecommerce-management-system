import { Body, Controller, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AccessJwtGuard } from 'src/common/guards/acessJwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthUser } from 'src/common/types/types';
import { CreatePaymentDto } from './dto/create-payment.dto';
import type { Request } from 'express';

@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @UseGuards(AccessJwtGuard)
  @Post()
  createPayment(@CurrentUser() user: AuthUser, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.createPayment(createPaymentDto, user.userId);
  }

  @Post('webhook')
  webhook(@Req() req: Request) {
    return this.paymentService.handleCallback(req.body as Buffer, req.headers);
  }
}
