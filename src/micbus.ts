import * as uuid from 'uuid';
import { MicBusCore } from './micbus-core';
import { UMsgType, UMsg, UAction, MicBusOpts, MicBusProps, UMsgToSend, MicBusHandler } from './micbus-types';
import { UMsgTyp2String } from './micbus-msg-type';
import { UContainerBase, UContainerStore } from './micbus-container';
import { MicBusHandleCallback } from './micbus-handler';

const UBoxOptsDefault: MicBusOpts = {
  containterFactory: (msgType: UMsgType): UContainerBase => {
    return new UContainerStore(msgType);
  }
};

export class MicBus {
  public readonly appName: string;

  public readonly type2Container: Map<string, UContainerBase> = new Map();

  public static create(appName = 'micbus'): MicBus {
    const micbus = new MicBus({ appName });
    MicBusCore.start(micbus);
    return micbus;
  }

  private constructor(props: MicBusProps) {
    this.appName = props.appName;
  }

  private upSetUContainer(type: UMsgType, opts: MicBusOpts): UContainerBase {
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
      MicBusCore.sendSend(this, toSend);
    }
    return toSend;
  }

  public async register<T>(
    msg: UMsgType,
    cb?: UAction<T>,
    opts = UBoxOptsDefault
  ): Promise<MicBusHandler> {
    const ucontainer = this.upSetUContainer(msg, opts);
    if (cb) {
      ucontainer.upSetAction(cb);
      if (await MicBusCore.registerSend(this, ucontainer, cb)) {
        ucontainer.triggerAction(cb);
      }
      return new MicBusHandleCallback(this, ucontainer, cb);
    }
    return {
      unregister: () => Promise.resolve()
    };
  }
}
