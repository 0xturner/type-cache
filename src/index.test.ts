import net, { Socket } from "net";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  beforeEach,
  afterEach,
} from "vitest";

describe.sequential("app", () => {
  let client: Socket;

  beforeEach(async () => {
    await new Promise((resolve) => {
      const connection = net.createConnection({ port: 8080 }, () => {
        console.log("connected to server");
        client = connection;
        resolve("connected");
      });
    });
  });

  afterEach(async () => {
    await new Promise((resolve) => {
      client.end(() => {
        console.log("disconnected from server");
        resolve("disconnected");
      });
    });
    client = undefined as unknown as Socket;
  });

  it("should respond to string PING", async () => {
    await new Promise((resolve) => {
      client.on("data", (data) => {
        expect(data.toString()).to.equal("+PONG\r\n");
        resolve("done");
      });

      client.write("+PING\r\n");
    });
  });

  it("should respond to array PING", async () => {
    await new Promise((resolve) => {
      client.on("data", (data) => {
        expect(data.toString()).to.equal("+PONG\r\n");
        resolve("done");
      });

      client.write("*1\r\n$4\r\nping\r\n");
    });
  });

  it("should respond to ECHO", async () => {
    await new Promise((resolve) => {
      client.on("data", (data) => {
        expect(data.toString()).to.equal("+hey\r\n");
        resolve("done");
      });

      client.write("*2\r\n$4\r\nECHO\r\n$3\r\nhey\r\n");
    });
  });
});
