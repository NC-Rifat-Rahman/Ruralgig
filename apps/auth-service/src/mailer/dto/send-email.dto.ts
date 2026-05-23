import { Address } from "nodemailer/lib/mailer"

export type SendEmailDto = {
    from?: Address;
    recipients: string | string[];
    subject: string;
    html: string;
    text?: string;
    placeHolderReplacements?: Record<string, string>;
}