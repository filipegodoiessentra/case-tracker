import { Router } from 'express';
import { db } from '../store/db';
import { ApiError } from '../middleware/errorHandler';
import { upload } from '../config/upload';

export const casesRouter = Router();

// GET /api/cases?status=&type=&priority=&country=&owner=&q=
casesRouter.get('/', (req, res) => {
  const { status, type, priority, country, owner, q } = req.query;
  let results = db.listCases();
  if (status) results = results.filter((c) => c.status === status);
  if (type) results = results.filter((c) => c.type === type);
  if (priority) results = results.filter((c) => c.priority === priority);
  if (country) results = results.filter((c) => c.country === country);
  if (owner) results = results.filter((c) => c.ownerName === owner);
  if (q) {
    const query = String(q).toLowerCase();
    results = results.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.caseNumber.toLowerCase().includes(query) ||
        (c.customerName ?? '').toLowerCase().includes(query) ||
        c.tags.some((t) => t.toLowerCase().includes(query)),
    );
  }
  res.json(results);
});

casesRouter.get('/:id', (req, res) => {
  const found = db.getCase(req.params.id);
  if (!found) throw new ApiError(404, 'Caso não encontrado.');
  res.json(found);
});

casesRouter.post('/', (req, res) => {
  const created = db.createCase({ ...req.body, ownerId: req.user?.id, ownerName: req.user?.name });
  res.status(201).json(created);
});

casesRouter.put('/:id', (req, res) => {
  const updated = db.updateCase(req.params.id, req.body);
  if (!updated) throw new ApiError(404, 'Caso não encontrado.');
  res.json(updated);
});

casesRouter.delete('/:id', (req, res) => {
  const ok = db.deleteCase(req.params.id);
  if (!ok) throw new ApiError(404, 'Caso não encontrado.');
  res.status(204).send();
});

// ---- Timeline ----
casesRouter.get('/:id/timeline', (req, res) => {
  res.json(db.listTimeline(req.params.id));
});

casesRouter.post('/:id/timeline', (req, res) => {
  const created = db.addTimelineEntry({
    caseId: req.params.id,
    userId: req.user?.id,
    userName: req.user?.name,
    note: req.body.note,
    statusChange: req.body.statusChange ?? null,
  });
  res.status(201).json(created);
});

// ---- Attachments ----
casesRouter.get('/:id/attachments', (req, res) => {
  res.json(db.listAttachments(req.params.id));
});

casesRouter.post('/:id/attachments', upload.single('file'), (req, res) => {
  if (!req.file) throw new ApiError(400, 'Arquivo não enviado.');
  const created = db.addAttachment({
    caseId: req.params.id,
    fileName: req.file.originalname,
    fileType: req.file.mimetype,
    url: `/uploads/${req.file.filename}`,
    uploadedBy: req.user?.id,
  });
  res.status(201).json(created);
});

// ---- Email links ----
casesRouter.get('/:id/emails', (req, res) => {
  res.json(db.listEmailLinks(req.params.id));
});

casesRouter.post('/:id/emails', (req, res) => {
  const created = db.addEmailLink({ ...req.body, caseId: req.params.id });
  res.status(201).json(created);
});

// ---- Related cases ----
casesRouter.get('/:id/related', (req, res) => {
  res.json(db.listRelatedCases(req.params.id));
});

casesRouter.post('/:id/related', (req, res) => {
  const created = db.addCaseRelation({
    caseId: req.params.id,
    relatedCaseId: req.body.relatedCaseId,
    note: req.body.note ?? null,
  });
  res.status(201).json(created);
});

// ---- Lesson learned ----
casesRouter.get('/:id/lesson-learned', (req, res) => {
  res.json(db.getLessonLearned(req.params.id));
});

casesRouter.put('/:id/lesson-learned', (req, res) => {
  const saved = db.upsertLessonLearned(req.params.id, req.body);
  res.json(saved);
});
