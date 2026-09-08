import express, { type Request, type Response } from 'express';
import { scrapeUsRegionals } from '../tasks/scrapeUsRegionals.ts';

const router = express.Router();

router.get('/scrape-us-regionals', async (req: Request, res: Response) => {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  await scrapeUsRegionals();
  res.status(200).json({ ok: true });
});

export default router;
