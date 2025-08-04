import { describe, it, expect } from 'vitest'
import { useValidation } from '../useValidation'

describe('useValidation', () => {
  it('should validate game ID correctly', () => {
    const { validateGameId } = useValidation()

    expect(validateGameId('1234').valid).toBe(true)
    expect(validateGameId('123').valid).toBe(false)
    expect(validateGameId('12345').valid).toBe(false)
    expect(validateGameId('abcd').valid).toBe(false)
  })

  it('should validate player name correctly', () => {
    const { validatePlayerName } = useValidation()

    expect(validatePlayerName('Alice').valid).toBe(true)
    expect(validatePlayerName('Bob123').valid).toBe(true)
    expect(validatePlayerName('test_user').valid).toBe(true)
    expect(validatePlayerName('a').valid).toBe(false)
    expect(validatePlayerName('').valid).toBe(false)
    expect(validatePlayerName('very_long_username_that_exceeds_limit').valid).toBe(false)
  })

  it('should sanitize input correctly', () => {
    const { sanitizeInput } = useValidation()

    expect(sanitizeInput('  test  ')).toBe('test')
    expect(sanitizeInput('hello<script>world')).toBe('hello&lt;script&gt;world')
    expect(sanitizeInput('multiple   spaces')).toBe('multiple spaces')
  })
})
