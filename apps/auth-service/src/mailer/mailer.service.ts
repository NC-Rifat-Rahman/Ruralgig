import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class MailerService {
    constructor(private readonly configService: ConfigService) { }

    private mailTransport() {
        const transporter = nodemailer.createTransport({
            host: this.configService.get<string>('MAIL_HOST'),
            port: this.configService.get<number>('MAIL_PORT'),
            secure: false,
            auth: {
                user: this.configService.get<string>('MAIL_USER'),
                pass: this.configService.get<string>('MAIL_PASSWORD'),
            },
            debug: true,
            logger: true,
        });
        return transporter;
    }


    async sendEmail(dto: SendEmailDto) {
        const { from, recipients, subject, html, text, placeHolderReplacements } = dto;
        const transporter = this.mailTransport();

        const mailOptions = {
            from: from ?? {
                name: this.configService.get<string>('APP_NAME') || 'Your App',
                address: this.configService.get<string>('DEFAULT_MAIL_FROM') || '',
            },
            to: recipients,
            subject: subject,
            html: html || text,
        };

        try {
            const result = await transporter.sendMail(mailOptions);
            console.log('✅ Email sent successfully:', result.messageId);
            return result;
        } catch (error: any) {
            console.error('❌ Email sending failed:');
            console.error('Error Code:', error.code);
            console.error('Response:', error.response);
            console.error('Full Error:', error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
}