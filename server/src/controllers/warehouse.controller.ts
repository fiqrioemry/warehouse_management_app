import { Request, Response, NextFunction } from "express";
import warehouseService from "../services/warehouse.service";

async function getAllWarehouses(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const warehouses = await warehouseService.getAllWarehouses();
    res
      .status(200)
      .json({ message: "Warehouses retrieved successfully", data: warehouses });
  } catch (error) {
    next(error);
  }
}

async function createWarehouse(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const warehouse = await warehouseService.createWarehouse(req.body);
    res
      .status(200)
      .json({ message: "Warehouse created successfully", data: warehouse });
  } catch (error) {
    next(error);
  }
}
async function updateWarehouse(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const updatedWarehouse = await warehouseService.updateWarehouse(
      id,
      req.body
    );
    res.status(200).json({
      message: "Warehouse updated successfully",
      data: updatedWarehouse,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteWarehouse(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    await warehouseService.deleteWarehouse(id);
    res.status(200).json({ message: "Warehouse deleted successfully" });
  } catch (error) {
    next(error);
  }
}
export default {
  getAllWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
};
