import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Role } from '../common/enums';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _password, ...result } = user;
    return result;
  }

  async login(user: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    isVerified: boolean;
  }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
      },
    };
  }

  async registerStudent(dto: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    university: string;
    studentId?: string;
    phone?: string;
  }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: Role.STUDENT,
        university: dto.university,
        studentId: dto.studentId,
        phone: dto.phone,
        isVerified: true,
      },
    });

    const { password: _password, ...result } = user;
    return result;
  }

  async registerLandlord(dto: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    propertyAddress: string;
  }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: Role.LANDLORD,
        university: dto.propertyAddress,
        isVerified: true,
      },
    });

    const { password: _password, ...result } = user;
    return result;
  }

  async verifyStudentEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        emailVerificationToken: null,
        emailVerifiedAt: new Date(),
      },
    });

    return { message: 'Email verified successfully' };
  }

  async verifyStudentUniversity(
    userId: string,
    studentId: string,
  ): Promise<{ message: string; status: string }> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, role: Role.STUDENT },
    });

    if (!user) {
      throw new NotFoundException('Student account not found');
    }

    if (user.universityVerified) {
      return { message: 'University already verified', status: 'VERIFIED' };
    }

    // Record the submitted student id so an admin can review it; the account
    // stays unverified until that review happens.
    await this.prisma.user.update({
      where: { id: userId },
      data: { studentId },
    });

    return {
      message: 'University verification submitted for review',
      status: 'PENDING',
    };
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Always report the same thing so the endpoint cannot be used to discover
    // which email addresses have accounts.
    if (!user) {
      return { message: 'If the email exists, a reset link will be sent' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpires: expires },
    });

    return {
      message: 'If the email exists, a reset link will be sent',
      // No mail provider is wired up yet; surface the token outside production
      // so the flow stays testable end to end.
      ...(process.env.NODE_ENV !== 'production' ? { resetToken: token } : {}),
    };
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: { passwordResetToken: token },
    });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: await bcrypt.hash(password, 10),
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return { message: 'Password reset successfully' };
  }
}
