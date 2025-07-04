import { app } from './app';
import { AppDataSource } from './data-source';
import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT;
AppDataSource.initialize()
  .then(() => {
      app.listen(PORT, () => {
          console.log("Server is running on port 5000");
      });
  })
  .catch((error) => console.error(error));
