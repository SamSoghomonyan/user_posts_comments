import { app } from './app';
import { AppDataSource } from './data-source';

AppDataSource.initialize()
  .then(() => {
      app.listen(6000, () => {
          console.log("Server is running on port 5000");
      });
  })
  .catch((error) => console.error(error));
