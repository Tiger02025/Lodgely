import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role, ReportStatus, NotificationType } from '../common/enums';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getStats() {
    const stats = await this.adminService.getDashboardStats();
    return { data: stats, success: true };
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  async getUsers(
    @Query() query: { role?: Role; isVerified?: boolean; limit?: number; offset?: number },
  ) {
    const result = await this.adminService.getAllUsers(query);
    return { data: result, success: true };
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get a user by ID' })
  async getUser(@Param('id') id: string) {
    const user = await this.adminService.getUser(id);
    return { data: { user }, success: true };
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update a user' })
  async updateUser(@Param('id') id: string, @Body() body: any) {
    const user = await this.adminService.updateUser(id, body);
    return { data: { user }, success: true };
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete a user' })
  async deleteUser(@Param('id') id: string) {
    const result = await this.adminService.deleteUser(id);
    return { data: result, success: true };
  }

  @Get('properties')
  @ApiOperation({ summary: 'Get all properties' })
  async getProperties(@Query() query: { status?: string; limit?: number; offset?: number }) {
    const result = await this.adminService.getAllProperties(query);
    return { data: result, success: true };
  }

  @Get('bookings')
  @ApiOperation({ summary: 'Get all bookings' })
  async getBookings(@Query() query: { status?: string; limit?: number; offset?: number }) {
    const result = await this.adminService.getAllBookings(query);
    return { data: result, success: true };
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get all reports' })
  async getReports(@Query() query: { status?: ReportStatus; limit?: number; offset?: number }) {
    const result = await this.adminService.getAllReports(query);
    return { data: result, success: true };
  }

  @Post('notifications')
  @ApiOperation({ summary: 'Send notifications to users' })
  async sendNotification(
    @Body()
    body: {
      userIds?: string[];
      role?: Role;
      title: string;
      message: string;
      type: NotificationType;
      data?: Record<string, any>;
    },
  ) {
    const result = await this.adminService.sendNotification(body);
    return { data: result, success: true };
  }
}
