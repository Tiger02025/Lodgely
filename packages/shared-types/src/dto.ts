import { UserRole } from './enums';

export interface RegisterStudentDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  university: string;
  studentId?: string;
  phone?: string;
}

export interface RegisterLandlordDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  propertyAddress: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreatePropertyDto {
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: number;
  longitude: number;
  price: number;
  currency?: string;
  deposit: number;
  monthlyRent: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  maxOccupancy: number;
  amenities: string[];
  images?: string[];
}

export interface UpdatePropertyDto extends Partial<CreatePropertyDto> {
  status?: string;
}

export interface CreateBookingDto {
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
}

export interface CreatePaymentIntentDto {
  bookingId: string;
  amount: number;
  currency?: string;
}

export interface CreateReportDto {
  propertyId: string;
  reason: string;
  description?: string;
}

export interface MatchRequest {
  userId: string;
  userPreferences: Record<string, unknown>;
  candidatePreferences: Record<string, unknown>[];
}
