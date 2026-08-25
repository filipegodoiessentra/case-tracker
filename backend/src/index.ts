import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { config } from './config';
import { uploadsDirAbsolute } from './config/upload';
import { authMiddleware } from './middleware/auth';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { aiRouter } from './routes/ai';
import { casesRouter } from './routes/cases';
import { dashboardRouter } from './routes/dashboard';
import { knowledgeRouter } from './routes/knowledge';
import { processesRouter } from './routes/processes';
import { reportsRouter } from './routes/reports';
import { searchRouter } from './routes/search';
import { tagsRouter } from './routes/tags';

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(uploadsDirAbsolute));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', dataSource: config.dataSource, authMode: config.authMode });
});

app.use(authMiddleware);

app.use('/api/cases', casesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/knowledge', knowledgeRouter);
app.use('/api/processes', processesRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/search', searchRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/ai', aiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Essentra Case Tracker API rodando em http://localhost:${config.port}`);
  console.log(`  DATA_SOURCE=${config.dataSource}  AUTH_MODE=${config.authMode}`);
});
