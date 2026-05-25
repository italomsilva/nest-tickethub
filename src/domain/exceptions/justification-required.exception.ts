export class JustificationRequiredException extends Error {
  constructor() {
    super('A text justification is required when marking a ticket as INCONSISTENT.');
    this.name = 'JustificationRequiredException';
  }
}
