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

  it.only("should process SET and GET", async () => {
    let responseCount = 0;
    const key = "foo";
    const value = "bar";

    await new Promise(async (resolve) => {
      client.on("data", (data) => {
        if (responseCount === 0) {
          expect(data.toString()).to.equal("+OK\r\n");
          responseCount++;
        } else if (responseCount === 1) {
          expect(data.toString()).to.equal(`+${value}\r\n`);
          resolve("done");
        }
      });

      client.write(`*3\r\n$3\r\nset\r\n$5\r\n${key}\r\n$5\r\n${value}\r\n`); // SET
      client.write(`*2\r\n$3\r\nget\r\n$5\r\n${key}\r\n`); // GET
    });
  });
});
