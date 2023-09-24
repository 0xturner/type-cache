export type RESPTypeEncoded = "+" | "-" | ":" | "$" | "*";
export type RESPType =
  | "SIMPLE_STRING"
  | "ERROR"
  | "INTEGER"
  | "BULK_STRING"
  | "ARRAY";
export type RESPCommand = "PING" | "ECHO";
