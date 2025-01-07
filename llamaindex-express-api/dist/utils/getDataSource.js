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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataSource = getDataSource;
const llamaindex_1 = require("llamaindex");
const indexState_1 = require("./indexState");
function getDataSource() {
    return __awaiter(this, void 0, void 0, function* () {
        const persistDir = './storage';
        const storageContext = yield (0, llamaindex_1.storageContextFromDefaults)({
            persistDir,
        });
        const numberOfDocs = Object.keys(storageContext.docStore.toDict()).length;
        if (numberOfDocs === 0) {
            return null;
        }
        const index = yield llamaindex_1.VectorStoreIndex.init({
            storageContext,
        });
        (0, indexState_1.setIndex)(index);
        return index;
    });
}
