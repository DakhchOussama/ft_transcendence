import {Server, Socket} from 'socket.io';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Injectable, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-aut.guard';
import { UserCrudService } from 'src/prisma/user-crud.service';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway({cors: true, origins: 'http://localhost:3000'})
@Injectable()
// @UseGuards(JwtAuthGuard)
export class WebSocketGatewayClass implements OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer() server: Server;
    constructor(private readonly user : UserCrudService, private readonly authservice: AuthService){};
    private clients: Map<string, Socket> = new Map();

    async handleConnection(client: Socket) {
        const token : any = client.handshake.query.token;
        console.log(`Client connected: ${client.id}`);
        const tokenParts = token.split(' ');
        const JwtToken: string = tokenParts[1];

        const payload: any = this.authservice.extractPayload(JwtToken);
        const clientRoom = `room_${payload.userId}`;
        client.join(clientRoom);
        const notificationtable = await this.user.getUserNotificationsWithUser2Data(payload.userId);
        console.log('notification : ', notificationtable);
        if (notificationtable.length)
            client.emit('sendlist', notificationtable);
        // client.on('responserequest', (response: string) => {
        //     console.log('IM here');
        //     if (response === 'accept')
        //     {
        //         // this.user.createFriendShip()
        //         // add friend
        //         console.log('accept');
        //     }
        // })
        this.clients.set(client.id, client);
    }
    

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        this.clients.delete(client.id);
    }

    
    @SubscribeMessage('sendNotification')
    // @UseGuards(JwtAuthGuard)
    async handleSendNotification(@MessageBody() notificationData: any){
        const targetClientRoom = `room_${notificationData.user_id}`;
        const token: any = notificationData.token;
        const tokenParts = token.split(' ');
        const JwtToken: string = tokenParts[1];
    
        const payload: any = this.authservice.extractPayload(JwtToken);
        try {
          const notificationtable = await this.user.getUserNotificationsWithUser2Data(payload.userId);
          if (notificationtable)
          {
            notificationtable.map((notif) => {
              if (notif.id === notificationData.user_id)
                console.log('Im here');
            });
          }
          
          await this.user.createNotification(notificationData.user_id, payload.userId, notificationData.type);
          const getnotificationtable = await this.user.findUserByID(payload.userId);
          console.log('notification table : ', getnotificationtable);
          this.server.to(targetClientRoom).emit('notification', getnotificationtable);
        } catch (error) {
          console.error('Error creating notification:', error);
          // Handle the error as needed
        }
      };

      @SubscribeMessage('responserequest')
      async handleresponserequest(@MessageBody() notificationData: any)
      {
        const token: any = notificationData.token;
        const tokenParts = token.split(' ');
        const JwtToken: string = tokenParts[1];
    
        const payload: any = this.authservice.extractPayload(JwtToken);
        if (notificationData.response === 'accept')
        {
          // console.log('user_id', payload.userId);
          try
          {
            console.log('notification : ', notificationData.user_id);
            const user = await this.user.findUserByID(notificationData.user_id);
            if (user)
              console.log('user : ', user.username);
              this.user.createFriendShip(payload.userId, notificationData.user_id);
          }
          catch (error)
          {
              console.log('Error :', error);
          }
        }
      }
    
}