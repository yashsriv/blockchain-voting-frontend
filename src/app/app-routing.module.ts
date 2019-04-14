import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { environment } from 'src/environments/environment';

import { LoginContainerComponent } from './containers/login';
import { MainContainerComponent } from './containers/main';
import { AuthGuard } from './services/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: MainContainerComponent,
    canActivate: [AuthGuard],
  },
  { path: 'login', component: LoginContainerComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
