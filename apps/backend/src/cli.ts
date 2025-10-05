#!/usr/bin/env node
import { NestFactory } from '@nestjs/core';
import { Command } from 'commander';
import { CliModule } from './modules/cli/cli.module';
import { CliService } from './modules/cli/cli.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(CliModule, {
    logger: false,
  });

  const cliService = app.get(CliService);
  const program = new Command();

  program
    .name('backend-cli')
    .description('CLI commands for managing the backend application')
    .version('1.0.0');

  const grantAdminCommand = program
    .command('grant-admin')
    .description('Grant admin rights to a user')
    .argument('<email>', 'Email of the user');

  grantAdminCommand.action(async (email: string) => {
    try {
      await cliService.grantAdminRole(email);
      await app.close();
      process.exit(0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error:', errorMessage);
      await app.close();
      process.exit(1);
    }
  });

  await program.parseAsync(process.argv);
}

void bootstrap();
