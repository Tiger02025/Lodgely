import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { Role, BookingStatus } from '../common/enums';
import { UserPayload } from '../common/interfaces/user-payload.interface';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateBookingDto, user: UserPayload) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.status !== 'AVAILABLE') {
      throw new BadRequestException('Property is not available for booking');
    }

    const checkInDate = new Date(dto.checkInDate);
    const checkOutDate = new Date(dto.checkOutDate);

    if (checkInDate >= checkOutDate) {
      throw new BadRequestException('Check-out date must be after check-in date');
    }

    const days = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const totalPrice = property.price * days;

    const booking = await this.prisma.booking.create({
      data: {
        userId: user.id,
        propertyId: dto.propertyId,
        checkInDate,
        checkOutDate,
        totalPrice,
        status: BookingStatus.PENDING,
      },
      include: {
        property: {
          include: {
            images: {
              orderBy: { isPrimary: 'desc' },
              take: 1,
            },
            landlord: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    await this.notificationsService.create({
      userId: property.landlordId,
      title: 'New Booking Request',
      message: `You have a new booking request for ${property.title}`,
      type: 'BOOKING_REQUEST',
      data: { bookingId: booking.id, propertyId: property.id },
    });

    return booking;
  }

  async findAll(userId: string, role: string) {
    if (role === 'LANDLORD') {
      return this.prisma.booking.findMany({
        where: {
          property: {
            landlordId: userId,
          },
        },
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
      });
    }

    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            images: {
              orderBy: { isPrimary: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: UserPayload) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        property: {
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
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        payment: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (
      booking.userId !== user.id &&
      booking.property.landlordId !== user.id &&
      user.role !== Role.ADMIN
    ) {
      throw new BadRequestException('You do not have access to this booking');
    }

    return booking;
  }

  async update(id: string, dto: UpdateBookingDto, user: UserPayload) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        property: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.property.landlordId !== user.id && user.role !== Role.ADMIN) {
      throw new BadRequestException('You do not have permission to update this booking');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: dto.status as BookingStatus,
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

    await this.notificationsService.create({
      userId: booking.userId,
      title: 'Booking Status Updated',
      message: `Your booking for ${booking.property.title} has been ${dto.status.toLowerCase()}`,
      type: dto.status === 'APPROVED' ? 'BOOKING_APPROVED' : 'BOOKING_REJECTED',
      data: { bookingId: booking.id, status: dto.status },
    });

    return updatedBooking;
  }

  async cancel(id: string, user: UserPayload) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== user.id && user.role !== Role.ADMIN) {
      throw new BadRequestException('You do not have permission to cancel this booking');
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        updatedAt: new Date(),
      },
    });
  }
}
