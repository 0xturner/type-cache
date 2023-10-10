import { RESPCommand, RESPType, RESPTypeEncoded } from "./types";

const RESP_TYPE_ENCODING_MAP: Record<RESPTypeEncoded, RESPType> = {
  "+": "SIMPLE_STRING",
  "-": "ERROR",
  ":": "INTEGER",
  $: "BULK_STRING",
  "*": "ARRAY",
};

export function parseType(string: string | undefined): RESPType {
  if (
    !(
      string === "+" ||
      string === "-" ||
      string === ":" ||
      string === "$" ||
      string === "*"
    )
  ) {
    throw new Error(`Invalid message type: ${string}`);
  }

  return RESP_TYPE_ENCODING_MAP[string];
}

export function parseCommand(string: string | undefined): RESPCommand {
  if (string === undefined) {
    throw new Error(`Invalid message command`);
  }

  const normalized = string.toUpperCase();
  if (
    !(
      normalized === "PING" ||
      normalized === "ECHO" ||
      normalized === "SET" ||
      normalized === "GET"
    )
  ) {
    throw new Error(`Invalid message command: ${string}`);
  }
  return normalized;
}

export function parseExpiry(split: string[]): number | null {
  const arg = split[8];
  const ms = split[10];

  if (arg === "px" && ms && !isNaN(parseInt(ms))) {
    return parseInt(ms);
  }

  return null;
}
