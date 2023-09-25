import {Server, Socket} from 'socket.io';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket } from '@nestjs/websockets';
import { Injectable, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-aut.guard';
import { UserCrudService } from 'src/prisma/user-crud.service';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway({cors: true, origins: 'http://localhost:3000'})
@Injectable()
@UseGuards(JwtAuthGuard)
export class WebSocketGatewayClass implements OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer() server: Server;
    constructor(private readonly user : UserCrudService, private readonly authservice: AuthService){};
    private clients: Map<string, Socket> = new Map();
    
    async handleConnection(client: Socket) {
        const token : any = client.handshake.query.token;

        const tokenParts = token.split(' ');
        const JwtToken: string = tokenParts[1];

        const payload: any = this.authservice.extractPayload(JwtToken);
        const clientRoom = `room_${payload.userId}`;
        client.join(clientRoom);
        const notificationtable = await this.user.getUserNotificationsWithUser2Data(payload.userId);
        client.emit('sendlist', notificationtable);
        
        client.on('sendNotification', (notificationData: any) => {
            const targetClientRoom = `room_${notificationData.user_id}`;

            // this.user.createNotification(payload.userId,notificationData.user_id, notificationData.type);
            this.server.to(targetClientRoom).emit('notification', this.user.createNotification(payload.userId,notificationData.user_id, notificationData.type));
        });
        client.on('reponserequest', (response: string) => {
            if (response === 'accept')
            {
                // this.user.createFriendShip()
                // add friend
                console.log('accept');
            }
        })
        this.clients.set(client.id, client);
    }
    

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        this.clients.delete(client.id);
    }

    @SubscribeMessage('connection')
    async handleMessage(client: Socket, requestData: {targetUserId: string, senderId: string})
    {
        try
        {
            
            // console.log(this.clients.size);
            // const {targetUserId, senderId} = requestData;
            // console.log(targetUserId + '_' + senderId);
            // if (this.clients.size > 0) {
            //   const firstClient = this.clients.values().next().value;
            //   firstClient.emit('followeNotification', {message: 'You have a new follower!', id: senderId});
            // firstClient.emit('followeNotification', {message: 'You have a new follower!', id: senderId});
              // Now 'firstClient' contains the first Socket in the map.
            
            
        }
            // else
            // {
            //     client.emit('message', 'User is not online');
            // }
            // console.log(data);
            // const userExists = await this.user.findUserByID(data);
            // if (userExists)
            // {
            //     const userSocket = this.clients.get(userExists.id);
            //     if (userSocket)
            //         userSocket.emit('sendnotification', 'follownotification');
            //     else{
                    // client.emit('sendnotification', 'follownotification');
                // }
        //    }
        //     else
        //     {
        //         client.emit('message', 'User not found');
        //     }
        catch(error)
        {
            console.error('Error handling message:', error.message);
        }
    }
    

}