import { BadRequestException, Injectable } from '@nestjs/common';
import { UserEntity } from 'src/users/entities/users.entity';
import { IAuthStrategy, LoginCredentials } from '../interfaces/auth-strategy.interface';

/**
 * PhoneAuthStrategy — handles worker accounts that sign in with
 * phone number + OTP (SMS).
 *
 * SMS OTP is omitted for now because it is not freely available in BD.
 * The strategy is registered and wired up so that when SMS becomes
 * available the only change needed is:
 *   1. Inject UsersService and OtpService here
 *   2. Implement validate() below
 *   3. Add phone? and otp? to LoginDto
 *
 * AuthService, auth.module.ts, and the controller need zero changes.
 */
@Injectable()
export class PhoneAuthStrategy implements IAuthStrategy {
    // constructor(
    //   private readonly usersService: UsersService,
    //   private readonly otpService: OtpService,
    // ) {}

    supports(credentials: LoginCredentials): boolean {
        return !!(credentials.phone && credentials.otp && !credentials.email);
    }

    async validate(_credentials: LoginCredentials): Promise<UserEntity> {
        // TODO: implement when SMS OTP is available
        //
        // const user = await this.usersService.findOneByPhone(_credentials.phone!);
        // if (!user) throw new UnauthorizedException('Invalid credentials');
        //
        // await this.otpService.validateOtp(user.id, _credentials.otp!, OtpType.PHONE_OTP);
        //
        // return user;

        throw new BadRequestException(
            'Phone authentication is not yet available. Please use email and password.',
        );
    }
}