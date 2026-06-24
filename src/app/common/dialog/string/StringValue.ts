export class StringValue {

  public newValue: string;

  constructor(
    public oldValue: string,
  ) {
    this.newValue = oldValue;
  }

  public changed(): boolean {
    return this.oldValue !== this.newValue;
  }
}
