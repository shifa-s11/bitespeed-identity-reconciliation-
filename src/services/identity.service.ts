import { ContactRepository } from '../repositories/contact.repository';
import type { ContactRecord } from '../repositories/contact.repository';
import { logger } from '../utils/logger';

interface IdentifyResponse {
  contact: {
    primaryContactId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
  };
}

export class IdentityService {
  private readonly contactRepository: ContactRepository;

  constructor(contactRepository?: ContactRepository) {
    this.contactRepository = contactRepository ?? new ContactRepository();
  }

  async identifyContact(email?: string, phoneNumber?: string): Promise<IdentifyResponse> {
    logger.debug('Starting identity reconciliation', { email, phoneNumber });

    const matchedContacts = await this.contactRepository.findByEmailOrPhone(email, phoneNumber);

    if (matchedContacts.length === 0) {
      const createdPrimary = await this.contactRepository.createPrimaryContact(email, phoneNumber);
      const allLinkedContacts = await this.contactRepository.getAllLinkedContacts(createdPrimary.id);
      const response = this.buildResponse(createdPrimary.id, allLinkedContacts);

      logger.info('Identity reconciliation result', response);
      return response;
    }

    const identityContacts = await this.expandContactGraph(matchedContacts);

    if (identityContacts.length === 0) {
      const createdPrimary = await this.contactRepository.createPrimaryContact(email, phoneNumber);
      const allLinkedContacts = await this.contactRepository.getAllLinkedContacts(createdPrimary.id);
      const response = this.buildResponse(createdPrimary.id, allLinkedContacts);

      logger.info('Identity reconciliation result', response);
      return response;
    }

    const primaryContacts = identityContacts
      .filter((contact) => contact.linkPrecedence === 'primary')
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    const oldestPrimary = primaryContacts[0];
    const primaryId = oldestPrimary ? oldestPrimary.id : identityContacts[0]!.id;

    for (const primaryContact of primaryContacts.slice(1)) {
      await this.contactRepository.updateToSecondary(primaryContact.id, primaryId);
    }

    const updatedIdentityContacts = await this.contactRepository.getAllLinkedContacts(primaryId);

    const hasEmail = email ? updatedIdentityContacts.some((contact) => contact.email === email) : true;
    const hasPhoneNumber = phoneNumber
      ? updatedIdentityContacts.some((contact) => contact.phoneNumber === phoneNumber)
      : true;

    if (!hasEmail || !hasPhoneNumber) {
      await this.contactRepository.createSecondaryContact(email, phoneNumber, primaryId);
    }

    const allLinkedContacts = await this.contactRepository.getAllLinkedContacts(primaryId);
    const response = this.buildResponse(primaryId, allLinkedContacts);

    logger.info('Identity reconciliation result', response);
    return response;
  }

  private async expandContactGraph(initialContacts: ContactRecord[]): Promise<ContactRecord[]> {
    const contactsById = new Map<number, ContactRecord>();
    const primaryIdsToFetch = new Set<number>();

    for (const contact of initialContacts) {
      contactsById.set(contact.id, contact);

      if (contact.linkPrecedence === 'primary') {
        primaryIdsToFetch.add(contact.id);
      } else if (contact.linkedId) {
        primaryIdsToFetch.add(contact.linkedId);
      }
    }

    for (const primaryId of primaryIdsToFetch) {
      const linkedContacts = await this.contactRepository.getAllLinkedContacts(primaryId);

      for (const linkedContact of linkedContacts) {
        contactsById.set(linkedContact.id, linkedContact);
      }
    }

    return [...contactsById.values()];
  }

  private buildResponse(primaryId: number, contacts: ContactRecord[]): IdentifyResponse {
    const sortedContacts = [...contacts].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const primaryContact = sortedContacts.find((contact) => contact.id === primaryId);

    const emails: string[] = [];
    const phoneNumbers: string[] = [];
    const secondaryContactIds: number[] = [];

    if (primaryContact?.email) {
      emails.push(primaryContact.email);
    }

    if (primaryContact?.phoneNumber) {
      phoneNumbers.push(primaryContact.phoneNumber);
    }

    for (const contact of sortedContacts) {
      if (contact.id !== primaryId) {
        secondaryContactIds.push(contact.id);
      }

      if (contact.email && !emails.includes(contact.email)) {
        emails.push(contact.email);
      }

      if (contact.phoneNumber && !phoneNumbers.includes(contact.phoneNumber)) {
        phoneNumbers.push(contact.phoneNumber);
      }
    }

    return {
      contact: {
        primaryContactId: primaryId,
        emails,
        phoneNumbers,
        secondaryContactIds,
      },
    };
  }
}
