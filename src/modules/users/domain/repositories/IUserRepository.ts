import type { UserProps } from "../entities/User";

export interface IUserRepository {
   findByEmail(email: string): Promise<UserProps | null>;
   findById(id: string): Promise<UserProps | null>;
   findByUsername(username: string): Promise<UserProps | null>;
   create(user: Omit<UserProps, "id">): Promise<UserProps>;
   update(id: string, user: Partial<UserProps>): Promise<UserProps>;
}
