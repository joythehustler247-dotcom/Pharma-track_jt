import type { Request, Response, NextFunction } from 'express'
import { ForbiddenError, UnauthorizedError } from '../utils/errors.js'
import type { ActorRole } from '../types/actor.types.js'

export const requireRole = (...roles: ActorRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.actor) {
      return next(new UnauthorizedError('Authentication required'))
    }
    if (!roles.includes(req.actor.role as ActorRole)) {
      return next(
        new ForbiddenError(
          `Role '${req.actor.role}' is not allowed. Required: ${roles.join(' or ')}`
        )
      )
    }
    next()
  }
}
