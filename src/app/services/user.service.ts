import { Injectable } from '@angular/core';

@Injectable()
export class UserService {
  public userInfo = null;
  private password = null;

  public setPassword(password: string) {
    this.password = password;
  }
}
