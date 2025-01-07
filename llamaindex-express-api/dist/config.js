"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AZURE_OPENAI_DEPLOYMENT_NAME = exports.AZURE_OPENAI_ENDPOINT = exports.AZURE_OPENAI_API_KEY = exports.PORT = void 0;
require("dotenv/config");
exports.PORT = process.env.PORT || 3000;
exports.AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
exports.AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
exports.AZURE_OPENAI_DEPLOYMENT_NAME = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
