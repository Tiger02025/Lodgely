import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateReportDto } from './dto/report.dto';
import { Role, ReportStatus } from '../common/enums';
import { UserPayload } from '../common/interfaces/user-payload.interface';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateReportDto, user: UserPayload) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const report = await this.prisma.report.create({
      data: {
        userId: user.id,
        propertyId: dto.propertyId,
        reason: dto.reason,
        description: dto.description,
        status: ReportStatus.PENDING,
      },
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
    });

    await this.notificationsService.create({
      userId: property.landlordId,
      title: 'Property Reported',
      message: `A property listing has been reported: ${property.title}`,
      type: 'PROPERTY_REPORTED',
      data: { reportId: report.id, propertyId: dto.propertyId },
    });

    return report;
  }

  async findAll(params: { status?: ReportStatus; limit?: number; offset?: number }) {
    const where: any = {};
    if (params.status) {
      where.status = params.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip: params.offset || 0,
        take: params.limit || 20,
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

  async findOne(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
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
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async updateStatus(id: string, status: ReportStatus, user: UserPayload) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can update report status');
    }

    const report = await this.prisma.report.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
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
    });

    if (status === ReportStatus.RESOLVED) {
      await this.prisma.property.update({
        where: { id: report.propertyId },
        data: { status: 'UNAVAILABLE' },
      });
    }

    return report;
  }

  async getUserReports(userId: string) {
    return this.prisma.report.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            images: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
