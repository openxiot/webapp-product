import {computed, signal} from '@angular/core';
import type {Signal, WritableSignal} from '@angular/core';

export class StringValue {

  public readonly newValue: WritableSignal<string>;
  public readonly changed: Signal<boolean>;

  constructor(
    public readonly oldValue: string,
  ) {
    this.newValue = signal(oldValue);
    this.changed = computed(() => oldValue !== this.newValue());
  }
}
