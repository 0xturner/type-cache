import net from "net";

const PORT = 8080;

const server = net.createServer((socket) => {
  console.log("client connected");

  socket.on("data", (data) => {
    // console.log("data: ", data.toString());
    socket.write("+PONG\r\n");
  });

  socket.on("end", function () {
    console.log("client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
