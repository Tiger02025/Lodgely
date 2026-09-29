import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateReportDto, UpdateReportStatusDto } from './dto/report.dto';
import { ReportStatus, Role } from '../common/enums';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a report for a property' })
  async create(@Body() dto: CreateReportDto, @Request() req: any) {
    const report = await this.reportsService.create(dto, req.user);
    return { data: { report }, success: true };
  }

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all reports (admin only)' })
  async findAll(@Query() query: { status?: ReportStatus; limit?: number; offset?: number }) {
    const result = await this.reportsService.findAll(query);
    return { data: result, success: true };
  }

  @Get('my-reports')
  @ApiOperation({ summary: 'Get reports submitted by current user' })
  async getUserReports(@Request() req: any) {
    const reports = await this.reportsService.getUserReports(req.user.id);
    return { data: { reports }, success: true };
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get a report by ID (admin only)' })
  async findOne(@Param('id') id: string) {
    const report = await this.reportsService.findOne(id);
    return { data: { report }, success: true };
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update report status (admin only)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateReportStatusDto,
    @Request() req: any,
  ) {
    const report = await this.reportsService.updateStatus(id, body.status, req.user);
    return { data: { report }, success: true };
  }
}
