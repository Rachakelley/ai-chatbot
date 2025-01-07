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
exports.generateDatasource = generateDatasource;
const llamaindex_1 = require("llamaindex");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const indexState_1 = require("./indexState");
// Ensure data directory exists
const dataDir = path_1.default.join(process.cwd(), 'data');
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
function generateDatasource() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`Generating storage context...`);
            // Split documents, create embeddings and store them in the storage context
            const persistDir = '/storage';
            const storageContext = yield (0, llamaindex_1.storageContextFromDefaults)({
                persistDir,
            });
            // Load uploaded documents using SimpleDirectoryReader
            const documents = yield new llamaindex_1.SimpleDirectoryReader().loadData({
                directoryPath: dataDir,
            });
            const index = yield llamaindex_1.VectorStoreIndex.fromDocuments(documents, {
                storageContext,
            });
            (0, indexState_1.setIndex)(index);
            console.log(`Storage context successfully generated.`);
            return true;
        }
        catch (error) {
            console.error('Generation failed:', error);
            return false;
        }
    });
}
;
