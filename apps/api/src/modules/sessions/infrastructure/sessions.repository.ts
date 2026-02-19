import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/db/prisma.service';
import { Device, Prisma } from '@src/generated/prisma/client';

@Injectable()
export class SessionsRepository {
  constructor(private prisma: PrismaService) {}

  async findAllByUser(userId: number): Promise<Device[] | null> {
    return this.prisma.device.findMany({
      where: { userId },
    });
  }
  async findByDeviceId(deviceId: string): Promise<Device | null> {
    return this.prisma.device.findUnique({
      where: { deviceId },
    });
  }
  async findByDeviceIdAndUserId(
    deviceId: string,
    userId: number,
  ): Promise<Device | null> {
    return this.prisma.device.findFirst({
      where: {
        deviceId,
        userId,
        deletedAt: null, // если хочешь учитывать только активные девайсы
      },
    });
  }

  async softDelete(deviceId: string): Promise<Device> {
    return this.prisma.device.update({
      where: { deviceId },
      data: { deletedAt: new Date() },
    });
  }

  async softDeleteAllExcept(
    userId: number,
    currentDeviceId: string,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.device.updateMany({
      where: {
        userId,
        deviceId: { not: currentDeviceId },
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    });
  }
}
