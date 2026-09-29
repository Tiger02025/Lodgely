import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('matching')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Post('request')
  @ApiOperation({ summary: 'Request AI roommate matches' })
  async requestMatch(@Request() req: any) {
    const matches = await this.matchingService.requestMatch(req.user.id);
    return { data: { matches }, success: true };
  }

  @Get()
  @ApiOperation({ summary: 'Get all matches for current user' })
  async getMatches(@Request() req: any) {
    const matches = await this.matchingService.getMatches(req.user.id);
    return { data: { matches }, success: true };
  }

  @Patch(':id/respond')
  @ApiOperation({ summary: 'Respond to a match request' })
  async respondToMatch(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { accept: boolean },
  ) {
    try {
      const match = await this.matchingService.respondToMatch(id, req.user.id, body.accept);
      return { data: { match }, success: true };
    } catch (error) {
      throw new NotFoundException((error as Error).message);
    }
  }
}
