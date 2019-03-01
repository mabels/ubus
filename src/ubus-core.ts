import { UMsg, UMsgType, UAction, UContainer } from './ubus-types';
import { UMsgTypeSync, UMsgTypeEq } from './ubus-msg-type';
import { Ubus } from './ubus';
import { UContainerBase } from './ubus-container';

export namespace UbusCore {
  export interface Send<T> {
    msg: UMsg<T>;
  }
  export const Opts = {
    containterFactory: (msg: UMsgType) => new UContainerBase(msg)
  };

  export declare type SendMsg<T = unknown> = UMsg<Send<T>>;
  export const SendType = UMsgTypeSync('ubus.send');
  export async function sendSend<T>(
    ubus: Ubus,
    msg: UMsg<T>
  ): Promise<SendMsg<T>> {
    if (!UMsgTypeEq(msg.type, SendType)) {
      return ubus.send<Send<T>>(
        {
          type: SendType,
          payload: {
            msg
          }
        },
        Opts
      );
    }
  }
  export interface Register<T> {
    readonly container: UContainer<T>;
    readonly fn: UAction<T>;
  }
  export declare type RegisterMsg<T = unknown> = UMsg<Register<T>>;
  export const RegisterType = UMsgTypeSync('ubus.register');

  export async function registerSend<T>(
    ubus: Ubus,
    container: UContainerBase<T>,
    fn: UAction<T>
  ): Promise<RegisterMsg<T>> {
    if (!UMsgTypeEq(container.msgType, RegisterType)) {
      return ubus.send(
        {
          type: RegisterType,
          payload: {
            // do not pass a reference
            // pass a constances
            container: container.clone(),
            fn
          }
        },
        Opts
      );
    }
  }

  export const UnRegisterType = UMsgTypeSync('ubus.unregister');

  export async function unregisterSend<T>(
    ubus: Ubus,
    container: UContainerBase<T>,
    fn: UAction<T>
  ): Promise<RegisterMsg<T>> {
    if (!UMsgTypeEq(container.msgType, UnRegisterType)) {
      return ubus.send(
        {
          type: UnRegisterType,
          payload: {
            // do not pass a reference
            // pass a constances
            container: container.clone(),
            fn
          }
        },
        Opts
      );
    }
  }
  export function start(ubus: Ubus): void {
    ubus.register(UbusCore.SendType, undefined, Opts);
    ubus.register(UbusCore.RegisterType, undefined, Opts);
    ubus.register(UbusCore.UnRegisterType, undefined, Opts);
  }
}
