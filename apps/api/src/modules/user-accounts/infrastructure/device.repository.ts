import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/db/prisma.service';
import { Device, Prisma } from '@src/generated/prisma/client';

@Injectable()
export class DeviceRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.DeviceUncheckedCreateInput): Promise<Device> {
    return this.prisma.device.create({ data });
  }

  async findByDeviceId(deviceId: string): Promise<Device | null> {
    return this.prisma.device.findUnique({
      where: { deviceId },
    });
  }

  async updateLastActive(
    deviceId: string,
    lastActiveAt: Date,
  ): Promise<Device> {
    return this.prisma.device.update({
      where: { deviceId },
      data: { lastActiveAt },
    });
  }

  async softDelete(deviceId: string): Promise<Device> {
    return this.prisma.device.update({
      where: { deviceId },
      data: { deletedAt: new Date() },
    });
  }
}
