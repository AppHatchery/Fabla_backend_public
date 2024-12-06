import express from "express";
import { config } from "dotenv";
import protocolRouter from "./routes/protocol.router.mjs";
import researcher_R_router from "./routes/researcher.r_router.mjs";
import serverless from "serverless-http";

config();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/fabla", protocolRouter);
app.use("/fabla/researcher", researcher_R_router);
//DEVELOPMENT...............
//moew routes.>>>>>
//mvrooo routes

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});

export const handler = serverless(app);
