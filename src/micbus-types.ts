import { UContainerBase } from './micbus-container';

export interface MicBusProps {
  readonly appName: string;
}

export interface UMsgType {
  readonly namespace: string[];
  readonly name: string;
}

export interface UMsg<T = unknown> {
  readonly id: string;
  readonly src: string;
  readonly dst: '*' | string;
  readonly type: UMsgType;
  readonly payload?: T;
}

export interface UMsgToSend<T = unknown> {
  readonly id?: string;
  readonly src?: string;
  readonly dst?: string;
  readonly type: UMsgType;
  readonly payload?: T;
}

export declare type UAction<T = unknown> = (a: UMsg<T>) => void;

export interface UContainer<T> {
  readonly msgTypeKey: string;
  readonly msgType: UMsgType;
  readonly actions: UAction[];
}

export interface MicBusOpts {
  containterFactory(msgType: UMsgType): UContainerBase;
}

export interface MicBusHandler {
  unregister(): Promise<void>;
}
