import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  async findAll(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const filters = {
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      unreadOnly: unreadOnly === 'true',
    };
    const notifications = await this.notificationsService.findAll(req.user.id, filters);
    return { data: { notifications }, success: true };
  }

  @Post('read')
  @ApiOperation({ summary: 'Mark notifications as read' })
  async markAsRead(@Body() body: { notificationIds: string[] }, @Request() req: any) {
    const result = await this.notificationsService.markAsRead(req.user.id, body.notificationIds);
    return { data: result, success: true };
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@Request() req: any) {
    const result = await this.notificationsService.markAllAsRead(req.user.id);
    return { data: result, success: true };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notification by ID' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    const notification = await this.notificationsService.findOne(id, req.user.id);
    return { data: { notification }, success: true };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  async delete(@Param('id') id: string, @Request() req: any) {
    await this.notificationsService.delete(id, req.user.id);
    return { data: { message: 'Notification deleted' }, success: true };
  }
}
