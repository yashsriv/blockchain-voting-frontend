import { AuthService } from './auth.service';
import { AuthGuard } from './auth-guard.service';
import { UserService } from './user.service';

export const services = [AuthGuard, AuthService, UserService];
