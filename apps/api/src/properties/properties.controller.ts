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
  Request,
  NotFoundException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto, PropertyFilterDto, UpdatePropertyDto } from './dto/property.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums';

interface VerifyPropertyBody {
  verified: boolean;
}

@ApiTags('properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @Roles(Role.LANDLORD)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new property listing' })
  @ApiResponse({ status: 201, description: 'Property created' })
  async create(@Body() dto: CreatePropertyDto, @Request() req: any) {
    const property = await this.propertiesService.create(dto, req.user);
    return { data: { property }, success: true };
  }

  @Get()
  @ApiOperation({ summary: 'Search properties with filters' })
  @ApiResponse({ status: 200, description: 'Properties found' })
  async findAll(@Query() filter: PropertyFilterDto) {
    const result = await this.propertiesService.findAll(filter);
    return { data: result, success: true };
  }

  @Get('landlord/my-properties')
  @Roles(Role.LANDLORD)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get properties for current landlord' })
  async getLandlordProperties(@Request() req: any) {
    const properties = await this.propertiesService.findByLandlord(req.user.id);
    return { data: { properties }, success: true };
  }

  @Get('saved')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get saved properties for current user' })
  async getSavedProperties(@Request() req: any) {
    const properties = await this.propertiesService.getSavedProperties(req.user.id);
    return { data: { properties }, success: true };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a property by ID' })
  async findOne(@Param('id') id: string) {
    const property = await this.propertiesService.findOne(id);
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    return { data: { property }, success: true };
  }

  @Patch(':id')
  @Roles(Role.LANDLORD)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a property' })
  async update(@Param('id') id: string, @Body() dto: UpdatePropertyDto, @Request() req: any) {
    try {
      const property = await this.propertiesService.update(id, dto, req.user);
      return { data: { property }, success: true };
    } catch (error) {
      throw new NotFoundException((error as Error).message);
    }
  }

  @Delete(':id')
  @Roles(Role.LANDLORD)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a property' })
  async remove(@Param('id') id: string, @Request() req: any) {
    try {
      await this.propertiesService.remove(id, req.user);
      return { data: { message: 'Property deleted' }, success: true };
    } catch (error) {
      throw new NotFoundException((error as Error).message);
    }
  }

  @Post(':id/save')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save a property to favorites' })
  async saveProperty(@Param('id') id: string, @Request() req: any) {
    const saved = await this.propertiesService.saveProperty(req.user.id, id);
    return { data: { saved }, success: true };
  }

  @Delete(':id/save')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a property from favorites' })
  async unsaveProperty(@Param('id') id: string, @Request() req: any) {
    await this.propertiesService.unsaveProperty(req.user.id, id);
    return { data: { message: 'Property unsaved' }, success: true };
  }

  @Post(':id/verify')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify a property (admin only)' })
  async verifyProperty(@Param('id') id: string, @Body() dto: VerifyPropertyBody) {
    const property = await this.propertiesService.verifyProperty(id, dto.verified);
    return { data: { property }, success: true };
  }
}
