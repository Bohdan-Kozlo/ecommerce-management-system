import { Injectable } from '@nestjs/common';
import { EmailUserFactory } from './email-user.factory';
import { GoogleUserFactory } from './google-user.factory';
import { IUserFactory } from './interfaces';
import { AuthProvider } from './interfaces';

@Injectable()
export class UserFactoryProvider {
  private factories: Map<AuthProvider, IUserFactory>;

  constructor(
    private emailUserFactory: EmailUserFactory,
    private googleUserFactory: GoogleUserFactory,
  ) {
    this.factories = new Map<AuthProvider, IUserFactory>([
      [AuthProvider.EMAIL, this.emailUserFactory],
      [AuthProvider.GOOGLE, this.googleUserFactory],
    ]);
  }

  getFactory(provider: AuthProvider): IUserFactory {
    const factory = this.factories.get(provider);

    if (!factory) {
      throw new Error(`Factory for provider ${provider} not found`);
    }

    return factory;
  }

  getAvailableProviders(): AuthProvider[] {
    return Array.from(this.factories.keys());
  }
}
