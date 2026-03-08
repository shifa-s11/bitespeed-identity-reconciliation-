import { prisma } from '../utils/prisma';

export type ContactRecord = NonNullable<Awaited<ReturnType<typeof prisma.contact.findFirst>>>;

export class ContactRepository {
  async findByEmailOrPhone(
    email?: string,
    phoneNumber?: string,
  ): Promise<ContactRecord[]> {
    const orConditions: Array<{ email?: string; phoneNumber?: string }> = [];

    if (email) {
      orConditions.push({ email });
    }

    if (phoneNumber) {
      orConditions.push({ phoneNumber });
    }

    if (orConditions.length === 0) {
      return [];
    }

    return prisma.contact.findMany({
      where: {
        deletedAt: null,
        OR: orConditions,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findByLinkedId(linkedId: number): Promise<ContactRecord[]> {
    return prisma.contact.findMany({
      where: {
        linkedId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async createPrimaryContact(email?: string, phoneNumber?: string): Promise<ContactRecord> {
    return prisma.contact.create({
      data: {
        email: email ?? null,
        phoneNumber: phoneNumber ?? null,
        linkedId: null,
        linkPrecedence: 'primary',
      },
    });
  }

  async createSecondaryContact(
    email: string | undefined,
    phoneNumber: string | undefined,
    linkedId: number,
  ): Promise<ContactRecord> {
    return prisma.contact.create({
      data: {
        email: email ?? null,
        phoneNumber: phoneNumber ?? null,
        linkedId,
        linkPrecedence: 'secondary',
      },
    });
  }

  async updateToSecondary(contactId: number, primaryId: number): Promise<ContactRecord> {
    return prisma.contact.update({
      where: {
        id: contactId,
      },
      data: {
        linkedId: primaryId,
        linkPrecedence: 'secondary',
      },
    });
  }

  async getAllLinkedContacts(primaryId: number): Promise<ContactRecord[]> {
    return prisma.contact.findMany({
      where: {
        deletedAt: null,
        OR: [{ id: primaryId }, { linkedId: primaryId }],
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
