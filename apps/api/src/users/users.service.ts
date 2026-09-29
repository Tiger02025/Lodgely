import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        university: true,
        studentId: true,
        isVerified: true,
        universityVerified: true,
        phone: true,
        profileImage: true,
        bio: true,
        stripeAccountId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        universityVerified: true,
      },
    });
    return user;
  }

  async updateProfile(id: string, data: Partial<User>) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        bio: data.bio,
        profileImage: data.profileImage,
        university: data.university,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        university: true,
        studentId: true,
        isVerified: true,
        universityVerified: true,
        phone: true,
        profileImage: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  async updateStripeAccount(id: string, accountId: string) {
    return this.prisma.user.update({
      where: { id },
      data: { stripeAccountId: accountId },
    });
  }
}
