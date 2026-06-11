
export function ProtocolToArray(protocol: string): string[] {
  switch (protocol) {
    case 'wifi':
      return ['Directly', 'wifi'];

    case 'wifi+ble':
      return ['Directly', 'wifi+ble'];

    case 'ethernet':
      return ['Directly', 'ethernet'];

    case 'ethernet+ble':
      return ['Directly', 'ethernet+ble'];

    case 'btmesh':
      return ['Non-Directly', 'btmesh'];

    case 'zigbee':
      return ['Non-Directly', 'zigbee'];

    case 'knx':
      return ['Non-Directly', 'knx'];

    case '485':
      return ['Non-Directly', '485'];

    case 'can':
      return ['Non-Directly', 'can'];

    case 'lora':
      return ['Non-Directly', 'lora'];

    default:
      return ['', ''];
  }
}


export function ProtocolFromArray(values: string[]): string {
  if (values.length === 2) {
    return values[1];
  }

  return '';
}
