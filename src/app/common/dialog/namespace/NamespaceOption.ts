import {NamespaceDefinition} from '@openxiot/xiot-core-spec-ts';

export class NamespaceOption {
  constructor(
    public current: string,
    public namespaces: NamespaceDefinition[] = [],
  ) {
  }
}
