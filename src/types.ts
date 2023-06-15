// https://github.com/andywer/typed-emitter/blob/master/index.d.ts

export type EventMap = {
  [key: string]: (...args: any[]) => void
}

export interface TypedEventEmitter<Events extends EventMap> {
  on<E extends keyof Events>(event: E, listener: Events[E]): this
  once<E extends keyof Events>(event: E, listener: Events[E]): Events[E]
  off<E extends keyof Events>(event: E, listener: Events[E]): this
  removeAllListeners<E extends keyof Events>(event?: E): this
  emit<E extends keyof Events>(
    event: E,
    ...args: Parameters<Events[E]>
  ): boolean
  eventNames(): (keyof Events | string | symbol)[]
  listeners<E extends keyof Events>(event: E): Events[E][]
  listenerCount<E extends keyof Events>(event: E): number
}
