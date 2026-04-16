import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { RapidxchangeComponent } from './features/rapidxchange/rapidxchange.component';
import { InStoreComponent } from './features/in-store/in-store.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    HeaderComponent,
    RapidxchangeComponent,
    InStoreComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
