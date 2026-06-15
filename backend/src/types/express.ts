import { Role } from '@prisma/client';
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    assignedCategory?: string;
  };
  tenantFilter?: {
    organizationId?: string;
    franchiseId?: string;
  };
}
