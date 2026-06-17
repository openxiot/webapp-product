import {Component, OnInit} from '@angular/core';
import {NzPageHeaderModule} from 'ng-zorro-antd/page-header';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzStepsModule} from 'ng-zorro-antd/steps';
import {NzSpaceModule} from 'ng-zorro-antd/space';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {ActivatedRoute, Router} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd/message';
import {
  FormatDefinition,
  FormatType, LifeCycle,
  Spec,
  UrnType
} from '@openxiot/xiot-core-spec-ts';
import {MainService} from '../../../../../service/main.service';
import {AccountService} from '../../../../../service/account.service';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'spec-format-add',
  standalone: true,
  templateUrl: './spec.format.add.component.html',
  styleUrls: ['./spec.format.add.component.less'],
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpinModule,
    NzCardModule,
    NzButtonModule,
    NzCheckboxModule,
    NzFormModule,
    NzInputModule,
    NzStepsModule,
    NzSpaceModule,
    NzDividerModule,
    ReactiveFormsModule,
    TranslatePipe,
  ],
})
export class SpecFormatAddComponent implements OnInit {

  loading: boolean = false;
  formats: FormatDefinition[] = [];
  formatExist: Set<string> = new Set();

  constructor(
    private router: Router,
    protected account: AccountService,
    private route: ActivatedRoute,
    private msg: NzMessageService,
    private service: MainService,
  ) {
  }

  ngOnInit() {
    this.initDefaultFormats();
    this.loadDataFromServer();
  }

  private initDefaultFormats() {
    this.formats.push(this.createFormat('string', 'string', '字符串'));
    this.formats.push(this.createFormat('bool', 'bool', '布尔'));
    this.formats.push(this.createFormat('uint8', 'unsinged 8 bits integer', '无符号8位整型'));
    this.formats.push(this.createFormat('uint16', 'unsinged 16 bits integer', '无符号16位整型'));
    this.formats.push(this.createFormat('uint32', 'unsinged 32 bits integer', '无符号32位整型'));
    this.formats.push(this.createFormat('int8', 'singed 8 bits integer', '有符号8位整型'));
    this.formats.push(this.createFormat('int16', 'singed 16 bits integer', '有符号16位整型'));
    this.formats.push(this.createFormat('int32', 'singed 32 bits integer', '有符号32位整型'));
    this.formats.push(this.createFormat('int64', 'singed 64 bits integer', '有符号64位整型'));
    this.formats.push(this.createFormat('float', 'float', '浮点数'));
    this.formats.push(this.createFormat('hex', 'hex', '16进制字符串'));
    this.formats.push(this.createFormat('combination', 'combination', '组合数'));
  }

  private createFormat(code: string, descriptionENUS: string, descriptionZHCN: string): FormatDefinition {
    const type = FormatType.create(this.account.ns.namespace, UrnType.FORMAT, code, '0000');
    const descriptions = new Map<string, string>();
    descriptions.set(Spec.EN_US, descriptionENUS);
    descriptions.set(Spec.ZH_CN, descriptionZHCN);
    const def = new FormatDefinition(type, descriptions);
    def.lifecycle = LifeCycle.DEVELOPMENT;
    return def;
  }

  private loadDataFromServer(): void {
    this.loading = true;
    this.service.getFormatDefinitions(this.account.ns.namespace)
      .subscribe({
        next: data => {
          this.formatExist = new Set(data.map(x => x.type.name))
          this.loading = false;
        },
        error: error => {
          this.msg.warning(error);
        }
      })
  }

  protected onBack() {
    this.router.navigate(['/main/spec']).then(() => {});
  }

  protected select(def: FormatDefinition) {
    this.loading = true;
    this.service.createFormatDefinition(def)
      .subscribe({
        next: () => {
          console.log('createFormatDefinition ok');
          this.loading = false;
          this.router.navigate(['/main/spec']).then(() => {});
        },
        error: error => {
          this.msg.warning(error);
          this.loading = false;
        }
      });
  }
}
