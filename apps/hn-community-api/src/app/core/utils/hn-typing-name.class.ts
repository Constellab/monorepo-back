export class HnTypingName {
  static getBrickName(typingName: string): string {
    return typingName.split('.')[1];
  }

  static getProcessType(typingName: string): string {
    return typingName.split('.')[0];
  }

  static getProcessName(typingName: string): string {
    return typingName.split('.')[3];
  }
}
