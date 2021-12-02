import { makeAutoObservable } from "mobx";
import { AuthStoreInterface, User } from "./auth.types";

export class AuthStore implements AuthStoreInterface {
  constructor() {
    makeAutoObservable(this);
  }

  public user?: User;

  public get isAuthenticated() {
    return !!this.user;
  }

  public setUser = (value?: User) => {
    this.user = value;
  };
}
