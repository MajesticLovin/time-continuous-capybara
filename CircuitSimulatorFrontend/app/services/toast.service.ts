import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private toastr: ToastrService) {}

  show(message: string, title: string = ''): void {
    this.toastr.show(message, title, {
      positionClass: 'toast-bottom-right',
      closeButton: true,
      timeOut: 3000  // 3 segundos
    });
  }
}
