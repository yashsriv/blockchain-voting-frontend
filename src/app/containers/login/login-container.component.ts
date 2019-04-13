import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  templateUrl: './login-container.component.html',
  styleUrls: ['./login-container.component.scss'],
})
export class LoginContainerComponent {
  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  private loading = false;
  private errored = false;

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  onSubmit() {
    this.loading = true;
    this.errored = false;
    this.auth.login(this.loginForm.value).subscribe(
      res => {
        this.router.navigate(['/']);
      },
      err => {
        console.error(err);
        this.errored = true;
        this.loading = false;
      },
      () => {
        this.loading = false;
      }
    );
  }
}
