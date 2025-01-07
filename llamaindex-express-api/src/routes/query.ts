import { NextFunction, Request, Response, Router } from 'express';
import path from 'path';
import fs from 'fs';
import { ChatMessage, ContextChatEngine, PDFReader, SimpleDirectoryReader, storageContextFromDefaults, VectorStoreIndex } from 'llamaindex';
import { getIndex } from '../utils/indexState';
import { getDataSource } from '../utils/getDataSource';

const router = Router();
// Initialize chat history
let chatHistory: ChatMessage[] = [];

// Define POST endpoint at /api/query
router.post('/query', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let index = getIndex();
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
      let chatEngine = new ContextChatEngine({
        retriever: index.asRetriever(),
        chatHistory, // Pass chat history to the chat engine
      });

      try {
        let response = await chatEngine.chat({
          message: query,
          stream: true,
        });

        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        });

        function delay(ms: number) {
          return new Promise(resolve => setTimeout(resolve, ms));
        }

        let buffer = '';
        for await (const data of response) {
          for (const char of data.message.content) {
            buffer += char;
            res.write(char);
            await delay(15);
          }
        }

        res.end();
      } catch (streamError) {
        console.error('Error streaming response:', streamError);
        res.status(500).json({ error: 'Error streaming response' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error querying the index' });
    }
  } catch (error) {
    next(error);
  }
});

export default router;