if (process.env.NODE_ENV !== "production") {
  import("dotenv").then((dotenv) => {
    dotenv.config();
  });
}

import { app } from "./app";
import { createHTTPServer } from "./config/http";
import { createSocketIOServer } from "./config/io";
import { getImprovementCategories } from "./db/improvement";

const server = createHTTPServer(app);

const io = createSocketIOServer(server);

getImprovementCategories("q0e55BShZ0M5fiU5buahOWYlsSg1");

server.listen(process.env.PORT || 8080, () => {
  console.log(`Listening on port ${process.env.PORT || 8080}`);
});
