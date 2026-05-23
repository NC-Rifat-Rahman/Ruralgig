import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from './dto/send-email.dto';
import Mail from 'nodemailer/lib/mailer';

@Injectable()
export class MailerService {

    constructor(private readonly configService: ConfigService) { }

    mailTransport() {
        const transporter = nodemailer.createTransport({
            host: this.configService.get<string>('MAIL_HOST'),
            port: this.configService.get<number>('MAIL_PORT'),
            secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
            auth: {
                user: this.configService.get<string>('MAIL_USER'),
                pass: this.configService.get<string>('MAIL_PASSWORD'),
            },
        });

        return transporter;
    }

    async sendEmail(dto: SendEmailDto) {
        const { from, recipients, subject, html, text, placeHolderReplacements } = dto;
        const transporter = this.mailTransport();
        const mailOptions: Mail.Options = {
            from: from ?? {
                name: this.configService.get<string>('APP_NAME') || "",
                address: this.configService.get<string>('DEFAULT_MAIL_FROM') || "",
            },
            to: recipients,
            subject,
            html,
        }

        try {
            const result = await transporter.sendMail(mailOptions);

            return result;
        } catch (error) {
            console.log("Error: ", error);

        }
    }
}
