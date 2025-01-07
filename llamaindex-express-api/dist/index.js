"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors")); // Import the cors package
const config_1 = require("./config");
const query_1 = __importDefault(require("./routes/query"));
const upload_1 = __importDefault(require("./routes/upload"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)()); // Enable CORS
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Define routes
app.use('/api', query_1.default);
app.use('/api', upload_1.default);
// Start the server
app.listen(config_1.PORT, () => {
    console.log(`Server is running on http://localhost:${config_1.PORT}`);
});
