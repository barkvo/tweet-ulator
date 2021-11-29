import { Request } from 'express';
import { UserId } from '../users/users.types';

export type AccessToken = string & { readonly type: unique symbol };

export interface TokenPayload {
  userId: UserId;
}

export type AuthenticatedRequest = Request & {
  user: TokenPayload;
};
