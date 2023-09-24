import net from "net";
import { parseType, parseCommand } from "./parse";
import { encodeSimpleString } from "./encode";

const PORT = 8080;

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
      if (command === "PING") {
        socket.write(encodeSimpleString("PONG"));
      }
    } else if (type === "ARRAY") {
      const command = parseCommand(split[2]);

      if (command === "PING") {
        socket.write(encodeSimpleString("PONG"));
      } else if (command === "ECHO") {
        const string = split[4];
        if (typeof string !== "string") {
          throw new Error("Nothing to echo");
        }
        socket.write(encodeSimpleString(string));
      }
    }
  });

  socket.on("end", function () {
    console.log("client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
