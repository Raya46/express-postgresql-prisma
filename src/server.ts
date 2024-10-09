import http from "http";
import app from "./app";
import { setupWebSocket } from "./services/webSocketService";

const PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT;
const server = http.createServer(app);

setupWebSocket(server);

app.listen(PORT, () => {
  console.log(`SERVER running on port: ${PORT}`);
});

server.listen(WS_PORT, () => {
  console.log(`WS running on WS_PORT ${WS_PORT}`);
});
