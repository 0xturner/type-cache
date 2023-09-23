import net, { Socket } from "net";

const server = net.createServer((connection: Socket) => {});

server.listen(6379, "127.0.0.1");
