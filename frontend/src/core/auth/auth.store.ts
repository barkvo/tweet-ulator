import { action, computed, observable } from "mobx";
import { AuthStore as AuthStoreInterface, User } from "./auth.types";

export class AuthStore implements AuthStoreInterface {
  @observable
  public user?: User;

  @computed
  public get isAuthenticated() {
    return !!this.user;
  }

  @action
  public setUser = (value?: User) => {
    this.user = value;
  };
}
