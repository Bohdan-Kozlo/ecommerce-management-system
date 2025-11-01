export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  googleId: string | null;
  role: "USER" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
}
