import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Request,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking request' })
  @ApiResponse({ status: 201, description: 'Booking created' })
  async create(@Body() dto: CreateBookingDto, @Request() req: any) {
    const booking = await this.bookingsService.create(dto, req.user);
    return { data: { booking }, success: true };
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings for current user' })
  async findAll(@Request() req: any) {
    const bookings = await this.bookingsService.findAll(req.user.id, req.user.role);
    return { data: { bookings }, success: true };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a booking by ID' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    const booking = await this.bookingsService.findOne(id, req.user);
    return { data: { booking }, success: true };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update booking status' })
  async update(@Param('id') id: string, @Body() dto: UpdateBookingDto, @Request() req: any) {
    try {
      const booking = await this.bookingsService.update(id, dto, req.user);
      return { data: { booking }, success: true };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException((error as Error).message);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel a booking' })
  async cancel(@Param('id') id: string, @Request() req: any) {
    try {
      const booking = await this.bookingsService.cancel(id, req.user);
      return { data: { booking }, success: true };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException((error as Error).message);
    }
  }
}
