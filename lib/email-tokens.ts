import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-key-min-32-chars-long!'

/**
 * توليد token آمن للتحقق من المستخدم
 */
export function generateEmailToken(orderId: string, action: 'confirm' | 'edit' | 'cancel', email: string): string {
  const data = `${orderId}:${action}:${email}:${Date.now()}`
  const hash = crypto.createHmac('sha256', ENCRYPTION_KEY).update(data).digest('hex')
  return `${Buffer.from(data).toString('base64')}.${hash}`
}

/**
 * التحقق من صحة token
 */
export function verifyEmailToken(
  token: string,
  orderId: string,
  email: string
): { valid: boolean; action?: 'confirm' | 'edit' | 'cancel'; error?: string } {
  try {
    const [encodedData, hash] = token.split('.')

    if (!encodedData || !hash) {
      return { valid: false, error: 'Invalid token format' }
    }

    const data = Buffer.from(encodedData, 'base64').toString('utf-8')
    const [tokenOrderId, action, tokenEmail, timestamp] = data.split(':')

    // تحقق من صحة البيانات
    if (tokenOrderId !== orderId || tokenEmail !== email) {
      return { valid: false, error: 'Token data mismatch' }
    }

    // تحقق من انتهاء صلاحية التوكن (24 ساعة)
    const tokenAge = Date.now() - parseInt(timestamp)
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return { valid: false, error: 'Token expired' }
    }

    // تحقق من التوقيع
    const expectedHash = crypto
      .createHmac('sha256', ENCRYPTION_KEY)
      .update(data)
      .digest('hex')

    if (hash !== expectedHash) {
      return { valid: false, error: 'Invalid token signature' }
    }

    return { valid: true, action: action as 'confirm' | 'edit' | 'cancel' }
  } catch (error) {
    return { valid: false, error: 'Token verification failed' }
  }
}
