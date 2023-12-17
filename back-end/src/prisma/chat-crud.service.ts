import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {
  MessageDto,
  channelDto,
  channelMembershipDto,
  dmDto,
} from 'src/chat/dto/chat.dto';
import * as bcrypt from 'bcryptjs';
import { use } from 'passport';

@Injectable()
export class ChatCrudService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async roomIsDm(room_id: string) {
    try {
      return (
        (await this.prisma.prismaClient.directMessaging.count({
          where: {
            id: room_id,
          },
        })) != 0
      );
    } catch (err) {
      return (await this.prisma.prismaClient.channel.count({
        where: {
          id: room_id,
        },
      }))
        ? false
        : null;
    }
  }

  async retrieveUserContactBook(user_id: string) {
    const partnersIds = await this.prisma.prismaClient.directMessaging.findMany(
      {
        where: {
          OR: [{ user1_id: user_id }, { user2_id: user_id }],
        },
        orderBy: {
          updatedAt: 'asc',
        },
        select: {
          user1_id: true,
          user2_id: true,
        },
      },
    );
    //Promise.all waits for all map operations to end
    const partnerContactData = Promise.all(
      partnersIds.map(async (dm_item) => {
        //This next check which id belong to the parntner of the actual user
        const partner_id =
          user_id == dm_item.user1_id ? dm_item.user2_id : dm_item.user1_id;
        const partnerData = await this.prisma.prismaClient.user.findUnique({
          where: {
            id: partner_id,
          },
          select: {
            username: true,
            avatar: true,
          },
        });
        return {
          id: partner_id,
          username: partnerData.username,
          avatar: partnerData.avatar,
        };
      }),
    );
    return partnerContactData;
  }

  async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      // Compare the password and the hashed password
      const isMatch = await bcrypt.compare(password, hashedPassword);

      return isMatch;
    } catch (error) {
      // Handle any errors here
      throw new Error('Password comparison failed');
    }
  }

  async retrieveUserChannelsBook(user_id: string) {
    const channels = await this.prisma.prismaClient.channelMembership.findMany({
      where: {
        user_id: user_id,
      },
      include: {
        channel: true,
      },
    });
    return channels.map((item) => {
      return {
        id: item.channel.id,
        name: item.channel.name,
        image: item.channel.image,
        type: item.channel.type,
      };
    });
  }
  async findUsersInCommonChannel(channel_id:string, user_id: string) {
    const channelMembers = await this.prisma.prismaClient.channelMembership.findMany
    (
      {
        where:{
          channel_id : channel_id, 
        },
        select:{
          user:{
            select:{
              id:true,
              username: true,
              avatar:true, 
            }
          }
        }
      }
    )
    const channelPartners = channelMembers
    .filter((member) => member.user.id !== user_id)
    .map((member) => member.user);
    return channelPartners
  }

  async findUsersInCommonChannels(user_id: string) {
    const joinedChannels =
      await this.prisma.prismaClient.channelMembership.findMany({
        where: {
          user_id: user_id,
        },
        select: {
          channel_id: true,
        },
      });

    const commonUsersData = await Promise.all(
      joinedChannels.map(async (channel) => {
        const usersInChannel =
          await this.prisma.prismaClient.channelMembership.findMany({
            where: {
              channel_id: channel.channel_id,
            },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
          });

        const messagesInChannel =
          await this.prisma.prismaClient.message.findMany({
            where: {
              channel_id: channel.channel_id,
            },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
          });

        // Extract unique users from both lists
        const allUsers = [...usersInChannel, ...messagesInChannel].map(
          (item) => item.user,
        );
        const uniqueUsers = Array.from(
          new Set(allUsers.map((user) => user.id)),
        ).map((userId) => {
          const user = allUsers.find((u) => u.id === userId);
          return {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
          };
        });

        // Use filter to exclude the current user
        const selectedUserData = uniqueUsers.filter(
          (user) => user.id !== user_id,
        );

        return selectedUserData;
      }),
    );

    const flattenedData = commonUsersData.flat(); // Flatten the nested arrays

    if (flattenedData.length === 0) {
      return undefined;
    }

    return flattenedData;
  }


  async retrieveUserDmChannels(user_id: string) {
    return await this.prisma.prismaClient.directMessaging.findMany({
      where: {
        OR: [{ user1_id: user_id }, { user2_id: user_id }],
      },
      orderBy: {
        updatedAt: 'asc',
      },
      select: {
        id: true,
        user1_id: true,
        user2_id: true,
      },
    });
  }

  async findDmPartnerId(dm_id: string, user_id: string) {
    const dm = await this.prisma.prismaClient.directMessaging.findUnique({
      where: {
        id: dm_id,
      },
      select: {
        user1_id: true,
        user2_id: true,
      },
    });
    if (!dm) return undefined;
    return dm.user1_id == user_id ? dm.user2_id : dm.user1_id;
  }

  async retreiveDmInitPanelData(user_id: string) {
    const dmUsersIds = await this.prisma.prismaClient.directMessaging.findMany({
      where: {
        OR: [{ user1_id: user_id }, { user2_id: user_id }],
      },
      select: {
        id: true,
        user1_id: true,
        user2_id: true,
        messages: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            is_read: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });
    dmUsersIds.sort((a, b) => {
      const dateA = a.messages[0]?.createdAt || new Date(1900, 0, 1);
      const dateB = b.messages[0]?.createdAt || new Date(1900, 0, 1);
      return dateB > dateA ? 1 : dateB < dateA ? -1 : 0;
    });

    return dmUsersIds.map((dm_item) => {
      const partner =
        user_id == dm_item.user1_id ? dm_item.user2_id : dm_item.user1_id;
      return {
        id: dm_item.id,
        partner_id: partner,
        last_message: dm_item.messages[0],
      };
    });
  }

  async retreiveChannelPanelsData(user_id: string) {
    const channelMemberships =
      await this.prisma.prismaClient.channelMembership.findMany({
        where: {
          user_id: user_id,
        },
        select: {
          createdAt: true,
          channel: {
            select: {
              id: true,
              type: true,
              createdAt: true,
              messages: {
                select: {
                  id: true,
                  content: true,
                  createdAt: true,
                },
                orderBy: {
                  createdAt: 'desc',
                },
                take: 1,
              },
            },
          },
        },
      });

    // Structure the data with the desired fields
    const formattedData = channelMemberships.map((membership) => {
      const last_message =
        membership.createdAt < membership.channel.messages[0]?.createdAt
          ? membership.channel.messages[0]
          : undefined;
      return {
        id: membership.channel.id,
        partner_id: undefined,
        last_message: last_message,
        type: membership.channel.type,
        createdAt: membership.createdAt,
      };
    });
    // Sort the data by last message datefetchedData.map( (item : DiscussionDto)=>
    formattedData.sort((a, b) => {
      const dateA =
        (a.last_message ? a.last_message.createdAt : a.createdAt) ||
        new Date(1900, 0, 1);
      const dateB =
        (b.last_message ? b.last_message.createdAt : b.createdAt) ||
        new Date(1900, 0, 1);
      return dateB > dateA ? 1 : dateB < dateA ? -1 : 0;
    });
    //the channels that dont' have messages you should use the date of creation of the channel as a date of the last message
    formattedData.forEach((item) => {
      delete item.createdAt;
    });
    return formattedData;
  }

  // Create a new chat channel (public, or password-protected).

  async createChannel(
    user_id: string,
    data: channelDto,
    invitedUsers: string[],
  ) {
    var memberUsersIds = [];
    memberUsersIds.push(user_id);
    const channel_id: string = (
      await this.prisma.prismaClient.channel.create({ data })
    ).id;

    const memberShipData: channelMembershipDto = {
      channel_id: channel_id,
      user_id: user_id,
      role: 'OWNER',
    };
    try {
      await this.joinChannel(memberShipData);
      //create membership for the invited users using usernames in the invitedUsers array
      for (const invitedUser of invitedUsers) {
        const invitedUser_id = await this.prisma.prismaClient.user
          .findFirst({
            where: {
              username: invitedUser,
            },
            select: {
              id: true,
            },
          })
          .then((user) => user.id);

        memberUsersIds.push(invitedUser_id);
        if (invitedUser_id) {
          const memberShipData: channelMembershipDto = {
            channel_id: channel_id,
            user_id: invitedUser_id,
            role: 'USER',
          };
          await this.joinChannel(memberShipData);
        }
      }
    } catch (error) {}
    return { id: channel_id, memberUsersIds };
  }

  //user joins channel

  async joinChannel(data: channelMembershipDto) {
    return await this.prisma.prismaClient.channelMembership.create({
      data,
      select: {
        channel: {
          select: {
            id: true,
            name: true,
            image: true,
            type: true,
          },
        },
      },
    });
  }

  async findChannelById(channel_id: string) {
    return await this.prisma.prismaClient.channel.findUnique({
      where: {
        id: channel_id,
      },
    });
  }

  async findDmById(dm_id: string) {
    try {
      return await this.prisma.prismaClient.directMessaging.findUnique({
        where: {
          id: dm_id,
        },
      });
    } catch {
      return null;
    }
  }

  async findChannelsByType(channel_type: 'PUBLIC' | 'PRIVATE' | 'PROTECTED') {
    return this.prisma.prismaClient.channel.findMany({
      where: {
        type: channel_type,
      },
    });
  }
  async createDm(data: dmDto) {
    return (await this.prisma.prismaClient.directMessaging.create({ data })).id;
  }

  async findDmByUsers(user1_id: string, user2_id: string) {
    const Dm = await this.prisma.prismaClient.directMessaging.findMany({
      where: {
        OR: [
          {
            user1_id: user1_id,
            user2_id: user2_id,
          },
          {
            user1_id: user2_id,
            user2_id: user1_id,
          },
        ],
      },
      select: {
        id: true,
      },
    });

    return Dm.length > 0 ? Dm[0] : null;
  }

  //this method finds all the channels that exist in the server

  async findAllChannelsAvailbleToJoin(user_id: string) {
    const joinedChannels =
      await this.prisma.prismaClient.channelMembership.findMany({
        where: {
          user_id: user_id,
        },
        select: {
          channel_id: true,
        },
      });
    const notJoinedChannels = await this.prisma.prismaClient.channel.findMany({
      where: {
        id: {
          notIn: joinedChannels.map((item) => item.channel_id),
        },
        OR: [{ type: 'PUBLIC' }, { type: 'PROTECTED' }],
      },
      select: {
        id: true,
        name: true,
        image: true,
        type: true,
      },
    });
    return notJoinedChannels;
  }

  async findAllDmsAvailbleToJoin(user_id: string) {
    const joinedDm = await this.prisma.prismaClient.directMessaging.findMany({
      where: {
        OR: [{ user1_id: user_id }, { user2_id: user_id }],
      },
      select: {
        user1_id: true,
        user2_id: true,
      },
    });
    const conatactedUsers = joinedDm.map((item) => {
      return item.user1_id == user_id ? item.user2_id : item.user1_id;
    });

    const friends = await this.prisma.prismaClient.friendships.findMany({
      where: {
        OR: [{ user1_id: user_id }, { user2_id: user_id }],
      },
      select: {
        user1_id: true,
        user2_id: true,
      },
    });

    const friendsIds = friends.map((item) => {
      return item.user1_id == user_id ? item.user2_id : item.user1_id;
    });

    //get the friends that the user doesn't have a dm with
    const notDmedUsersIds = friendsIds.filter((item) => {
      return !conatactedUsers.includes(item);
    });
    return await this.prisma.prismaClient.user.findMany({
      where: {
        id: {
          in: notDmedUsersIds,
        },
      },
      select: {
        username: true,
        avatar: true,
      },
    });
  }
  async findAllJoinedChannels(user_id: string) {
    //check also if the user is banned from the channel
    return await this.prisma.prismaClient.channelMembership.findMany({
      where: {
        user_id: user_id,
      },
    });
  }

  async retrieveRoomMessages(
    user_id: string,
    room_id: string, //This method is used both for dm and groups
  ) {
    try {
      const messages = await this.prisma.prismaClient.message.findMany({
        where: {
          OR: [{ channel_id: room_id }, { dm_id: room_id }],
        },
        select: {
          id:true,
          user_id: true,
          content: true,
          createdAt: true,
          is_read: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      if (await this.roomIsDm(room_id)) return messages;
      const channelMembership =
        await this.prisma.prismaClient.channelMembership.findFirst({
          where: { channel_id: room_id, user_id: user_id },
          select: {
            createdAt: true,
            channel: {
              select: { createdAt: true },
            },
          },
        });
      const channelJoiningTime = channelMembership.createdAt;

      const msg = messages.filter((message) => {
        return message.createdAt > channelJoiningTime;
      });
      return msg;
    } catch {
      throw new NotFoundException(`Channel with ID ${room_id} not found.`);
    }
  }

  async getUnreadDmMessagesNumber(user_id: string, room_id: string) {
    const unreadMessageCount = await this.prisma.prismaClient.message.count({
      where: {
        dm_id: room_id,
        NOT: {
          user_id: user_id,
        },
        is_read: false,
      },
    });
    return unreadMessageCount;
  }

  async getUnreadChannelMessagesNumber(userId: string, channelId: string) {
    // Retrieve the user's last visit timestamp for the channel
    const channelMembership =
      await this.prisma.prismaClient.channelMembership.findFirst({
        where: { channel_id: channelId, user_id: userId },
        select: { last_visit: true },
      });

    if (!channelMembership) {
      throw new Error('User is not a member of the channel');
    }

    const lastVisitTimestamp = channelMembership.last_visit;
    // Count messages in the channel created after the last visit
    const messageCount = await this.prisma.prismaClient.message.count({
      where: {
        channel_id: channelId,
        createdAt: { gte: lastVisitTimestamp },
      },
    });

    return messageCount;
  }

  async markRoomMessagesAsRead(user_id: string, room_id: string) {
    // Check if room_id corresponds to a DM
    const isDm = await this.prisma.prismaClient.directMessaging.findFirst({
      where: {
        id: room_id,
      },
    });

    if (isDm) {
      // Update is_read for DM messages
      const unreadMessages = await this.prisma.prismaClient.message.updateMany({
        where: {
          NOT: {
            user_id: user_id,
          },
          dm_id: room_id,
          is_read: false,
        },
        data: {
          is_read: true,
        },
      });

      return unreadMessages;
    } else {
      // Update last_visit for channel messages
      const channelMembership =
        await this.prisma.prismaClient.channelMembership.findFirst({
          where: { channel_id: room_id, user_id: user_id },
        });

      if (!channelMembership) {
        throw new Error('User is not a member of the channel');
      }

      const now = new Date();

      await this.prisma.prismaClient.channelMembership.update({
        where: { id: channelMembership.id },
        data: { 
          last_visit: now,
        },
      });

      return null;
    }
  }

  async findBannedDmRooms(user_id: string) {
    return await this.prisma.prismaClient.directMessaging.findMany({
      where: {
        OR: [{ user1_id: user_id }, { user2_id: user_id }],
        status: 'BANNED',
      },
      select: {
        id: true,
        blocker_id: true,
      },
    });
  }
  async findBannedChannelsRooms(user_id: string) {
    return await this.prisma.prismaClient.channelMembership.findMany({
      where: {
        user_id: user_id,
        is_banned: true,
      },
      select: {
        channel_id: true,
      },
    });
  }

  async findMutedChannelsRooms(user_id: string) {
    return await this.prisma.prismaClient.channelMembership.findMany({
      where: {
        user_id: user_id,
        is_muted: true,
      },
      select: {
        channel_id: true,
      },
    });
  }

  // Retrieve direct messages between users.
  async retieveBlockedUsersList(user_id: string) {
    return this.prisma.prismaClient.friendships.findMany({
      where: {
        OR: [{ user1_id: user_id }, { user2_id: user_id }],
        relationStatus: 'BLOCK',
      },
    });
  }

  async retieveBlockedChannelUsers(
    channel_id: string, //for groups only
  ) {
    const banned_users =
      await this.prisma.prismaClient.channelMembership.findMany({
        where: {
          channel_id: channel_id,
          is_banned: true,
        },
        select: {
          user: {
            select: {
              id: true,
            },
          },
        },
      });
    return banned_users.map((user) => user.user.id);
  }

  async retieveMutedChannelUsers(
    channel_id: string, //for groups only
  ) {
    const banned_users =
      await this.prisma.prismaClient.channelMembership.findMany({
        where: {
          channel_id: channel_id,
          is_muted: true,
        },
        select: {
          user: {
            select: {
              id: true,
            },
          },
        },
      });
    return banned_users.map((user) => user.user.id);
  }

  async findExpiredBans() {
    const expiredBans =
      await this.prisma.prismaClient.channelMembership.findMany({
        where: {
          ban_expires_at: {
            lte: new Date(),
          },
        },
        select: {
          channel: true,
          user: true,
        },
      });
    return expiredBans.map((ban) => {
      return { channel: ban.channel.id, user: ban.user.id };
    });
  }

  async findExpiredMutes() {
    const expiredMutes =
      await this.prisma.prismaClient.channelMembership.findMany({
        where: {
          mute_expires_at: {
            lte: new Date(),
          },
        },
        select: {
          channel: true,
          user: true,
        },
      });
    return expiredMutes.map((mute) => {
      return { channel: mute.channel.id, user: mute.user.id };
    });
  }

  async changeChannelPhoto(channel_id: string, newAvatarURI: string) {
    return await this.prisma.prismaClient.channel.update({
      where: { id: channel_id },
      data: {
        image: newAvatarURI,
      },
    });
  }

  async changeChannelType(
    channel_id: string,
    type: 'PUBLIC' | 'PROTECTED' | 'PRIVATE',
    password: string,
  ) {
    if (type === 'PROTECTED' && password.length < 8) return null;
    return await this.prisma.prismaClient.channel.update({
      where: {
        id: channel_id,
      },
      data: {
        type: type,
        password: password,
      },
    });
  }

  async changeChannelName(channel_id: string, new_name: string) {
    return await this.prisma.prismaClient.channel.update({
      where: { id: channel_id },
      data: {
        name: new_name,
      },
    });
  }

  //User a ban a user from a group
  async blockAUserWithinGroup(blockSignal: {
    user_id: string;
    channel_id: string;
    banDuration: number;
  }) {
    const banExpiresAt = new Date(
      new Date().getTime() + blockSignal.banDuration,
    );

    await this.prisma.prismaClient.channelMembership.update({
      where: {
        channel_id_user_id: {
          channel_id: blockSignal.channel_id,
          user_id: blockSignal.user_id,
        },
      },
      data: {
        is_banned: true,
        ban_expires_at: banExpiresAt,
      },
    });
    return banExpiresAt;
  }

  async unblockAUserWithinGroup(user_id: string, channel_id: string) {
    await this.prisma.prismaClient.channelMembership.update({
      where: {
        channel_id_user_id: {
          channel_id: channel_id,
          user_id: user_id,
        },
      },
      data: {
        is_banned: false,
        ban_expires_at: null,
      },
    });
  }

  async findChannelUserBanData(user_id: string, channel_id: string) {
    return await this.prisma.prismaClient.channelMembership.findFirst({
      where: {
        channel_id: channel_id,
        user_id: user_id,
      },
      select: {
        is_banned: true,
        ban_expires_at: true,
      },
    });
  }

  //User a mute a user from a group

  async muteAUserWithinGroup(muteSignal: {
    user_id: string;
    channel_id: string;
    muteDuration: number;
  }) {
    const muteExpiresAt = new Date(
      new Date().getTime() + muteSignal.muteDuration,
    );

    await this.prisma.prismaClient.channelMembership.update({
      where: {
        channel_id_user_id: {
          channel_id: muteSignal.channel_id,
          user_id: muteSignal.user_id,
        },
      },
      data: {
        is_muted: true,
        mute_expires_at: muteExpiresAt,
      },
    });
    return muteExpiresAt;
  }

  async unmuteAUserWithinGroup(user_id: string, channel_id: string) {
    await this.prisma.prismaClient.channelMembership.update({
      where: {
        channel_id_user_id: {
          channel_id: channel_id,
          user_id: user_id,
        },
      },
      data: {
        is_muted: false,
        mute_expires_at: null,
      },
    });
  }

  async findChannelUserMuteData(user_id: string, channel_id: string) {
    return await this.prisma.prismaClient.channelMembership.findFirst({
      where: {
        channel_id: channel_id,
        user_id: user_id,
      },
      select: {
        is_muted: true,
        mute_expires_at: true,
      },
    });
  }

  //
  async dmIsBanned(dm_id: string) {
    return await this.prisma.prismaClient.directMessaging.findUnique({
      where: {
        id: dm_id,
        status: 'BANNED',
      },
      select: {
        status: true,
        blocker_id: true,
      },
    });
  }

  async blockAUserWithDm(agentId: string, dm_id: string) {
    return await this.prisma.prismaClient.directMessaging.update({
      where: {
        id: dm_id,
      },
      data: {
        status: 'BANNED',
        blocker_id: agentId,
      },
    });
  }

  async unblockAUserWithDm(agentId: string, room_id: string) {
    const user = await this.prisma.prismaClient.directMessaging.findUnique({
      where: {
        id: room_id,
      },
      select: {
        blocker_id: true,
      },
    });
    if (agentId !== user.blocker_id) return null;
    return await this.prisma.prismaClient.directMessaging.update({
      where: {
        id: room_id,
      },
      data: {
        status: 'ALLOWED',
        blocker_id: null,
      },
    });
  }

  async findMembersCount(channel_id: string) {
    return await this.prisma.prismaClient.channelMembership.count({
      where: {
        channel_id: channel_id,
      },
    });
  }


  async leaveChannel(user_id: string, channel_id: string) {
    const memberCount = await this.findMembersCount(channel_id);

    try{
      await this.prisma.prismaClient.channelMembership.delete({
        where: {
          channel_id_user_id: {
            channel_id: channel_id,
            user_id: user_id,
          },
        },
      });
      if (memberCount === 1) {
        await this.deleteChannel(channel_id);
        return true;
      }
      return false;
    }catch(err){}
  }

  async findOwnersCount(channel_id: string) {
    return await this.prisma.prismaClient.channelMembership.count({
      where: {
        channel_id: channel_id,
        role: 'OWNER',
      },
    });
  }
  //this method espacially was created in case all the members of a channel left
  async deleteChannel(channel_id: string) {
    await this.prisma.prismaClient.message.deleteMany({
      where: {
        channel_id: channel_id,
      },
    });

    await this.prisma.prismaClient.channel.delete({
      where: {
        id: channel_id,
      },
    });
  }

  async createMessage(data: MessageDto) {
    return await this.prisma.prismaClient.message.create({ data });
  }

  async deleteMessage(message_id: string) {
    this.prisma.prismaClient.message.delete({
      where: {
        id: message_id,
      },
    });
  }

  async editMessage(message_id: string, content: string) {
    this.prisma.prismaClient.message.update({
      where: {
        id: message_id,
      },
      data: {
        content: content,
      },
    });
  }

  async findChannelAdmins(channel_id: string) {
    const admins = await this.prisma.prismaClient.channelMembership.findMany({
      where: {
        channel_id: channel_id,
        role: 'ADMIN',
      },
      select: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });
    return admins.map((admin) => admin.user.id);
  }

  async findChannelUsers(channel_id: string) {
    const users = await this.prisma.prismaClient.channelMembership.findMany({
      where: {
        channel_id: channel_id,
      },
      select: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });
    return users.map((user) => user.user.id);
  }

  async findChannelOwner(channel_id: string) {
    const owner = await this.prisma.prismaClient.channelMembership.findFirst({
      where: {
        channel_id: channel_id,
        role: 'OWNER',
      },
      select: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });
    return owner.user.id;
  }

  async upgradeToAdmin(user_id: string, channel_id: string) {
    await this.prisma.prismaClient.channelMembership.update({
      where: {
        channel_id_user_id: {
          channel_id: channel_id,
          user_id: user_id,
        },
      },
      data: {
        role: 'ADMIN',
      },
    });
  }

  async setGradeToUser(user_id: string, channel_id: string) {
    await this.prisma.prismaClient.channelMembership.update({
      where: {
        channel_id_user_id: {
          channel_id: channel_id,
          user_id: user_id,
        },
      },
      data: {
        role: 'USER',
      },
    });
  }

  async getMemeberShip(user_id: string, channel_id: string) {
    try {
      return await this.prisma.prismaClient.channelMembership.findUnique({
        where: {
          channel_id_user_id: {
            channel_id: channel_id,
            user_id: user_id,
          },
        },
      });
    } catch (err) {
      return null;
    }
  }

  async makeOwner(user_id: string, channel_id: string) {
    await this.prisma.prismaClient.channelMembership.update({
      where: {
        channel_id_user_id: {
          channel_id: channel_id,
          user_id: user_id,
        },
      },
      data: {
        role: 'OWNER',
      },
    });
  }

  async getChannelData(channel_id: string) {
    return await this.prisma.prismaClient.channel.findUnique({
      where: {
        id: channel_id,
      },
      select: {
        id: true,
        name: true,
        image: true,
        type: true,
      },
    });
  }
  async checkUserInDm(user_id: string, room_id: string) {
    return await this.prisma.prismaClient.directMessaging.findUnique({
      where: {
        OR: [{ user1_id: user_id }, { user2_id: user_id }],
        id: room_id,
      },
    });
  }

  //Authorizations ro see dm or channel
  async isUserInRoom(userId: string, roomId: string) {
    // Check if the user exists in the DM table
    const dmExists = await this.prisma.prismaClient.directMessaging.findFirst({
      where: {
        OR: [
          {
            user1_id: userId,
            user2_id: roomId,
          },
          {
            user1_id: roomId,
            user2_id: userId,
          },
        ],
      },
    });

    // Check if the user exists in the ChannelMembership table
    const membershipExists =
      await this.prisma.prismaClient.channelMembership.findFirst({
        where: {
          channel_id: roomId,
          user_id: userId,
        },
      });

    return {
      isInDMTable: Boolean(dmExists),
      isInMembershipTable: Boolean(membershipExists),
    };
  }

  async getDmMessagesCount (dm_id: string){
    return await this.prisma.prismaClient.message.count(
      {
        where:{
          dm_id:dm_id
        }
      }
    )
  }
}
