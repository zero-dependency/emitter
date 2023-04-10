import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: 'emitter',
    environment: 'jsdom'
  }
})
