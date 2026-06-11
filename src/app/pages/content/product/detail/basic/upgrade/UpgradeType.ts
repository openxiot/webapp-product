export class UpgradeType {
  direct: boolean = false;
  gateway: boolean = false;
  ble: boolean = false;

  public static of(values: string[]): UpgradeType {
    let z = new UpgradeType();

    for (let value of values) {
      switch (value.toLowerCase()) {
        case 'direct':
          z.direct = true;
          break;

        case 'gateway':
          z.gateway = true;
          break;

        case 'ble':
          z.ble = true;
          break;
      }
    }

    return z;
  }

  public toArray(): string[] {
    const result: string[] = [];

    for (const [key, value] of Object.entries(this)) {
      if (typeof value === 'boolean' && value) {
        result.push(key);
      }
    }

    return result;
  }

  public equals(other: UpgradeType): boolean {
    return this.direct === other.direct &&
      this.gateway === other.gateway &&
      this.ble === other.ble;
  }
}
