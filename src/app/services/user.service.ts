import { Injectable } from '@angular/core';

@Injectable()
export class UserService {
  public userInfo = null;
  public password = null;

  public setPassword(password: string) {
    this.password = password;
  }
}
