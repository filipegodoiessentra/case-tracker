import { Router } from 'express';
import { db } from '../store/db';

export const tagsRouter = Router();

tagsRouter.get('/', (_req, res) => {
  res.json(db.listTags());
});
