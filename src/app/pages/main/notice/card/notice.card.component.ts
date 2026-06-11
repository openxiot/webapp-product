import {Component} from '@angular/core';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzListEmptyComponent} from 'ng-zorro-antd/list';
import {NzTabComponent, NzTabSetComponent, NzTabsModule} from 'ng-zorro-antd/tabs';

@Component({
  selector: 'notice-card',
  standalone: true,
  templateUrl: './notice.card.component.html',
  styleUrls: ['./notice.card.component.less'],
  imports: [
    NzCardModule,
    NzListEmptyComponent,
    NzTabSetComponent,
    NzTabComponent,
  ],
})
export class NoticeCardComponent {

  constructor(
  ) {
  }
}
