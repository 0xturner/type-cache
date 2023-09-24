export function encodeSimpleString(string: string): string {
  return `+${string}\r\n`;
}
