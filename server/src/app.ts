import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import { AppDataSource } from './db/data-source.ts';
import events from './routes/events.ts';
import tasks from './routes/tasks.ts';

const app: Express = express();

// Vercel Functions invoke the exported `app` directly as a request handler and
// never call `.listen()`, so DB init can't gate on that. Instead, lazily
// initialize on first use and memoize the promise so concurrent requests on a
// cold start all await the same connection rather than racing to init twice.
let dataSourceReady: Promise<typeof AppDataSource> | null = null;
function ensureDataSourceInitialized() {
  if (!dataSourceReady) {
    dataSourceReady = AppDataSource.initialize();
  }
  return dataSourceReady;
}

app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureDataSourceInitialized();
    next();
  } catch (error) {
    next(error);
  }
});

app.use('/events', events);
app.use('/tasks', tasks);

app.get('/', async (req: Request, res: Response) => {
  try {
    res.send(`Hello World! This has been updated`);
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect to the database.' });
  }
});

app.listen(8080, () => {
  console.log('server listening on port 8080');
});

export default app;
