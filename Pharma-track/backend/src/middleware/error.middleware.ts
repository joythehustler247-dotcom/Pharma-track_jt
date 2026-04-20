import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/errors.js'
import { config } from '../utils/config.js'

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
    return
  }

  if ((err as NodeJS.ErrnoException).code === '23505') {
    res.status(409).json({
      success: false,
      message: 'Record already exists',
    })
    return
  }

  console.error('[ERROR]', err)

  res.status(500).json({
    success: false,
    message: config.isDev ? err.message : 'Internal server error',
  })
}

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  })
}
