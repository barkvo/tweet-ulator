export type UserId = string & { readonly type: unique symbol };

export interface User {
  id: UserId;
  name: string;
  createdAt: number;
}

export type UserToCreate = Omit<User, 'id' | 'createdAt'>;

export const USERS_TABLE = 'users';
