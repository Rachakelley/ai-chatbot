import { Router, Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { Document, IngestionPipeline, PDFReader, SentenceSplitter, Settings, SimpleDirectoryReader, StorageContext, storageContextFromDefaults, VectorStoreIndex } from 'llamaindex';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getIndex, setIndex, setIsInitialized } from '../utils/indexState';
import { getDataSource } from '../utils/getDataSource';
import { runPipeline } from '../utils/pipeline';
// import { generateDatasource } from '../utils/generateDataSource';

const router = Router();

async function createAndPersistIndex(documents: Document[]) {
  const storageContext = await storageContextFromDefaults({
    persistDir: './storage',
  });

  const index = await VectorStoreIndex.fromDocuments(documents, { storageContext });
  await index.storageContext.docStore.persist();
  return index;
}


// // Ensure data directory exists
// const dataDir = path.join(process.cwd(), 'data');
// if (!fs.existsSync(dataDir)) {
//   fs.mkdirSync(dataDir, { recursive: true });
// }

// Configure multer storage, save uploads to './data' directory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'data/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

// Configure multer upload settings (PDF files only, up to 5 files, max 10MB each)
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  limits: {
    files: 5,
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Handle file upload
router.post('/upload', upload.array('files'), async (req: Request, res: Response) => {
  try {
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
      return;
    }

    const documents = await new SimpleDirectoryReader().loadData({
      directoryPath: './data',
    });

    // Get current index or create new one
    let index = getIndex();
    if (!index) {
      index = await createAndPersistIndex(documents);
      setIndex(index);
    } else {
      // Add new nodes to existing index using pipeline
      await runPipeline(index, documents);
    }

    const uploadedFiles = req.files as Express.Multer.File[];
    res.status(200).json({
      success: true,
      message: `Successfully processed ${uploadedFiles.length} file(s)`,
      files: uploadedFiles.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      }))
    });

  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing upload',
      error: error
    });
  }
});

// Error handling middleware
router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  // Handle client disconnection
  req.on('close', () => {
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {
        console.log('Upload cancelled, temp file removed');
      });
    }
  });

  // Handle Multer errors
  if (error instanceof multer.MulterError) {
    console.error('Multer error:', error);
    res.status(400).json({
      success: false,
      message: 'File upload error',
      error: error.message
    });
    return;
  }

  // Handle cancelled uploads
  if (error.name === 'ECONNABORTED' || error.code === 'ECONNRESET') {
    console.warn('Upload cancelled by client');
    res.status(499).json({
      success: false,
      message: 'Upload cancelled by client'
    });
    return;
  }

  // Handle other errors
  console.error('Internal server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

export default router;