import net, { Socket } from "net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("app", () => {
  let client: Socket;

  beforeAll(async () => {
    await new Promise((resolve) => {
      const connection = net.createConnection({ port: 8080 }, () => {
        console.log("connected to server");
        client = connection;
        resolve("connected");
      });
    });
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      client.end(() => {
        console.log("disconnected from server");
        resolve("disconnected");
      });
    });
  });

  it("should respond", async () => {
    await new Promise((resolve) => {
      client.on("data", (data) => {
        expect(data.toString()).to.equal("+PONG\r\n");
        resolve("done");
      });

      client.write("PING");
    });
  });
});
