import net from "net";
import { describe, expect, it } from "vitest";

const PORT = 6379;

describe.sequential("app", () => {
  it("should respond to string PING", async () => {
    const client = net.createConnection({ port: PORT });
    console.log("client1: ", client);

    await new Promise((resolve) => {
      client.on("data", (data) => {
        expect(data.toString()).to.equal("+PONG\r\n");

        client.end();
        resolve("done");
      });

      client.write("+PING\r\n");
    });

    console.log("destroy");

    client.destroy();
  });

  it("should respond to array PING", async () => {
    const client = net.createConnection({ port: PORT });

    await new Promise((resolve) => {
      client.on("data", (data) => {
        expect(data.toString()).to.equal("+PONG\r\n");

        client.end();
        resolve("done");
      });

      client.write("*1\r\n$4\r\nping\r\n");
    });

    client.destroy();
  });

  it("should respond to ECHO", async () => {
    const client = net.createConnection({ port: PORT });

    await new Promise((resolve) => {
      client.on("data", (data) => {
        expect(data.toString()).to.equal("+hey\r\n");

        client.end();
        resolve("done");
      });

      client.write("*2\r\n$4\r\nECHO\r\n$3\r\nhey\r\n");
    });

    client.destroy();
  });

  it("should process SET and GET", async () => {
    const key = "foo";
    const value = "bar";

    const client = net.createConnection({ port: PORT }, () => {
      client.write(`*3\r\n$3\r\nset\r\n$3\r\n${key}\r\n$3\r\n${value}\r\n`); // SET

      setTimeout(() => {
        client.write(`*2\r\n$3\r\nget\r\n$3\r\n${key}\r\n`); // GET
      }, 10);
    });

    let responseCount = 0;

    await new Promise(async (resolve) => {
      client.on("data", (data) => {
        if (responseCount === 0) {
          expect(data.toString()).to.equal("+OK\r\n");
        } else if (responseCount === 1) {
          expect(data.toString()).to.equal(`+${value}\r\n`);
          client.end();
          resolve("done");
        }
        responseCount++;
      });
    });

    client.destroy();
  });

  it("should process SET and GET with expiry", async () => {
    const key = "foo1";
    const value = "bar2";
    const timeToLive = 200; // ms

    const client = net.createConnection({ port: PORT }, () => {
      client.write(
        `*3\r\n$3\r\nset\r\n$4\r\n${key}\r\n$4\r\n${value}\r\n$2\r\npx\r\n$3\r\n${timeToLive}\r\n`
      ); // SET

      setTimeout(() => {
        client.write(`*2\r\n$3\r\nget\r\n$4\r\n${key}\r\n`); // GET - within expiry
      }, 10);

      setTimeout(() => {
        client.write(`*2\r\n$3\r\nget\r\n$5\r\n${key}\r\n`); // GET - after expiry
      }, 210);
    });

    let responseCount = 0;

    await new Promise(async (resolve) => {
      client.on("data", (data) => {
        if (responseCount === 0) {
          expect(data.toString()).to.equal("+OK\r\n");
        } else if (responseCount === 1) {
          expect(data.toString()).to.equal(`+${value}\r\n`);
        } else if (responseCount === 2) {
          expect(data.toString()).to.equal(`$-1\r\n`);
          client.end();
          resolve("done");
        }
        responseCount++;
      });
    });

    client.destroy();
  });
});
