// Form validation utilities

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom'
  value?: string | number | RegExp
  message: string
  validator?: (value: string) => boolean
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export class FormValidator {
  private rules: Record<string, ValidationRule[]> = {}

  addRule(field: string, rule: ValidationRule) {
    if (!this.rules[field]) {
      this.rules[field] = []
    }
    this.rules[field].push(rule)
    return this
  }

  validate(data: Record<string, string>): ValidationResult {
    const errors: Record<string, string> = {}

    Object.keys(this.rules).forEach(field => {
      const value = data[field] || ''
      const fieldRules = this.rules[field]

      for (const rule of fieldRules) {
        let isValid = true

        switch (rule.type) {
          case 'required':
            isValid = value.trim().length > 0
            break
          case 'email':
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
            break
          case 'minLength':
            isValid = value.length >= (rule.value as number)
            break
          case 'maxLength':
            isValid = value.length <= (rule.value as number)
            break
          case 'pattern':
            isValid = (rule.value as RegExp).test(value)
            break
          case 'custom':
            isValid = rule.validator ? rule.validator(value) : true
            break
        }

        if (!isValid) {
          errors[field] = rule.message
          break
        }
      }
    })

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
}

// Common validation rules
export const commonRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    type: 'required',
    message
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    type: 'email',
    message
  }),

  minLength: (length: number, message?: string): ValidationRule => ({
    type: 'minLength',
    value: length,
    message: message || `Must be at least ${length} characters`
  }),

  maxLength: (length: number, message?: string): ValidationRule => ({
    type: 'maxLength',
    value: length,
    message: message || `Must be no more than ${length} characters`
  }),

  pattern: (regex: RegExp, message: string): ValidationRule => ({
    type: 'pattern',
    value: regex,
    message
  }),

  custom: (validator: (value: string) => boolean, message: string): ValidationRule => ({
    type: 'custom',
    validator,
    message
  }),

  phone: (message = 'Please enter a valid phone number'): ValidationRule => ({
    type: 'pattern',
    value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
    message
  }),

  url: (message = 'Please enter a valid URL'): ValidationRule => ({
    type: 'pattern',
    value: /^https?:\/\/.+/,
    message
  })
}

// React hook for form validation
import { useState } from 'react'

export function useFormValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = (field: string, value: string, rules: ValidationRule[]): string | null => {
    for (const rule of rules) {
      let isValid = true

      switch (rule.type) {
        case 'required':
          isValid = value.trim().length > 0
          break
        case 'email':
          isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          break
        case 'minLength':
          isValid = value.length >= (rule.value as number)
          break
        case 'maxLength':
          isValid = value.length <= (rule.value as number)
          break
        case 'pattern':
          isValid = (rule.value as RegExp).test(value)
          break
        case 'custom':
          isValid = rule.validator ? rule.validator(value) : true
          break
      }

      if (!isValid) {
        return rule.message
      }
    }
    return null
  }

  const validate = (field: string, value: string, rules: ValidationRule[]) => {
    const error = validateField(field, value, rules)
    setErrors(prev => ({
      ...prev,
      [field]: error || ''
    }))
    return !error
  }

  const validateAll = (data: Record<string, string>, validationRules: Record<string, ValidationRule[]>): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, data[field] || '', validationRules[field])
      if (error) {
        newErrors[field] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const touch = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const reset = () => {
    setErrors({})
    setTouched({})
  }

  return {
    errors,
    touched,
    validate,
    validateAll,
    touch,
    reset,
    hasError: (field: string) => touched[field] && !!errors[field],
    getError: (field: string) => touched[field] ? errors[field] : ''
  }
}
