import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { ReportStatus } from '../../common/enums';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateReportStatusDto {
  @IsEnum(ReportStatus)
  status: ReportStatus;

  @IsOptional()
  @IsString()
  adminNote?: string;
}
