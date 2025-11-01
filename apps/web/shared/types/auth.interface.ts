import { IUser } from "./user.interface";

export interface IAuthRegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface IAuthLoginForm {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: IUser;
}
