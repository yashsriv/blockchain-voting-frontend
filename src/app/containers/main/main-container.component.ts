import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { UserService } from 'src/app/services/user.service';
import { PlatformService } from 'src/app/services/platform.service';
import { PlatformInfo } from 'src/app/models/platform';

@Component({
  templateUrl: './main-container.component.html',
  styleUrls: ['./main-container.component.scss'],
})
export class MainContainerComponent {
  loading = true;
  platformInfo: PlatformInfo;

  constructor(
    private http: HttpClient,
    private platform: PlatformService,
    public user: UserService
  ) {}

  ngOnInit() {
    this.platform.fetchPlatformInfo().subscribe(info => {
      this.platformInfo = info;
      this.loading = false;
    });
  }
}
