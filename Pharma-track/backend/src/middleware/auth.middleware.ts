import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { db } from '../db/index.js'
import { actors } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { config } from '../utils/config.js'
import { UnauthorizedError } from '../utils/errors.js'
import type { JwtPayload } from '../types/actor.types.js'

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided')
    }

    const token = authHeader.split(' ')[1]
    if (!token) throw new UnauthorizedError('No token provided')

    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload

    const actor = await db.query.actors.findFirst({
      where: eq(actors.id, decoded.actorId),
    })

    if (!actor) throw new UnauthorizedError('Actor not found')

    req.actor = actor
    next()
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'))
    } else if (err instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'))
    } else {
      next(err)
    }
  }
}
