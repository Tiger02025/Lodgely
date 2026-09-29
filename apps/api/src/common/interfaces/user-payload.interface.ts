import { Role } from '../enums';

export interface UserPayload {
  id: string;
  email: string;
  role: Role;
}
