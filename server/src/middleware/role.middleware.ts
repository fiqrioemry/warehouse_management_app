import { Request, Response, NextFunction } from "express";

const roleOnly = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const role = req.user?.role;

    if (!role) {
      res.status(401).json({ message: "Unauthorized: Role not found" });
      return;
    }

    if (allowedRoles.includes(role)) {
      next();
    } else {
      res.status(403).json({
        message: `Forbidden: Access denied. Only roles [${allowedRoles.join(
          ", "
        )}] are allowed`,
      });
    }
  };
};

export default roleOnly;
