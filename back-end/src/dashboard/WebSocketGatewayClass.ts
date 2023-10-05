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
        console.log('token : ', token);
        if (token)
        {
          const tokenParts = token.split(' ');
          const JwtToken: string = tokenParts[1];
          const payload: any = this.authservice.extractPayload(JwtToken);
          console.log('payload :', payload);
        if (payload)
        {
          const clientRoom = `room_${payload.userId}`;
          console.log('target client ', clientRoom);
          client.join(clientRoom);
          const notificationtable = await this.user.getUserNotificationsWithUser2Data(payload.userId);
          // console.log('notification table : ', notificationtable);
          if (notificationtable.length)
              client.emit('sendlist', notificationtable);
        }
        this.clients.set(client.id, client);
        }
    }
    

    handleDisconnect(client: Socket) {
        this.clients.delete(client.id);
    }

    
    @SubscribeMessage('sendNotification')
    // @UseGuards(JwtAuthGuard)
    async handleSendNotification(@MessageBody() notificationData: any){
        const targetClientRoom = `room_${notificationData.user_id}`;
        console.log('target client ', targetClientRoom);
        const token: any = notificationData.token;
        const tokenParts = token.split(' ');
        const JwtToken: string = tokenParts[1];
    
        const payload: any = this.authservice.extractPayload(JwtToken);
        try {
            await this.user.createNotification(notificationData.user_id, payload.userId, notificationData.type);
            const getnotificationtable = await this.user.findUserByID(payload.userId);
            this.server.to(targetClientRoom).emit('notification', getnotificationtable);
        } catch (error) {
          console.error('Error creating notification:', error);
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
            let check = await this.user.findFriendship(payload.user_id, notificationData.user_id);
            // let check_another = await this.user.findFriendship(notificationData.user_id, payload.user_id);
            if (check === null)
            {
              await this.user.createFriendShip(payload.userId, notificationData.user_id);
              const usersId: any[] = await this.user.findFriendsList(payload.userId);
              // await this.user. change type of notification to accepted invitation
              console.log('IDDDDD : ', usersId);
              const users: any[] = [];
              await Promise.all(
              usersId.map(async (user) => {
                const userData = await this.user.findUserByID(user);
                users.push(userData);
              })
              );
              console.log('users ', users);
              const MyClientRoom = `room_${payload.userId}`;
              this.server.to(MyClientRoom).emit('friend', users);

              // send to other user
              const usersId_other: any[] = await this.user.findFriendsList(notificationData.user_id);
              const users_other: any[] = [];
    
              await Promise.all(
                usersId_other.map(async (user) => {
                const userData = await this.user.findUserByID(user);
                users_other.push(userData);
              })
              );
              console.log('other useeeeeeer : ', users_other);
              console.log('notiiiiiiif : ', notificationData.user_id);
              const targetClientRoom = `room_${notificationData.user_id}`;
              this.server.to(targetClientRoom).emit('friend', users_other);
            }
          }
          catch (error)
          {
              console.log('Error :', error);
          }
        }
      }
      @SubscribeMessage('status')
      async handleonline(@MessageBody() notificationData: any)
      {
        const token: any = notificationData.token;
        // console.log('notificationData : ', notificationData);
        if (token)
        {
          const tokenParts = token.split(' ');
          const JwtToken: string = tokenParts[1];
          const payload: any = this.authservice.extractPayload(JwtToken);
          const usersId: any [] = await this.user.findFriendsList(payload.userId);
          const users: any[] = [];

          // console.log('users : ', usersId);
    
      // await Promise.all(
      //   usersId.map(async (user) => {
      //     if (user.user1_id === payload.userId)
      //     {
      //       const userData = await this.user.findUserByID(user.user2_id);
      //       users.push(userData);
      //     }
      //     else if (user.user2_id === payload.userId)
      //     {
      //         const userData = await this.user.findUserByID(user.user1_id);
      //         users.push(userData);
      //     }
      //   })
      // );
          // console.log('users : ', users);
          if (users)
          {
            users.map((user) => {
              const targetClientRoom = `room_${user.id}`;
              // console.log('target : ', targetClientRoom);
              if (notificationData.status === 'online')
                this.server.to(targetClientRoom).emit('online', payload.userId);
              else if (notificationData.status === 'offline')
                this.server.to(targetClientRoom).emit('offline', payload.userId);
            })
          }
        }
      }
}