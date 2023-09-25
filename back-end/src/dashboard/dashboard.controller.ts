import { Body, Controller, Get, Patch, Req, Res, UseGuards } from '@nestjs/common';
import { matchDto } from 'src/chat/dto/match.dto';
import { GameCrudService } from 'src/prisma/game-crud.service';
import { UserCrudService } from 'src/prisma/user-crud.service';
import { WebSocketGatewayClass } from './WebSocketGatewayClass';
import { JwtAuthGuard } from 'src/auth/guards/jwt-aut.guard';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';


@Controller('api')
export class DashboardController {
    constructor(private readonly user : UserCrudService, private readonly resultgame : GameCrudService, private readonly websocketDashboard: WebSocketGatewayClass, private readonly authservice: AuthService, private readonly service: PrismaService) {}
    @Get('Dashboard')
    @UseGuards(JwtAuthGuard)
    async HandleProfilepic(@Req() request, @Res() response: any) {
      const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) {
      return response.status(401).send({ error: 'Authorization header is missing' });
    }
    const tokenParts = authorizationHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return response.status(401).send({ error: 'Invalid authorization header format' });
    }

    const JwtToken: string = tokenParts[1];
  
    const payload: any = this.authservice.extractPayload(JwtToken);
    const user = await this.service.prismaClient.user.findUnique({
      where: {
        id: payload.userId,
      },
    });
    return response.status(200).send(user);
    }

  @Get('Dashboard/allUsers')
  @UseGuards(JwtAuthGuard)
  async sendAllfriend(@Req() request, @Res() response: any)
  {
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) {
      return response.status(401).send({ error: 'Authorization header is missing' });
    }
    const tokenParts = authorizationHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return response.status(401).send({ error: 'Invalid authorization header format' });
    }

    const JwtToken: string = tokenParts[1];

    try {
      const payload: any = this.authservice.extractPayload(JwtToken);
      const users: any[] = await this.user.findAllUsersdata(payload.userId);
      return response.status(200).send(users);
    } catch (error) {
      // Handle any errors that occur during the process
      console.error('Error:', error);
      return response.status(500).send({ error: 'Internal Server Error' });
    }

  }
  

  @Get('Dashboard/friends')
  @UseGuards(JwtAuthGuard)
  async sendUser(@Req() request, @Res() response: any)
  {
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) {
      return response.status(401).send({ error: 'Authorization header is missing' });
    }
    const tokenParts = authorizationHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return response.status(401).send({ error: 'Invalid authorization header format' });
    }

    const JwtToken: string = tokenParts[1];

    try {
      const payload: any = this.authservice.extractPayload(JwtToken);
      const usersId: any[] = await this.user.findFriendsList(payload.userId);
      const users: any[] = [];
    
      await Promise.all(
        usersId.map(async (user) => {
          const userData = await this.user.findUserByID(user.id);
          users.push(userData);
        })
      );
      return response.status(200).send(users);
    } catch (error) {
      // Handle any errors that occur during the process
      console.error('Error:', error);
      return response.status(500).send({ error: 'Internal Server Error' });
    }
  }

  @Get('Dashboard/friends/result')
  @UseGuards(JwtAuthGuard)
  async result(@Req() request, @Res() response: any)
  {
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) {
      return response.status(401).send({ error: 'Authorization header is missing' });
    }
    const tokenParts = authorizationHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return response.status(401).send({ error: 'Invalid authorization header format' });
    }

    const JwtToken: string = tokenParts[1];

    try {
      const payload: any = this.authservice.extractPayload(JwtToken);
      const users: any[] = await this.user.userMatchsRecord(payload.userId);
      return response.status(200).send(users);
    } catch (error) {
      // Handle any errors that occur during the process
      console.error('Error:', error);
      return response.status(500).send({ error: 'Internal Server Error' });
    }
  }

  @Get('Dashboard/game')
  @UseGuards(JwtAuthGuard)
  async game(@Req() request, @Res() response: any)
  {
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) {
      return response.status(401).send({ error: 'Authorization header is missing' });
    }
    const tokenParts = authorizationHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return response.status(401).send({ error: 'Invalid authorization header format' });
    }

    const JwtToken: string = tokenParts[1];
    const payload: any = this.authservice.extractPayload(JwtToken);
    const user = await this.user.getUserStats(payload.userId);
    return response.status(200).send(user);
  }

  // @Post('Dashboard/addfriend')
  // addfriends(@Body() data: any)
  // {
  //     console.log('Receive data', data);
  //     return data;
  // }

  @Get('Dashboard/statistic')
  @UseGuards(JwtAuthGuard)
  async sendStatistic(@Req() request, @Res() response: any)
  {
    // const JwtToken: string = request.headers.authorization.split(' ')[1];
    // const payload: any = this.authservice.extractPayload(JwtToken);
    // const user = await this.resultgame.retieveAllGamerecords(payload.userId);
    // console.log(user);
    // return response.status(200).send(user);
    const statistic =  [
      {result: '8-4', date: '2023-08-11'},
      {result: '8-0', date: '2023-08-11'},
      {result: '8-4', date: '2023-08-11'},
      {result: '8-0', date: '2023-08-12'},
      {result: '8-4', date: '2023-08-12'},
      {result: '8-0', date: '2023-08-12'},
      {result: '8-4', date: '2023-08-12'},
      {result: '8-0', date: '2023-08-12'},
      {result: '7-9', date: '2023-08-13'},
      {result: '5-7', date: '2023-08-13'},
      {result: '2-3', date: '2023-08-14'},
      {result: '2-3', date: '2023-08-14'},
      {result: '2-3', date: '2023-08-14'},
      {result: '2-3', date: '2023-08-14'},
      {result: '2-3', date: '2023-08-14'},
      {result: '8-4', date: '2023-08-17'},
      {result: '8-0', date: '2023-08-15'},
      {result: '8-4', date: '2023-08-19'},
      {result: '8-0', date: '2023-08-12'},
      {result: '8-4', date: '2023-08-21'},
      {result: '8-0', date: '2023-08-13'},
      {result: '8-4', date: '2023-08-10'},
      {result: '8-0', date: '2023-08-10'},
      {result: '7-9', date: '2023-08-13'},
      {result: '5-7', date: '2023-08-12'},
      {result: '2-3', date: '2023-08-14'},
      {result: '2-3', date: '2023-08-546'},
      {result: '2-3', date: '2023-08-134'},
      {result: '2-3', date: '2023-08-14'},
    ]
    
    return response.status(200).send(statistic);
  }

  @Patch('Dashboard/setting')
  setting(@Body() data: any)
  {
    console.log(`setting : ${data.twofactor}`);
  }

  // @Patch('Dashboard/Section')
  // Section(@Body() data: any)
  // {
  //   console.log(data);
  // }
}
