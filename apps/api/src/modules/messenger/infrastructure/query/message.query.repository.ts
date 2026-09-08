import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/db/prisma.service';
import { Message } from '@src/generated/prisma/client';
import { MessageStatus } from '@src/generated/prisma/enums';
import { ChatQueryResult } from '../types/chat-query-result';

@Injectable()
export class MessageQueryRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findById(id: number) {
    return this.prisma.message.findUnique({
      where: { id },
    });
  }

  async findDialogueMessages( userId: number, dialoguePartnerId: number, pageSize: number, cursor: number ): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: {
        OR: [
          {
            ownerId: userId,
            receiverId: dialoguePartnerId,
          },
          {
            ownerId: dialoguePartnerId,
            receiverId: userId,
          },
        ],

        ...(cursor > 0 && { id: { lt: cursor }}),
      },

      orderBy: { id: 'desc' },
      take: pageSize,
    });
  }

  async countDialogueMessages( userId: number, dialoguePartnerId: number ): Promise<number> {
    return this.prisma.message.count({
      where: {
        OR: [
          {
            ownerId: userId,
            receiverId: dialoguePartnerId,
          },
          {
            ownerId: dialoguePartnerId,
            receiverId: userId,
          },
        ],
      },
    });
  }

  async countUnreadMessagesFromPartner( userId: number, dialoguePartnerId: number ): Promise<number> {
    return this.prisma.message.count({
      where: {
        ownerId: dialoguePartnerId,
        receiverId: userId,
        status: { not: MessageStatus.READ },
      },
    });
  }

  async userExists( userId: number ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
    return !!user;
  }

  /**
   * Получить список чатов. Для каждого собеседника возвращается только последнее сообщение.
   */
  async findChats( userId: number, pageSize: number, cursor: number, searchName?: string, ): Promise<ChatQueryResult[]> {
    const search = searchName?.trim() ?? '';

    return this.prisma.$queryRaw<ChatQueryResult[]>`
      WITH user_messages AS (
        SELECT
          m.*,

          CASE
            WHEN m."ownerId" = ${userId}
              THEN m."receiverId"
            ELSE m."ownerId"
          END AS "partnerId"

        FROM "messages" m

        WHERE
          m."ownerId" = ${userId}
          OR m."receiverId" = ${userId}
      ),

      last_messages AS (
        SELECT DISTINCT ON ("partnerId")
          *
        FROM user_messages

        ORDER BY
          "partnerId",
          id DESC
      )

      SELECT
        lm.id,
        lm."ownerId",
        lm."receiverId",
        lm."messageText",
        lm.status,
        lm."messageType",
        lm."createdAt",
        lm."updatedAt",

        u.username AS "userName",

        a.key AS "avatarUrl",

        (
          SELECT COUNT(*)::int
          FROM "messages" unread
          WHERE
            unread."ownerId" = lm."partnerId"
            AND unread."receiverId" = ${userId}
            AND unread.status != 'READ'
        ) AS "notReadCount"

      FROM last_messages lm

      INNER JOIN "users" u
        ON u.id = lm."partnerId"

      LEFT JOIN "profiles" p
        ON p."userId" = u.id

      LEFT JOIN "avatars" a
        ON a."profileId" = p.id
        AND a."deletedAt" IS NULL

      WHERE
        (
          ${cursor} = 0
          OR lm.id < ${cursor}
        )

        AND (
          ${search} = ''
          OR u.username ILIKE ${`%${search}%`}
        )

      ORDER BY lm.id DESC

      LIMIT ${pageSize};
    `;
  }

  /**
   * Количество диалогов пользователя.
   */
  async countChats( userId: number, searchName?: string, ): Promise<number> {
    const search = searchName?.trim() ?? '';

    const result = await this.prisma.$queryRaw<
      Array<{ count: bigint }>
    >`
      SELECT COUNT(*)::bigint AS count
      FROM (
        SELECT DISTINCT
          CASE
            WHEN m."ownerId" = ${userId}
              THEN m."receiverId"
            ELSE m."ownerId"
          END AS "partnerId"

        FROM "messages" m

        INNER JOIN "users" u
          ON u.id = CASE
            WHEN m."ownerId" = ${userId}
              THEN m."receiverId"
            ELSE m."ownerId"
          END

        WHERE
          (
            m."ownerId" = ${userId}
            OR m."receiverId" = ${userId}
          )

          AND (
            ${search} = ''
            OR u.username ILIKE ${`%${search}%`}
          )
      ) chats;
    `;

    return Number(result[0]?.count ?? 0);
  }

  /**
   * Общее количество непрочитанных сообщений от других пользователей.
   */
  async countUnreadMessages(userId: number): Promise<number> {
    return this.prisma.message.count({
      where: {
        receiverId: userId,
        ownerId: { not: userId },
        status: { not: MessageStatus.READ },
      },
    });
  }
}
