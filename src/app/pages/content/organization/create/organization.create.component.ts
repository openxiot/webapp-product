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
import {FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzMessageService} from 'ng-zorro-antd/message';
import {MainService} from '../../../../service/main.service';
import {AccountService} from '../../../../service/account.service';
import {SpecCodeComponent} from '../../../../common/form/item/common/code/spec.code.component';
import {Location} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'organization-create',
  standalone: true,
  templateUrl: './organization.create.component.html',
  styleUrl: './organization.create.component.less',
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
    SpecCodeComponent,
    TranslatePipe,
  ],
})
export class OrganizationCreateComponent implements OnInit {

  loading: boolean = false;

  form: FormGroup<{
    code: FormControl<string>,
    name: FormControl<string>,
  }>;

  constructor(
    protected location: Location,
    private router: Router,
    private account: AccountService,
    private route: ActivatedRoute,
    private fb: NonNullableFormBuilder,
    private msg: NzMessageService,
    private service: MainService,
  ) {
    this.form = this.fb.group({
      code: this.fb.control('', [
        Validators.required,
        Validators.pattern(/^[a-z][a-z0-9-]*$/)
      ]),
      name: this.fb.control('', [Validators.required]),
    });
  }

  ngOnInit() {
  }



  protected submitForm() {
    const code = this.form.value.code || 'null';
    const name = this.form.value.name || 'null';

    this.loading = true;
    this.service.createOrganization(code, name)
      .subscribe({
        next: () => {
          console.log('createOrganization ok');
          this.loading = false;
          this.account.loadOrganizations();
          this.router.navigate(['/main']).then(() => {});
        },
        error: error => {
          this.msg.warning(error);
          this.loading = false;
        }
      });
  }
}
