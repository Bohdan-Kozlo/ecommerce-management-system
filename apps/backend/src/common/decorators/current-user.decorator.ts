import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtAuthRequest } from '../types/types';

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<JwtAuthRequest>();
  return request.user;
});
