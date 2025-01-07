"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const llamaindex_1 = require("llamaindex");
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const indexState_1 = require("../utils/indexState");
const pipeline_1 = require("../utils/pipeline");
// import { generateDatasource } from '../utils/generateDataSource';
const router = (0, express_1.Router)();
function createAndPersistIndex(documents) {
    return __awaiter(this, void 0, void 0, function* () {
        const storageContext = yield (0, llamaindex_1.storageContextFromDefaults)({
            persistDir: './storage',
        });
        const index = yield llamaindex_1.VectorStoreIndex.fromDocuments(documents, { storageContext });
        yield index.storageContext.docStore.persist();
        return index;
    });
}
// // Ensure data directory exists
// const dataDir = path.join(process.cwd(), 'data');
// if (!fs.existsSync(dataDir)) {
//   fs.mkdirSync(dataDir, { recursive: true });
// }
// Configure multer storage, save uploads to './data' directory
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'data/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
// Configure multer upload settings (PDF files only, up to 5 files, max 10MB each)
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    },
    limits: {
        files: 5,
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});
// Handle file upload
router.post('/upload', upload.array('files'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
            res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
            return;
        }
        const documents = yield new llamaindex_1.SimpleDirectoryReader().loadData({
            directoryPath: './data',
        });
        // Get current index or create new one
        let index = (0, indexState_1.getIndex)();
        if (!index) {
            index = yield createAndPersistIndex(documents);
            (0, indexState_1.setIndex)(index);
        }
        else {
            // Add new nodes to existing index using pipeline
            yield (0, pipeline_1.runPipeline)(index, documents);
        }
        const uploadedFiles = req.files;
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
    }
    catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing upload',
            error: error
        });
    }
}));
// Error handling middleware
router.use((error, req, res, next) => {
    // Handle client disconnection
    req.on('close', () => {
        if (req.file && req.file.path) {
            fs_1.default.unlink(req.file.path, () => {
                console.log('Upload cancelled, temp file removed');
            });
        }
    });
    // Handle Multer errors
    if (error instanceof multer_1.default.MulterError) {
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
exports.default = router;
