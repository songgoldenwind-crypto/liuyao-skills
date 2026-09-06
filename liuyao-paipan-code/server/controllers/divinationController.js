import { InputValidationError, normalizeCivilTime, normalizeDayBoundary } from '../../src/utils/inputValidation.js'
import { getDivinationContext } from '../utils/divinationCalendar.js'

export async function getContext(req, res) {
  try {
    const body = req.body || {}
    const time = normalizeCivilTime(body.time)
    const dayBoundary = normalizeDayBoundary(body.dayBoundary)

    const context = await getDivinationContext(time, dayBoundary)
    res.json({
      success: true,
      context
    })
  } catch (error) {
    if (error instanceof InputValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
    console.error('divination context error:', error)
    res.status(500).json({
      success: false,
      message: '起卦时间信息计算失败'
    })
  }
}
