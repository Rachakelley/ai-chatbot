import express from 'express';
import cors from 'cors'; // Import the cors package
import { PORT } from './config';
import queryRouter from './routes/query';
import uploadRouter from './routes/upload';

const app = express();

app.use(cors()); // Enable CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define routes
app.use('/api', queryRouter);
app.use('/api', uploadRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});