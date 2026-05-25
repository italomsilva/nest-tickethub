export class SolutionRequiredException extends Error {
  constructor() {
    super('A solution is required when resolving a ticket.');
    this.name = 'SolutionRequiredException';
  }
}
