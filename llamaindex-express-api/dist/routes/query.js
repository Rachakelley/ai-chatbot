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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const llamaindex_1 = require("llamaindex");
const indexState_1 = require("../utils/indexState");
const router = (0, express_1.Router)();
// Initialize chat history
let chatHistory = [];
// Define POST endpoint at /api/query
router.post('/query', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    let index = (0, indexState_1.getIndex)();
    if (!index) {
        throw new Error('Index not initialized');
    }
    try {
        if (!req.body.query) {
            res.status(400).json({ error: 'Query parameter is required' });
            return;
        }
        const { query } = req.body;
        // Save each message to chat history
        chatHistory.push({
            role: 'user',
            content: query,
        });
        try {
            let chatEngine = new llamaindex_1.ContextChatEngine({
                retriever: index.asRetriever(),
                chatHistory, // Pass chat history to the chat engine
            });
            try {
                let response = yield chatEngine.chat({
                    message: query,
                    stream: true,
                });
                res.writeHead(200, {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                });
                function delay(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }
                let buffer = '';
                try {
                    for (var _d = true, response_1 = __asyncValues(response), response_1_1; response_1_1 = yield response_1.next(), _a = response_1_1.done, !_a; _d = true) {
                        _c = response_1_1.value;
                        _d = false;
                        const data = _c;
                        for (const char of data.message.content) {
                            buffer += char;
                            res.write(char);
                            yield delay(15);
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_d && !_a && (_b = response_1.return)) yield _b.call(response_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                res.end();
            }
            catch (streamError) {
                console.error('Error streaming response:', streamError);
                res.status(500).json({ error: 'Error streaming response' });
            }
        }
        catch (error) {
            res.status(500).json({ error: 'Error querying the index' });
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
