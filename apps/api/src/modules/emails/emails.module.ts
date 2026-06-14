import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationsConfig } from './config/notifications.config';
import { NotificationsInternalModule } from './config/notifications.internal-module';
import { EmailService } from './email.service';
import { SendConfirmationEmailWhenUserRegisteredEventHandler } from './application/event-handlers/send-confirmation-email-when-user-registered.event-handler';

@Module({
  imports: [
    NotificationsInternalModule,
    MailerModule.forRootAsync({
      useFactory: async (config: NotificationsConfig) => ({
        transport: {
          host: config.emailHost,
          port: config.emailPort,
          secure: true,
          auth: {
            user: config.email,
            pass: config.emailPass,
          },
        },
        defaults: {
          from: `"No Reply" <${config.email}>`,
        },
      }),
      inject: [NotificationsConfig],
      imports: [NotificationsInternalModule],
    }),
  ],
  providers: [
    EmailService,
    SendConfirmationEmailWhenUserRegisteredEventHandler,
  ],
  exports: [EmailService],
})
export class EmailsModule {}
