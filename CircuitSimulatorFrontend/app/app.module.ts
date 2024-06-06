import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { AppComponent } from './app.component';
import { CircuitEditorComponent } from './components/circuit-editor/circuit-editor.component';
import { SimulationConfigComponent } from './components/simulation-config/simulation-config.component';
import { ResultsConsoleComponent } from './components/results-console/results-console.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    AppComponent,
    CircuitEditorComponent,
    SimulationConfigComponent,
    ResultsConsoleComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgxGraphModule,
    RouterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
