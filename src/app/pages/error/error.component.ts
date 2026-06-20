import {Component} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [
    TranslatePipe
  ],
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.less']
})
export class ErrorComponent  {
}
