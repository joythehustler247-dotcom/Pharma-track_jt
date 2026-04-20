import type { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

export const validateBody = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const formatted = result.error as ZodError
      const errors: Record<string, string[]> = {}
      formatted.errors.forEach((err) => {
        const key = err.path.join('.') || 'root'
        if (!errors[key]) errors[key] = []
        errors[key]!.push(err.message)
      })
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      })
      return
    }
    req.validatedBody = result.data
    next()
  }
}

export const validateParams = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params)
    if (!result.success) {
      res.status(400).json({
        success: false,
        message: 'Invalid parameters',
      })
      return
    }
    next()
  }
}
