import { Controller } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { Send } from 'express';
import { SendEmailDto } from './dto/send-email.dto';

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) { }

  async sendEmail(dto: SendEmailDto) {
    const result = await this.mailerService.sendEmail(dto);
    return result;
  }
}
