// auth-service/src/auth/strategies/auth-strategy.interface.ts
// return AuthenticatedUser instead of any
export interface IAuthStrategy {
  validate(credential: string, secret: string): Promise<any>;
}

// Phone + OTP strategy for workers
export class PhoneAuthStrategy implements IAuthStrategy {
  async validate(phone: string, otp: string): Promise<any> {
    // 1. Look up user by phone
    // 2. Verify OTP from Redis
    // 3. Return user or throw UnauthorizedException
  }
}

// Email + Password strategy for businesses
export class EmailAuthStrategy implements IAuthStrategy {
  async validate(email: string, password: string): Promise<any> {
    // 1. Look up user by email
    // 2. bcrypt.compare(password, user.passwordHash)
    // 3. Return user or throw UnauthorizedException
  }
}