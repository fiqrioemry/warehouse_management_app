import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { ResponseError } from "../middleware/error.middleware";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/uploader";

const prisma = new PrismaClient();

interface CreateWarehouseRequest {
  name: string;
  location: string;
  capacity: number;
  image: Express.Multer.File;
}

class WarehouseService {
  async getAllWarehouses() {
    return await prisma.warehouse.findMany();
  }

  async createWarehouse(request: CreateWarehouseRequest) {
    const warehouse = await prisma.warehouse.create({
      data,
    });

    return warehouse;
  }

  async updateWarehouse(id: string, data: any) {
    const warehouse = await prisma.warehouse.findUnique({ where: { id } });
    if (!warehouse) {
      throw new ResponseError(404, "Warehouse not found");
    }

    return await prisma.warehouse.update({
      where: { id },
      data,
    });
  }

  async deleteWarehouse(id: string) {
    const warehouse = await prisma.warehouse.findUnique({ where: { id } });
    if (!warehouse) {
      throw new ResponseError(404, "Warehouse not found");
    }

    await prisma.warehouse.delete({ where: { id } });
  }
}

export default new WarehouseService();
