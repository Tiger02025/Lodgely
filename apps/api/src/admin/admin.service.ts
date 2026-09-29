import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, NotificationType } from '../common/enums';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationsService,
  ) {}

  async getAllUsers(params?: {
    role?: Role;
    isVerified?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    if (params?.role) where.role = params.role;
    if (params?.isVerified !== undefined) where.isVerified = params.isVerified;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: params?.offset || 0,
        take: params?.limit || 50,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          university: true,
          isVerified: true,
          universityVerified: true,
          phone: true,
          profileImage: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              properties: true,
              bookings: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total };
  }

  async getUser(id: string) {
    return this.prisma.user.findUnique({
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
        properties: {
          include: {
            images: true,
          },
        },
        bookings: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        reviews: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });
  }

  async getAllProperties(params?: { status?: string; limit?: number; offset?: number }) {
    const where: any = {};
    if (params?.status) where.status = params.status;

    const [data, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip: params?.offset || 0,
        take: params?.limit || 50,
        include: {
          images: true,
          landlord: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.property.count({ where }),
    ]);

    return { data, total };
  }

  async getAllBookings(params?: { status?: string; limit?: number; offset?: number }) {
    const where: any = {};
    if (params?.status) where.status = params.status;

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip: params?.offset || 0,
        take: params?.limit || 50,
        include: {
          property: {
            include: {
              images: {
                orderBy: { isPrimary: 'desc' },
                take: 1,
              },
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { data, total };
  }

  async getAllReports(params?: { status?: string; limit?: number; offset?: number }) {
    const where: any = {};
    if (params?.status) where.status = params.status;

    const [data, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip: params?.offset || 0,
        take: params?.limit || 50,
        include: {
          property: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.report.count({ where }),
    ]);

    return { data, total };
  }

  async getDashboardStats() {
    const [userCount, propertyCount, bookingCount, reportCount, pendingVerifications] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.property.count(),
        this.prisma.booking.count(),
        this.prisma.report.count(),
        this.prisma.user.count({ where: { isVerified: false } }),
      ]);

    const bookingsByStatus = await this.prisma.booking.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    });

    const propertiesByType = await this.prisma.property.groupBy({
      by: ['propertyType'],
      _count: {
        _all: true,
      },
    });

    return {
      totalUsers: userCount,
      totalProperties: propertyCount,
      totalBookings: bookingCount,
      totalReports: reportCount,
      pendingVerifications,
      bookingsByStatus: bookingsByStatus.reduce(
        (acc: Record<string, number>, curr) => ({ ...acc, [curr.status]: curr._count._all }),
        {},
      ),
      propertiesByType: propertiesByType.reduce(
        (acc: Record<string, number>, curr) => ({ ...acc, [curr.propertyType]: curr._count._all }),
        {},
      ),
    };
  }

  async updateUser(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        universityVerified: true,
        isActive: true,
      },
    });
  }

  async deleteUser(id: string) {
    await this.prisma.user.delete({
      where: { id },
    });
    return { message: 'User deleted successfully' };
  }

  async sendNotification(data: {
    userIds?: string[];
    role?: Role;
    title: string;
    message: string;
    type: NotificationType;
    data?: Record<string, any>;
  }) {
    let users: string[] = [];

    if (data.userIds) {
      users = data.userIds;
    } else if (data.role) {
      const usersWithRole = await this.prisma.user.findMany({
        where: { role: data.role },
        select: { id: true },
      });
      users = usersWithRole.map((u: { id: string }) => u.id);
    }

    const notifications = await Promise.all(
      users.map((userId) =>
        this.notificationService.create({
          userId,
          title: data.title,
          message: data.message,
          type: data.type,
          data: data.data,
        }),
      ),
    );

    return { count: notifications.length };
  }
}
