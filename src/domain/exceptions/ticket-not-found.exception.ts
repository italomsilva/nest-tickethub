export class TicketNotFoundException extends Error {
  constructor(id: string) {
    super(`Ticket with ID ${id} not found.`);
    this.name = 'TicketNotFoundException';
  }
}
