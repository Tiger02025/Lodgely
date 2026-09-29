export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  university?: string;
  studentId?: string;
  isVerified: boolean;
  universityVerified: boolean;
  phone?: string;
  profileImage?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProperty {
  id: string;
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
  currency: string;
  deposit: number;
  monthlyRent: number;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  maxOccupancy: number;
  amenities: string[];
  status: PropertyStatus;
  landlordId: string;
  createdAt: Date;
  updatedAt: Date;
  images?: IImage[];
  reviews?: IReview[];
}

export interface IImage {
  id: string;
  propertyId: string;
  url: string;
  publicId?: string;
  altText?: string;
  isPrimary: boolean;
  createdAt: Date;
}

export interface IBooking {
  id: string;
  userId: string;
  propertyId: string;
  checkInDate: Date;
  checkOutDate: Date;
  status: BookingStatus;
  totalPrice: number;
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  bookingId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISavedProperty {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: Date;
}

export interface IReport {
  id: string;
  userId: string;
  propertyId: string;
  reason: string;
  description?: string;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: Date;
}

export interface IMatch {
  id: string;
  userAId: string;
  userBId: string;
  score: number;
  reasons: string[];
  status: MatchStatus;
  createdAt: Date;
}

export interface IReview {
  id: string;
  userId: string;
  propertyId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: IUser;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
}

export interface PropertySearchParams {
  city?: string;
  state?: string;
  propertyType?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  limit?: number;
  offset?: number;
}
