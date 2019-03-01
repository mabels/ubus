import { MicBusHandler, UAction } from './micbus-types';
import { MicBus } from './micbus';
import { MicBusCore } from './micbus-core';
import { UContainerBase } from './micbus-container';

export class MicBusHandleCallback implements MicBusHandler {
  public container: UContainerBase;
  public cb: UAction;
  public micbus: MicBus;

  constructor(micbus: MicBus, container: UContainerBase, cb: UAction) {
    this.container = container;
    this.cb = cb;
    this.micbus = micbus;
  }

  public async unregister(): Promise<void> {
    if (this.container.removeAction(this.cb)) {
      MicBusCore.unregisterSend(this.micbus, this.container, this.cb);
      // help the gc
      this.micbus = undefined;
      this.container = undefined;
      this.cb = undefined;
    }
  }
}
