import * as uuid from 'uuid';
import { UbusCore } from './ubus-core';
import { UMsgType, UMsg, UAction, UBusOpts, UbusProps, UMsgToSend, UbusHandler } from './ubus-types';
import { UMsgTyp2String } from './ubus-msg-type';
import { UContainerBase, UContainerStore } from './ubus-container';
import { UbusHandleCallback } from './ubus-handler';

const UBoxOptsDefault: UBusOpts = {
  containterFactory: (msgType: UMsgType): UContainerBase => {
    return new UContainerStore(msgType);
  }
};

export class Ubus {
  public readonly appName: string;

  public readonly type2Container: Map<string, UContainerBase> = new Map();

  public static create(appName = 'ubus'): Ubus {
    const ubus = new Ubus({ appName });
    UbusCore.start(ubus);
    return ubus;
  }

  private constructor(props: UbusProps) {
    this.appName = props.appName;
  }

  private upSetUContainer(type: UMsgType, opts: UBusOpts): UContainerBase {
    const msgType = UMsgTyp2String(type);
    let ucontainer = this.type2Container.get(msgType);
    if (!ucontainer) {
      ucontainer = opts.containterFactory(type);
      this.type2Container.set(ucontainer.msgTypeKey, ucontainer);
    }
    return ucontainer;
  }

  public async send<T>(msg: UMsgToSend<T> | UMsg<T>, opts = UBoxOptsDefault): Promise<UMsg<T>> {
    const toSend = {
      id: msg.id || uuid.v4(),
      src: msg.src || UMsgTyp2String(msg.type),
      dst: msg.dst || '*',
      payload: msg.payload,
      type: { ...msg.type }
    };
    // console.log('send', toSend);
    const ucontainer = this.upSetUContainer(toSend.type, opts);
    if (ucontainer.setMsg(toSend)) {
      UbusCore.sendSend(this, toSend);
    }
    return toSend;
  }

  public async register<T>(
    msg: UMsgType,
    cb?: UAction<T>,
    opts = UBoxOptsDefault
  ): Promise<UbusHandler> {
    const ucontainer = this.upSetUContainer(msg, opts);
    if (cb) {
      ucontainer.upSetAction(cb);
      if (await UbusCore.registerSend(this, ucontainer, cb)) {
        ucontainer.triggerAction(cb);
      }
      return new UbusHandleCallback(this, ucontainer, cb);
    }
    return {
      unregister: () => Promise.resolve()
    };
  }
}
