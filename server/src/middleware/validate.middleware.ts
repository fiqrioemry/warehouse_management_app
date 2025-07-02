import { Schema } from "joi";
import { Request, Response, NextFunction } from "express";

const validate =
  (schema: Schema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }
    next();
  };

export default validate;
