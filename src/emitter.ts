import type { EventMap, TypedEventEmitter } from './types.js'

export class Emitter<T extends EventMap> implements TypedEventEmitter<T> {
  #events: Record<string | number | symbol, Function[]> = {}

  /**
   * Add an event listener
   * @param event The event name
   * @param listener The listener function
   * @returns The emitter
   */
  on<E extends keyof T>(event: E, listener: T[E]): this {
    const listeners = this.#events[event] ?? []
    this.#events[event] = listeners
    listeners.push(listener)

    return this
  }

  /**
   * Alias for `addListener`
   */
  addListener<E extends keyof T>(event: E, listener: T[E]): this {
    return this.on(event, listener)
  }

  /**
   * Add an event listener that will be called only once
   * @note The listener is wrapped in a wrapper function, so it cannot be equal to the original listener
   * @param event The event name
   * @param listener The listener function
   * @returns The emitter
   */
  once<E extends keyof T>(event: E, listener: T[E]): this {
    const onceListener = (...args: any[]) => {
      this.off(event, onceListener as T[E])
      listener(...args)
    }

    this.on(event, onceListener as T[E])

    return this
  }

  /**
   * Emit an event
   * @param event The event name
   * @param args The arguments to pass to the listeners
   * @returns `true` if the event had listeners, `false` otherwise
   */
  emit<E extends keyof T>(event: E, ...args: Parameters<T[E]>): boolean {
    const listeners = this.#events[event] ?? []
    for (let i = 0; i < listeners.length; i++) {
      listeners[i]!(...args)
    }

    return Boolean(listeners.length)
  }

  /**
   * Remove an event listener
   * @param event The event name
   * @param listener The listener function
   * @returns The emitter
   */
  off<E extends keyof T>(event: E, listener: T[E]): this {
    if (this.#events[event]) {
      this.#events[event] = this.#events[event].filter((v) => v !== listener)
    }

    return this
  }

  /**
   * Alias for `off`
   */
  removeListener<E extends keyof T>(event: E, listener: T[E]): this {
    return this.off(event, listener)
  }

  /**
   * Remove all event listeners
   * @param event The event name
   * @returns The emitter
   */
  removeAllListeners<E extends keyof T>(event?: E): this {
    if (event) {
      delete this.#events[event]
    } else {
      this.#events = {}
    }

    return this
  }

  /**
   * Get the list of event names
   * @returns An array of event names
   */
  eventNames(): (string | symbol)[] {
    return Reflect.ownKeys(this.#events)
  }

  /**
   * Get the list of listeners for an event
   * @param event The event name
   * @returns An array of listeners
   */
  listeners<E extends keyof T>(event: E): T[E][] {
    return (this.#events[event] as T[E][]) ?? []
  }

  /**
   * Get the number of listeners for an event
   * @param event The event name
   * @returns The number of listeners for the event
   */
  listenerCount<E extends keyof T>(event: E): number {
    return this.#events[event]?.length ?? 0
  }
}
