import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

describe('Project Setup', () => {
  it('should have TypeScript configured correctly', () => {
    const testValue: string = 'test'
    expect(testValue).toBe('test')
  })

  it('should have Vitest working', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have fast-check working for property-based testing', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        return n + 0 === n
      })
    )
  })

  it('should have Zod available', async () => {
    const { z } = await import('zod')
    const schema = z.string()
    expect(schema.parse('test')).toBe('test')
  })
})
