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
  if (!(string === "PING" || string === "ECHO")) {
    throw new Error(`Invalid messagecommand: ${string}`);
  }
  return string;
}
