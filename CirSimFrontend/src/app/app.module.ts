import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConfigMenuComponent } from './config-menu/config-menu.component';
import { CircuitEditorComponent } from './circuit-editor/circuit-editor.component';
import { ResultsConsoleComponent } from './results-console/results-console.component';
import { ToastrModule } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    ConfigMenuComponent,
    CircuitEditorComponent,
    ResultsConsoleComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
    FormsModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      closeButton: true,
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
