import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto, PropertyFilterDto, UpdatePropertyDto } from './dto/property.dto';
import { PropertyStatus, Role } from '../common/enums';
import { UserPayload } from '../common/interfaces/user-payload.interface';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePropertyDto, user: UserPayload) {
    const property = await this.prisma.property.create({
      data: {
        title: dto.title,
        description: dto.description,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        zipCode: dto.zipCode,
        country: dto.country,
        latitude: dto.latitude,
        longitude: dto.longitude,
        price: dto.price,
        currency: dto.currency || 'USD',
        deposit: dto.deposit,
        monthlyRent: dto.monthlyRent,
        propertyType: dto.propertyType,
        bedrooms: dto.bedrooms,
        bathrooms: dto.bathrooms,
        maxOccupancy: dto.maxOccupancy,
        amenities: dto.amenities.join(','),
        status: PropertyStatus.PENDING_VERIFICATION,
        landlordId: user.id,
        images: {
          create:
            dto.images?.map((url, index) => ({
              url,
              isPrimary: index === 0,
            })) || [],
        },
      },
      include: {
        images: true,
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });
    return property;
  }

  async findAll(
    filter: PropertyFilterDto,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const { limit = 20, offset = 0, ...filters } = filter;

    const where: any = {
      status: PropertyStatus.AVAILABLE,
    };

    if (filters.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }
    if (filters.state) {
      where.state = filters.state;
    }
    if (filters.propertyType) {
      where.propertyType = filters.propertyType;
    }
    if (filters.minPrice) {
      where.price = { ...where.price, gte: Number(filters.minPrice) };
    }
    if (filters.maxPrice) {
      where.price = { ...where.price, lte: Number(filters.maxPrice) };
    }
    if (filters.bedrooms) {
      where.bedrooms = { gte: Number(filters.bedrooms) };
    }
    if (filters.bathrooms) {
      where.bathrooms = { gte: Number(filters.bathrooms) };
    }
    if (filters.amenities) {
      const amenityList = filters.amenities.split(',').map((a) => a.trim());
      where.amenities = { hasSome: amenityList };
    }
    if (filters.lat && filters.lng && filters.radius) {
      const radiusInDegrees = Number(filters.radius) / 6371;
      where.OR = [
        {
          latitude: {
            gte: Number(filters.lat) - radiusInDegrees,
            lte: Number(filters.lat) + radiusInDegrees,
          },
          longitude: {
            gte: Number(filters.lng) - radiusInDegrees,
            lte: Number(filters.lng) + radiusInDegrees,
          },
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip: Number(offset),
        take: Number(limit),
        include: {
          images: {
            orderBy: { isPrimary: 'desc' },
          },
          landlord: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImage: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      data: (data as any[]).map((property) => ({
        ...property,
        amenities: property.amenities ? property.amenities.split(',') : [],
      })),
      total,
      page: Math.floor(Number(offset) / Number(limit)) + 1,
      limit: Number(limit),
    };
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { isPrimary: 'desc' },
        },
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
            bio: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    return property;
  }

  async findByLandlord(landlordId: string) {
    return this.prisma.property.findMany({
      where: { landlordId },
      include: {
        images: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, dto: UpdatePropertyDto, user: UserPayload) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new Error('Property not found');
    }

    if (property.landlordId !== user.id && user.role !== Role.ADMIN) {
      throw new Error('You do not have permission to update this property');
    }

    const { images: _images, ...propertyData } = dto;
    const updateData: any = { ...propertyData, updatedAt: new Date() };
    if (propertyData.amenities && Array.isArray(propertyData.amenities)) {
      updateData.amenities = propertyData.amenities.join(',');
    }

    return this.prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        images: true,
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async remove(id: string, user: UserPayload) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new Error('Property not found');
    }

    if (property.landlordId !== user.id && user.role !== Role.ADMIN) {
      throw new Error('You do not have permission to delete this property');
    }

    await this.prisma.property.delete({
      where: { id },
    });
  }

  async saveProperty(userId: string, propertyId: string) {
    return this.prisma.savedProperty.create({
      data: {
        userId,
        propertyId,
      },
    });
  }

  async unsaveProperty(userId: string, propertyId: string) {
    await this.prisma.savedProperty.deleteMany({
      where: { userId, propertyId },
    });
  }

  async getSavedProperties(userId: string) {
    const saved = await this.prisma.savedProperty.findMany({
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
    return saved.map((s) => s.property);
  }

  async addImage(propertyId: string, imageUrl: string) {
    return this.prisma.image.create({
      data: {
        property: { connect: { id: propertyId } },
        url: imageUrl,
      },
    });
  }

  async verifyProperty(id: string, verified: boolean) {
    return this.prisma.property.update({
      where: { id },
      data: {
        status: verified ? PropertyStatus.AVAILABLE : PropertyStatus.PENDING_VERIFICATION,
      },
    });
  }
}
