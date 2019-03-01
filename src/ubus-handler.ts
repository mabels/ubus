import { UbusHandler, UAction } from './ubus-types';
import { Ubus } from './ubus';
import { UbusCore } from './ubus-core';
import { UContainerBase } from './ubus-container';

export class UbusHandleCallback implements UbusHandler {
  public container: UContainerBase;
  public cb: UAction;
  public ubus: Ubus;

  constructor(ubus: Ubus, container: UContainerBase, cb: UAction) {
    this.container = container;
    this.cb = cb;
    this.ubus = ubus;
  }

  public async unregister(): Promise<void> {
    if (this.container.removeAction(this.cb)) {
      UbusCore.unregisterSend(this.ubus, this.container, this.cb);
      // help the gc
      this.ubus = undefined;
      this.container = undefined;
      this.cb = undefined;
    }
  }
}
