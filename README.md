# TypeCache

![Node.js](https://img.shields.io/badge/Node.js-v19.0.0-green)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.2.2-blue)

## Work in Progress

:construction: This project is experimental and not stable. Feel free to explore and experiment, but please be aware of potential issues and changes. Contributions and feedback are welcome!

### Overview

A simple in-memory key-value store server, implemented in TypeScript and Node.js. Designed for lightweight storage and speedy retrieval with zero external dependencies. It uses a subset of the RESP (Redis Serialization Protocol) wire protocol for communication and supports passive key expiry.

### Usage

To start the in-memory database server, use the following command:

```bash
pnpm start
```

This will start the server on the default port (`6379`). You can now connect to the database using a client that supports the RESP protocol, such as `redis-cli`.

## RESP Protocol

The RESP (REdis Serialization Protocol) is a simple, binary-safe protocol used by Redis for client-server communication. This database server implements the RESP protocol, allowing you to interact with it using standard Redis clients.

For more information on the RESP protocol, refer to the [official documentation](https://redis.io/topics/protocol).

## Future plans

- Persistance and auto recovery
- Active key expiry
- More data types
