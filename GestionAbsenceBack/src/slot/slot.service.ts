import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
// MODIF 1: Alias pour le type 'slot'
import { Prisma, slot as SlotModel } from '@prisma/client';
// MODIF 2: Imports dans le bon ordre
import { CreateSlotBySessionDto } from './dto/create-slot.dto';
import { CreateSlotDto } from './dto/create-slot-by-session.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';

@Injectable()
export class SlotService {
  constructor(private prisma: PrismaService) {}

  async get(id: Prisma.slotWhereUniqueInput): Promise<SlotModel | null> {
    return this.prisma.slot.findUnique({
      where: id,
    });
  }

  async getAll(): Promise<SlotModel[]> {
    return this.prisma.slot.findMany();
  }

  async getAllByDate(date: string): Promise<SlotModel[]> {
    const startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setUTCHours(23, 59, 59, 999);

    return this.prisma.slot.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        slot_session_type: {
          select: {
            course_type_name: true,
            session_type_course_material: {
              select: { name: true },
            },
          },
        },
        slot_group: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  // ================== MODIFICATION DE CETTE FONCTION ==================
  async postBySessionName(data: CreateSlotBySessionDto) {
    const { groupId, courseName, sessionType, date } = data; // 'date' est un string

    if (typeof date !== 'string' || !date) {
      throw new Error(`La date fournie n'est pas valide ou est manquante.`);
    }

    let isoDate: Date; // Variable pour stocker notre date finale

    // VÉRIFIE SI LE FORMAT EST "DD/MM/YYYY"
    if (date.includes('/')) {
      const parts = date.split('/');
      if (parts.length !== 3) {
        throw new Error(
          `Format de date (DD/MM/YYYY) invalide reçu : ${date}.`,
        );
      }
      // CRÉE LA DATE (Mois 0-indexé)
      isoDate = new Date(
        parseInt(parts[2]), // Année
        parseInt(parts[1]) - 1, // Mois
        parseInt(parts[0]), // Jour
      );
    } 
    // SINON, ON SUPPOSE QUE C'EST UN FORMAT ISO (YYYY-MM-DD...T...Z)
    else {
      isoDate = new Date(date);
    }

    // VÉRIFICATION FINALE DE VALIDITÉ
    if (isNaN(isoDate.getTime())) {
      throw new Error(`Date invalide après conversion : ${date}`);
    }
    // ================== FIN DE LA MODIFICATION ==================

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
        date: isoDate, // Utilise la date convertie
        slot_group: {
          connect: { id: groupId },
        },
        slot_session_type: {
          connect: { id: tempSessionType.id },
        },
      },
    });
  }

  async post(data: CreateSlotDto): Promise<SlotModel> {
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

  async put(id: number, data: UpdateSlotDto): Promise<SlotModel> {
    const updateData = {
      ...(data.date && { date: new Date(data.date) }),
      ...(data.group_id && { slot_group: { connect: { id: data.group_id } } }),
      ...(data.session_type_id && { slot_session_type: { connect: { id: data.session_type_id } } }),
    };

    return this.prisma.slot.update({
      where: { id: id },
      data: updateData,
    });
  }

  async delete(id: Prisma.slotWhereUniqueInput): Promise<SlotModel> {
    return this.prisma.slot.delete({
      where: id,
    });
  }

  async deleteMany(): Promise<Prisma.BatchPayload> {
    return this.prisma.slot.deleteMany();
  }
}