import { describe, expect } from 'vitest'

import { Emitter } from '../src/index.js'

const onceSymbol = Symbol('once')

type Events = {
  message: (msg: string) => void
  error: (msg: string) => void
  empty: () => void
  spread: (...args: string[]) => void
  [onceSymbol]: (key: string, value: number) => void
}

describe('Emitter', (test) => {
  const events = new Emitter<Events>()

  function nopeMessageListener(): void {}

  function messageListener(msg: string): void {
    expect(msg).toBe('hello world')
  }

  function errorListener(msg: string): void {
    expect(msg).toBe('some error')
  }

  function onceListener(key: string, value: number): void {
    expect(key).toBe('hello')
    expect(value).toBe(42)
  }

  function spreadListener(...args: string[]) {
    expect(args.length).toBe(3)
  }

  test('addListener', () => {
    events
      .on('message', nopeMessageListener)
      .on('message', messageListener)
      .on('error', errorListener)
      .on('spread', spreadListener)
      .once(onceSymbol, onceListener)
  })

  test('eventNames', () => {
    expect(events.eventNames()).toStrictEqual([
      'message',
      'error',
      'spread',
      onceSymbol
    ])
  })

  test('listenerCount', () => {
    expect(events.listenerCount('message')).toBe(2)
    expect(events.listenerCount('error')).toBe(1)
    expect(events.listenerCount('spread')).toBe(1)
    expect(events.listenerCount('empty')).toBe(0)
    expect(events.listenerCount(onceSymbol)).toBe(1)
  })

  test('listeners', () => {
    expect(events.listeners('message')).toStrictEqual([
      nopeMessageListener,
      messageListener
    ])
    expect(events.listeners('error')).toStrictEqual([errorListener])
    expect(events.listeners('empty')).toStrictEqual([])
    expect(events.listeners('spread')).toStrictEqual([spreadListener])
    expect(events.listeners(onceSymbol)).not.toStrictEqual([onceListener])
  })

  test('once', () => {
    expect(events.eventNames()).toContainEqual(onceSymbol)
    expect(events.emit(onceSymbol, 'hello', 42)).toBeTruthy()
    expect(events.emit(onceSymbol, 'hello', 42)).toBeFalsy()
    expect(events.listenerCount(onceSymbol)).toBe(0)

    const proxyOnceListener = events.once(onceSymbol, onceListener)
    expect(proxyOnceListener).toBeDefined()
    expect(events.listenerCount(onceSymbol)).toBe(1)
    events.off(onceSymbol, proxyOnceListener)
    expect(events.listenerCount(onceSymbol)).toBe(0)
  })

  test('emit', () => {
    expect(events.emit('message', 'hello world')).toBeTruthy()
    expect(events.emit('error', 'some error')).toBeTruthy()
    expect(events.emit('empty')).toBeFalsy()
  })

  test('removeListener', () => {
    events
      .on('error', messageListener)
      .off('error', errorListener)
      .on('error', errorListener)

    expect(events.listenerCount('error')).toBe(2)
  })

  test('removeAllListeners', () => {
    events.removeAllListeners('error')
    expect(events.listenerCount('error')).toBe(0)

    events.removeAllListeners()
    expect(events.listenerCount('message')).toBe(0)
    expect(events.listenerCount(onceSymbol)).toBe(0)
  })
})
