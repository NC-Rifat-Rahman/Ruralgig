
import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { OtpType } from 'src/otp/type/otp-type';
import { OtpService } from 'src/otp/otp.service';

export type User = any;

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly otpService: OtpService
  ) { }
  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
  ];

  async register(dto: CreateUserDto): Promise<{ user: User, otp: string }> {
    const { email, password } = dto;

    const existingUser = await this.usersRepository.findOne(dto);

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await this.usersRepository.create(dto, hashedPassword);
    const generatedOtp = await this.otpService.generateOtp(newUser, OtpType.OTP);
    const emailDto = {
      recipient: email,
      subject: 'Your OTP Code',
      text: `Your OTP verification code is: <strong>${generatedOtp}</strong>`,
    };

    return { user: newUser, otp: generatedOtp };
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
}
