import { Router } from 'express';
import queryRoutes from './query';
import uploadRoutes from './upload';

const router = Router();

router.use('/query', queryRoutes);
router.use('/upload', uploadRoutes);

export default router;

// to run the server, run the following command:
// npx tsc
// node dist/index.js