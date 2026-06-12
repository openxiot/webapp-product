import {Component, OnInit} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {FormsModule} from '@angular/forms';
import {RouterLink, RouterOutlet} from '@angular/router';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {ProductBasic} from '@openxiot/xiot-core-spec-ts';
import {MainService} from '../../../service/main.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzCardModule} from 'ng-zorro-antd/card';
import pkg from '../../../../../package.json';

@Component({
  selector: 'main-application',
  standalone: true,
  templateUrl: './main.application.component.html',
  styleUrls: ['./main.application.component.less'],
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpinModule,
    FormsModule,
    RouterOutlet,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    RouterLink,
    NzRowDirective,
    NzColDirective,
    NzCardModule,
  ],
})
export class MainApplicationComponent implements OnInit {

  version: string = pkg.version;
  loading: boolean = true;
  products: ProductBasic[] = [];

  constructor(
    private service: MainService,
    private msg: NzMessageService,
  ) {
  }

  ngOnInit() {
    this.loadDataFromServer();
  }

  loadDataFromServer() {
    this.loading = true;
    this.service.getProducts('jd').subscribe({
      next: data => {
        this.products = data;
        this.loading = false;
      },
      error: error => {
        this.msg.warning('Failed to getProducts', error);
      }
    })
  }
}
