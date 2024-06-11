import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from 'app/app.component';
import { ToastrModule, ToastrService } from 'ngx-toastr';

@NgModule({
  declarations: [],
  imports: [
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    })
  ],
  providers: [ToastrService],
  bootstrap: [AppComponent]
})
export class AppModule {}
