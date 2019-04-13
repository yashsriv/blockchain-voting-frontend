import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { containers } from './containers';
import { services } from './services';

@NgModule({
  declarations: [AppComponent, ...containers],
  imports: [
    // Core Angular Stuff
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    HttpClientModule,

    // Angular Material Stuff
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,

    // Local stuff
    AppRoutingModule,
  ],
  providers: [...services],
  bootstrap: [AppComponent],
})
export class AppModule {}
