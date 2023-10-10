import net from "net";
import { parseType, parseCommand, parseExpiry } from "./parse";
import { encodeSimpleString } from "./encode";
import { RESPCommand } from "./types";

const PORT = 6379;

const store = new Map<string, { value: string; expiry: number | null }>();

const server = net.createServer((socket) => {
  console.log("client connected");

  socket.on("data", (data) => {
    const string = data.toString();
    const split = string.split("\r\n");
    if (split.length) {
      split.pop(); // remove last empty string
    }

    if (typeof split[0]?.[0] !== "string") {
      throw new Error("Invalid message");
    }

    const type = parseType(split[0][0]);

    if (type === "SIMPLE_STRING") {
      const command = parseCommand(split[0].substring(1));
      const result = simpleStringHandlers[command]();
      socket.write(encodeSimpleString(result));
    } else if (type === "ARRAY") {
      const command = parseCommand(split[2]);
      const result = arrayMessageHandlers[command](split);
      const encoded =
        result === null ? NULL_BULK_STRING : encodeSimpleString(result);
      socket.write(encoded);
    }
  });

  socket.on("end", function () {
    console.log("client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

const simpleStringHandlers: Record<RESPCommand, () => string> = {
  PING: (): string => {
    return "PONG";
  },
  ECHO: (): string => {
    throw new Error("not supported");
  },
  SET: (): string => {
    throw new Error("not supported");
  },
  GET: (): string => {
    throw new Error("not supported");
  },
};

const arrayMessageHandlers: Record<
  RESPCommand,
  (split: string[]) => string | null
> = {
  PING: (): string => {
    return "PONG";
  },
  ECHO: (split): string => {
    const string = split[4];
    if (typeof string !== "string") {
      throw new Error("Nothing to echo");
    }

    return string;
  },
  SET: (split): string => {
    const key = split[4];
    const value = split[6];

    if (typeof key !== "string" || typeof value !== "string") {
      throw new Error("Missing key or value");
    }

    const expiry = parseExpiry(split);

    store.set(key, {
      value,
      expiry: expiry ? getExpiry(expiry) : null,
    });

    return "OK";
  },
  GET: (split): string | null => {
    const key = split[4];
    if (typeof key !== "string") {
      throw new Error("Missing key");
    }
    const record = store.get(key);
    if (!record) {
      throw new Error("No value found");
    }

    const { value, expiry } = record;

    if (expiry && isExpired(expiry)) {
      store.delete(key);
      return null;
    }

    return value;
  },
};

function getExpiry(ms: number) {
  const now = new Date().getTime();
  return now + Number(ms);
}

function isExpired(expiry: number) {
  const now = new Date().getTime();
  return now > expiry;
}

const NULL_BULK_STRING = "$-1\r\n";
