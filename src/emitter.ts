import type { EventMap, TypedEventEmitter } from './types.js'

/**
 * Cross-platform, lightweight type-safe event emitter.
 *
 * @example
 * type Events = {
 *   error: (error: Error) => void
 *   message: (from: string, content: string) => void
 * }
 *
 * const emitter = new Emitter<Events>()
 * emitter.emit('error', 'x')  // will catch this type error
 */
export class Emitter<Events extends EventMap>
  implements TypedEventEmitter<Events>
{
  #events: Record<string | number | symbol, Function[]> = {}

  /**
   * Adds a listener for the specified event.
   *
   * @param {Event} event
   * The event name.
   *
   * @param {Events[Event]} listener
   * The listener function.
   *
   * @return {this}
   * Returns this instance for chaining.
   */
  on<Event extends keyof Events>(event: Event, listener: Events[Event]): this {
    const listeners = this.listeners(event)
    listeners.push(listener)
    this.#events[event] = listeners

    return this
  }

  /**
   * Returns a proxy function that when called, invokes the original listener function
   * and removes the listener from the event emitter.
   *
   * @param {Event} event
   * The event to listen to.
   *
   * @param {Events[Event]} listener
   * The listener function to be called once.
   *
   * @return {Events[Event]}
   * The original listener function.
   */
  once<Event extends keyof Events>(
    event: Event,
    listener: Events[Event]
  ): Events[Event] {
    const proxy = new Proxy(listener, {
      apply: (target, _, args) => {
        target(...args)
        this.off(event, proxy)
      }
    })

    this.on(event, proxy)

    return proxy
  }

  /**
   * Emits an event with a given name and passes any number of arguments to the
   * listeners. Returns a boolean indicating whether the event had listeners
   * attached.
   *
   * @param {Event} event
   * The name of the event to be emitted.
   *
   * @param {...Parameters<Events[Event]>} args
   * Any number of arguments to be passed to the listeners.
   *
   * @return {boolean}
   * A boolean indicating whether the event had listeners attached.
   */
  emit<Event extends keyof Events>(
    event: Event,
    ...args: Parameters<Events[Event]>
  ): boolean {
    const listeners = this.listeners(event)
    for (let i = 0; i < listeners.length; i++) {
      listeners[i]!(...args)
    }

    return Boolean(listeners.length)
  }

  /**
   * Removes a listener from the specified event.
   *
   * @param {Event} event
   * the event to remove the listener from.
   *
   * @param {Events[Event]} listener
   * the listener to remove from the event.
   *
   * @return {this}
   * The class instance for chaining.
   */
  off<Event extends keyof Events>(event: Event, listener: Events[Event]): this {
    if (this.#events[event]) {
      this.#events[event] = this.#events[event].filter((v) => v !== listener)
    }

    return this
  }

  /**
   * Removes all listeners for the specified event or all events if none specified.
   *
   * @param {Event} [event] - The event to remove listeners for.
   * @return {this} Returns the instance for chaining.
   */
  removeAllListeners<Event extends keyof Events>(event?: Event): this {
    if (event) {
      delete this.#events[event]
    } else {
      this.#events = {}
    }

    return this
  }

  /**
   * Returns an array of all the event names that have listeners.
   *
   * @return {(keyof Events | string | symbol)[]}
   * An array of event names.
   */
  eventNames(): (keyof Events | string | symbol)[] {
    return Reflect.ownKeys(this.#events)
  }

  /**
   * Returns an array of listeners for the specified event.
   *
   * @param {Event} event
   * The event name to retrieve listeners for.
   *
   * @return {Events[Event][]}
   * An array of listeners for the specified event.
   */
  listeners<Event extends keyof Events>(event: Event): Events[Event][] {
    return (this.#events[event] as Events[Event][]) ?? []
  }

  /**
   * Returns the number of listeners for the given event.
   *
   * @param {Event} event
   * The event name.
   *
   * @return {number}
   * The number of listeners for the given event.
   */
  listenerCount<Event extends keyof Events>(event: Event): number {
    return this.#events[event]?.length ?? 0
  }
}
