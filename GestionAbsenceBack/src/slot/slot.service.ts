import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, slot } from '@prisma/client';
import { CreateSlotDto } from './dto/create-slot-by-session.dto';
import { CreateSlotBySessionDto } from './dto/create-slot.dto';

@Injectable()
export class SlotService {
  constructor(private prisma: PrismaService) {}

  async get(id: Prisma.slotWhereUniqueInput): Promise<slot | null> {
    return this.prisma.slot.findUnique({
      where: id,
    });
  }

  async getAll(): Promise<slot[]> {
    return this.prisma.slot.findMany();
  }

  async getAllByDate(date: string): Promise<slot[]> {
    const startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0); // Début de la journée UTC

    const endDate = new Date(date);
    endDate.setUTCHours(23, 59, 59, 999); // Fin de la journée UTC

    return this.prisma.slot.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        slot_session_type: {
          // On inclut le type de session
          select: {
            course_type_name: true, // On prend son nom (TD, TP...)
            session_type_course_material: {
              // On remonte à la matière
              select: {
                name: true, // On prend le nom de la matière
              },
            },
          },
        },
      },
    });
  }

  async postBySessionName(data: CreateSlotBySessionDto) {
    const { groupId, courseName, sessionType, date } = data;
    const tempSessionType = await this.prisma.session_type.findFirst({
      where: {
        course_type_name: sessionType,
        session_type_course_material: {
          name: courseName,
        },
      },
      include: { session_type_course_material: true },
    });
    if (!tempSessionType) {
      throw new Error('Type de session avec ce nom de matière introuvable');
    }
    return this.prisma.slot.create({
      data: {
        date: new Date(`${date}T08:00:00`),
        slot_group: {
          connect: { id: groupId },
        },
        slot_session_type: {
          connect: { id: tempSessionType.id },
        },
      },
    });
  }

  /*async post(data: Prisma.slotCreateInput): Promise<slot> {
    return this.prisma.slot.create({
      data,
    });
  }*/

  async post(data: CreateSlotDto): Promise<slot> {
  // CETTE LIGNE MANQUAIT :
  const { date, group_id, session_type_id } = data;

  return this.prisma.slot.create({
    data: {
      date: new Date(date),
      slot_group: {
        connect: { id: group_id },
      },
      slot_session_type: {
        connect: { id: session_type_id },
      },
    },
  });
}

    

  async put(id: number, data: Prisma.slotUpdateInput): Promise<slot | null> {
    return this.prisma.slot.update({
      where: { id },
      data: data,
    });
  }

  async delete(id: Prisma.slotWhereUniqueInput): Promise<slot> {
    return this.prisma.slot.delete({
      where: id,
    });
  }

  async deleteMany() {
    return this.prisma.slot.deleteMany();
  }
}
