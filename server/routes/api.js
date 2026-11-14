import { Router } from 'express';
import { ApiError, createSwapiService } from '../services/swapi.js';
import { logger } from '../lib/logger.js';

export function createApiRouter(service = createSwapiService({ baseUrl: process.env.SWAPI_BASE_URL || 'https://swapi.dev/api/' })) {
  const router = Router();
  const handle = action => async (req, res, next) => {
    try {
      if (req.params.id && !/^[1-9]\d*$/.test(req.params.id)) throw new ApiError(400, 'Invalid resource ID');
      res.json(await action(req.params.id));
    } catch (error) { next(error); }
  };
  router.get('/films', handle(() => service.getFilms()));
  router.get('/films/:id', handle(id => service.getFilm(id)));
  router.get('/characters/:id', handle(id => service.getCharacter(id)));
  router.use((_req, res) => res.status(404).json({ message: 'API endpoint not found' }));
  router.use((error, _req, res, _next) => {
    logger('BFF request failed', { message: error.message });
    res.status(error instanceof ApiError ? error.status : 502).json({ message: error instanceof ApiError ? error.message : 'Unable to load Star Wars data' });
  });
  return router;
}

export default createApiRouter();
