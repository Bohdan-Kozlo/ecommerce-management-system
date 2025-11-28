import { applyDecorators, UseGuards } from '@nestjs/common';
import { AccessJwtGuard } from '../guards/acessJwt.guard';
import { AdminGuard } from '../guards/admin.guard';

export function Auth() {
  return applyDecorators(UseGuards(AccessJwtGuard));
}

export function AdminAuth() {
  return applyDecorators(UseGuards(AccessJwtGuard, AdminGuard));
}
