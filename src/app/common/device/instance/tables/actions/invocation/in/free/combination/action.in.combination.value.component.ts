import {Component, EventEmitter, forwardRef, Input, Output} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Argument, Property, Service} from '@openxiot/xiot-core-spec-ts';
import {NzSwitchModule} from 'ng-zorro-antd/switch';
import {NzDescriptionsModule} from 'ng-zorro-antd/descriptions';
import {ActionInValueComponent} from '../../action.in.value.component';

@Component({
  selector: 'action-in-combination-value',
  templateUrl: './action.in.combination.value.component.html',
  styleUrls: ['./action.in.combination.value.component.less'],
  imports: [
    NzSwitchModule,
    ReactiveFormsModule,
    FormsModule,
    NzDescriptionsModule,
    forwardRef(() => ActionInValueComponent),
  ],
  standalone: true,
  providers: []
})
export class ActionInCombinationValueComponent {

  value: Map<number, any> = new Map();

  @Input() property: Property | undefined;

  @Input() argument: Argument | undefined;

  @Input() service: Service | undefined;

  @Output() valueChange = new EventEmitter<any>();

  getMemberName(iid: number): string {
    return this.service?.properties.get(iid)?.description.get('zh-CN') || '';
  }

  onValueChanged(iid: number, value: any): void {
    this.value.set(iid, value);
    this.valueChange.emit(this.value);
  }

  getMemberArgument(iid: number): Argument {
    return Argument.of(iid, 1, 1);
  }
}
