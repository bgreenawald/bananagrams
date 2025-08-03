import { ref } from 'vue'

interface ValidationResult {
  valid: boolean
  error?: string
}

interface ValidationRule {
  test: (value: any) => boolean
  message: string
}

export function useValidation() {
  const errors = ref<Record<string, string>>({})

  // Common validation rules
  const rules = {
    required: (message = 'This field is required'): ValidationRule => ({
      test: (value: any) => value !== null && value !== undefined && String(value).trim() !== '',
      message
    }),

    minLength: (min: number, message?: string): ValidationRule => ({
      test: (value: any) => String(value).length >= min,
      message: message || `Must be at least ${min} characters`
    }),

    maxLength: (max: number, message?: string): ValidationRule => ({
      test: (value: any) => String(value).length <= max,
      message: message || `Must be no more than ${max} characters`
    }),

    pattern: (regex: RegExp, message: string): ValidationRule => ({
      test: (value: any) => regex.test(String(value)),
      message
    }),

    gameId: (): ValidationRule => ({
      test: (value: any) => /^\d{4}$/.test(String(value)),
      message: 'Game ID must be exactly 4 digits'
    }),

    playerName: (): ValidationRule => ({
      test: (value: any) => {
        const name = String(value).trim()
        return name.length >= 2 && 
               name.length <= 20 && 
               /^[a-zA-Z0-9_-]+$/.test(name)
      },
      message: 'Player name must be 2-20 characters, letters, numbers, _ and - only'
    }),

    noHtml: (): ValidationRule => ({
      test: (value: any) => {
        const str = String(value)
        return !/<[^>]*>/g.test(str)
      },
      message: 'HTML tags are not allowed'
    })
  }

  function validate(value: any, validationRules: ValidationRule[]): ValidationResult {
    for (const rule of validationRules) {
      if (!rule.test(value)) {
        return { valid: false, error: rule.message }
      }
    }
    return { valid: true }
  }

  function validateField(fieldName: string, value: any, validationRules: ValidationRule[]): boolean {
    const result = validate(value, validationRules)
    
    if (result.valid) {
      delete errors.value[fieldName]
    } else {
      errors.value[fieldName] = result.error!
    }
    
    return result.valid
  }

  function validateGameId(value: string): ValidationResult {
    return validate(value, [
      rules.required('Game ID is required'),
      rules.gameId(),
      rules.noHtml()
    ])
  }

  function validatePlayerName(value: string): ValidationResult {
    return validate(value, [
      rules.required('Player name is required'),
      rules.playerName(),
      rules.noHtml()
    ])
  }

  function sanitizeInput(value: string): string {
    return value
      .trim()
      .replace(/[<>&'"]/g, (match) => {
        // HTML escape dangerous characters
        const escapeMap: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '&': '&amp;',
          "'": '&#39;',
          '"': '&quot;'
        }
        return escapeMap[match] || match
      })
      .replace(/\s+/g, ' ') // Normalize whitespace
  }

  function hasErrors(): boolean {
    return Object.keys(errors.value).length > 0
  }

  function clearErrors() {
    errors.value = {}
  }

  function getError(fieldName: string): string | undefined {
    return errors.value[fieldName]
  }

  return {
    errors,
    rules,
    validate,
    validateField,
    validateGameId,
    validatePlayerName,
    sanitizeInput,
    hasErrors,
    clearErrors,
    getError
  }
}