import { IsDateString, IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { BookingStatus } from '../../common/enums';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @IsDateString()
  checkInDate: string;

  @IsDateString()
  checkOutDate: string;
}

export class UpdateBookingDto {
  @IsEnum(BookingStatus)
  status: BookingStatus;
}
