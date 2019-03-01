import { UMsgType } from './micbus-types';

export function UMsgTypeEq(n1: UMsgType, n2: UMsgType): boolean {
  let ret = n1.name === n2.name && n1.namespace.length === n2.namespace.length;
  for (let i = 0; ret && i < n1.namespace.length; ++i) {
    ret = n1.namespace[i] === n2.namespace[i];
  }
  return ret;
}

/* never export this! it is intented for internal us only */
export function UMsgTypeSync(s: string): UMsgType {
  let namespace = s.split(/\.+/);
  let name = '';
  if (namespace.length > 0 && namespace[0] === '') {
    namespace = namespace.slice(1);
  }
  if (namespace.length > 0) {
    if (namespace[namespace.length - 1] === '') {
      namespace = namespace.slice(0, -1);
    } else {
      name = namespace.splice(namespace.length - 1)[0];
    }
  }
  return { namespace, name };
}

export async function UMsgTypeCreate(s: string): Promise<UMsgType> {
  return UMsgTypeSync(s);
}

export function UMsgTyp2String(type: UMsgType): string {
  return [...type.namespace, type.name].join('.');
}
