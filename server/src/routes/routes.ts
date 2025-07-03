import { Application } from "express";
import userRoutes from "./user.route";

const initRoutes = (app: Application): void => {
  app.use("/api/v1/users", userRoutes);
};

export default initRoutes;
