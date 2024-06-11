import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AppComponent } from 'app/app.component';
import { CircuitEditorComponent } from 'app/components/circuit-editor/circuit-editor.component';
import { SimulationConfigComponent } from 'app/components/simulation-config/simulation-config.component';
import { ResultsConsoleComponent } from 'app/components/results-console/results-console.component';
import { AppRoutingModule } from './routing.module';

@NgModule({
  declarations: [
    AppComponent,
    CircuitEditorComponent,
    SimulationConfigComponent,
    ResultsConsoleComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule,
    ToastrModule.forRoot(),
    FormsModule,
    NgxSpinnerModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
