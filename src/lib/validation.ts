// Input validation + sanitization. Mirrors the security audit in the report:
// - reject script-tag injection (XSS)
// - enforce schema-level type checks before submission
// - catch empty / invalid fields with inline-friendly errors

export type FieldErrors = Partial<Record<string, string>>

export type SubscriptionInput = {
  customer_name: string
  email: string
  plan: string
  mrr: string
  contract_duration_months: string
  status: string
  start_date: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Detect anything that looks like an HTML/script injection attempt.
function looksLikeXss(value: string): boolean {
  const lower = value.toLowerCase()
  return (
    lower.includes('<script') ||
    lower.includes('</script') ||
    lower.includes('javascript:') ||
    lower.includes('onerror=') ||
    lower.includes('onload=')
  )
}

export function validateSubscription(input: SubscriptionInput): {
  errors: FieldErrors
  clean: boolean
} {
  const errors: FieldErrors = {}

  if (!input.customer_name || !input.customer_name.trim()) {
    errors.customer_name = 'Customer name is required'
  } else if (looksLikeXss(input.customer_name)) {
    errors.customer_name = 'Invalid characters in customer name'
  }

  if (!input.email || !input.email.trim()) {
    errors.email = 'Email is required'
  } else if (!EMAIL_RE.test(input.email.trim())) {
    errors.email = 'Enter a valid email address'
  } else if (looksLikeXss(input.email)) {
    errors.email = 'Invalid characters in email'
  }

  if (!input.plan) {
    errors.plan = 'Plan is required'
  }

  const mrrNum = Number(input.mrr)
  if (!input.mrr || input.mrr.trim() === '') {
    errors.mrr = 'MRR is required'
  } else if (Number.isNaN(mrrNum) || mrrNum < 0) {
    errors.mrr = 'MRR must be a positive number'
  }

  const durNum = Number(input.contract_duration_months)
  if (
    input.contract_duration_months !== '' &&
    input.contract_duration_months !== undefined &&
    (Number.isNaN(durNum) || durNum < 0)
  ) {
    errors.contract_duration_months = 'Duration must be 0 or a positive number'
  }

  if (!input.start_date) {
    errors.start_date = 'Start date is required'
  }

  return { errors, clean: Object.keys(errors).length === 0 }
}

export function sanitizeText(value: string): string {
  return value.replace(/[<>]/g, '').trim()
}
