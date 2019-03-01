import { UMsg, UMsgType, UAction, UContainer } from './micbus-types';
import { UMsgTypeSync, UMsgTypeEq } from './micbus-msg-type';
import { MicBus } from './micbus';
import { UContainerBase } from './micbus-container';

export namespace MicBusCore {
  export interface Send<T> {
    msg: UMsg<T>;
  }
  export const Opts = {
    containterFactory: (msg: UMsgType) => new UContainerBase(msg)
  };

  export declare type SendMsg<T = unknown> = UMsg<Send<T>>;
  export const SendType = UMsgTypeSync('micbus.send');
  export async function sendSend<T>(
    micbus: MicBus,
    msg: UMsg<T>
  ): Promise<SendMsg<T>> {
    if (!UMsgTypeEq(msg.type, SendType)) {
      return micbus.send<Send<T>>(
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
  export const RegisterType = UMsgTypeSync('micbus.register');

  export async function registerSend<T>(
    micbus: MicBus,
    container: UContainerBase<T>,
    fn: UAction<T>
  ): Promise<RegisterMsg<T>> {
    if (!UMsgTypeEq(container.msgType, RegisterType)) {
      return micbus.send(
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

  export const UnRegisterType = UMsgTypeSync('micbus.unregister');

  export async function unregisterSend<T>(
    micbus: MicBus,
    container: UContainerBase<T>,
    fn: UAction<T>
  ): Promise<RegisterMsg<T>> {
    if (!UMsgTypeEq(container.msgType, UnRegisterType)) {
      return micbus.send(
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
  export function start(micbus: MicBus): void {
    micbus.register(MicBusCore.SendType, undefined, Opts);
    micbus.register(MicBusCore.RegisterType, undefined, Opts);
    micbus.register(MicBusCore.UnRegisterType, undefined, Opts);
  }
}
