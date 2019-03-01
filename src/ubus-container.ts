import { UContainer, UMsgType, UAction, UMsg } from './ubus-types';
import { UMsgTyp2String } from './ubus-msg-type';

export class UContainerBase<T = unknown> implements UContainer<T> {
  public readonly msgTypeKey: string;
  public readonly msgType: UMsgType;
  public readonly actions: UAction[] = [];

  public constructor(msgType: UMsgType) {
    this.msgType = msgType;
    this.msgTypeKey = UMsgTyp2String(msgType);
  }

  public clone(): UContainer<T> {
    return {
      msgTypeKey: this.msgTypeKey,
      msgType: this.msgType,
      actions: [...this.actions]
    };
  }

  public upSetAction(action: UAction): void {
    if (!this.actions.find(a => a === action)) {
      // console.log('upSetAction:', action);
      this.actions.push(action);
    }
  }

  public getActions(): UAction[] {
    // copy to prevent modification
    return [...this.actions];
  }

  public removeAction(action: UAction): boolean {
    const idx = this.actions.indexOf(action);
    if (idx >= 0) {
      let deletedAction: UAction<T>;
      if (idx == 0) {
        deletedAction = this.actions.splice(0, 1)[0];
      } else {
        deletedAction = this.actions.splice(idx, idx)[0];
      }
      // console.log('removeAction:', deletedAction);
      return true;
    }
    return false;
  }

  public triggerAction(cb: UAction): void {
    /* do nothing */
  }

  public triggerActions(msg: UMsg): void {
    // tslint:disable-next-line:no-unused-expression
    this.actions.length &&
      setImmediate(() => {
        this.actions.forEach(a => a(msg));
      });
  }

  public setMsg(msg: UMsg<T>): boolean {
    this.triggerActions(msg);
    return true;
  }
}

export class UContainerStore<T = unknown> extends UContainerBase<T> {
  public msg?: UMsg<T>;

  public triggerAction(cb: UAction): void {
    const msg = this.msg;
    // tslint:disable-next-line:no-unused-expression
    msg && setImmediate(() => msg && cb(msg));
  }

  public setMsg(msg: UMsg<T>): boolean {
    if (this.msg !== msg) {
      this.msg = msg;
      this.triggerActions(msg);
      return true;
    }
    return false;
  }
}
