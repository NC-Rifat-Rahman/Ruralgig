import { UserEntity } from 'src/users/entities/users.entity';

export const AUTH_STRATEGIES = 'AUTH_STRATEGIES';

/**
 * The credential bag passed to every strategy. Fields are optional because
 * different strategies consume different subsets (email+password vs phone+otp).
 * Class-level validation happens in the DTO before this point.
 */
export interface LoginCredentials {
  email?: string;
  phone?: string;
  password?: string;
  otp?: string;
}

/**
 * Strategy Pattern — auth method contract.
 *
 * supports()  → determines at runtime whether this strategy handles the
 *               given credentials. AuthService picks the first match.
 *
 * validate()  → performs the actual verification, returns a UserEntity on
 *               success or throws UnauthorizedException on failure.
 *
 * Adding a new auth method (e.g. Google OAuth, TOTP) = one new class that
 * implements this interface + one line in auth.module.ts. AuthService never
 * changes. That is OCP in practice.
 */
export interface IAuthStrategy {
  supports(credentials: LoginCredentials): boolean;
  validate(credentials: LoginCredentials): Promise<UserEntity>;
}