import { describe, it, expect } from 'vitest'
import { normalizeNumber, isValidMobileCM, isOrange, isMTN } from '../lib/phone'

describe('normalizeNumber', () => {
  it('strips non digits and country code', () => {
    expect(normalizeNumber('237 650 12 34 56')).toBe('650123456')
  })
})

describe('isValidMobileCM', () => {
  it('accepts valid numbers', () => {
    expect(isValidMobileCM('650123456')).toBe(true)
    expect(isValidMobileCM('237650123456')).toBe(true)
  })

  it('rejects invalid numbers', () => {
    expect(isValidMobileCM('65012345')).toBe(false)
    expect(isValidMobileCM('123456789')).toBe(false)
  })
})

describe('isOrange', () => {
  it('detects orange prefixes', () => {
    expect(isOrange('655123456')).toBe(true)
    expect(isOrange('640123456')).toBe(true)
  })

  it('rejects non-orange numbers', () => {
    expect(isOrange('650123456')).toBe(false)
  })
})

describe('isMTN', () => {
  it('detects mtn prefixes', () => {
    expect(isMTN('650123456')).toBe(true)
    expect(isMTN('670123456')).toBe(true)
  })

  it('rejects non-mtn numbers', () => {
    expect(isMTN('655123456')).toBe(false)
  })
})
