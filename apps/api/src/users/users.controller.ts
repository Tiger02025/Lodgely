import { Body, Controller, Get, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@Request() req: any) {
    const user = await this.usersService.findById(req.user.id);
    return { data: { user }, success: true };
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(@Request() req: any, @Body() body: any) {
    const user = await this.usersService.updateProfile(req.user.id, body);
    return { data: { user }, success: true };
  }

  @Get('landlords/:id')
  @ApiOperation({ summary: 'Get landlord public profile' })
  async getLandlordProfile(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return { data: { user }, success: true };
  }
}
