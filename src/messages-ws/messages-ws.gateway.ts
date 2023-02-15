import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@WebSocketGateway({ cors: true, namespace: '/' })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
    ) {}

  async handleConnection(client: Socket) {
    const { handshake: { headers: { authentication = null } } } = client;
    let payload: JwtPayload;

    try {

      payload = this.jwtService.verify(authentication as string);
      await this.messagesWsService.registerClient(client, payload.id);

    } catch(error) {
      client.disconnect();
      return;
    }
   
   this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients() );
  }
  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients() );
  }

  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {

    //! Emitir solo al cliente que envió
    /* client.emit('message-from-server', {
      fullName: 'Soy Yo',
      message: payload.message || 'no-message'
    }); */


     //! Emitir a todos MENOS al cliente que envió
     /*client.broadcast.emit('message-from-server', {
      fullName: 'Soy Yo',
      message: payload.message || 'no-message'
    }); */

    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'no-message'
    });
    

  }
}
