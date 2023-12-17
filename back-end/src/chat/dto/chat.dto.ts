export interface MessageDto {
  user_id: string;
  dm_id?: string;
  channel_id?: string;
  content: string;
  createdAt?: Date;
  is_read?: boolean;
}

export interface channelDto {
  type: "PUBLIC" | "PRIVATE" | "PROTECTED";
  name: string;
  image: string;
  password?: string;
}


export  interface channelCreateDto {
  channelName: string;
  imageSrc: string;
  channelType: "PUBLIC" | "PRIVATE" | "PROTECTED";
  invitedUsers: string[];
  password?: string;
}
export interface dmDto {
  user1_id: string;
  user2_id: string;
  status: "ALLOWED" | "BANNED";
}

export interface channelMembershipDto {
  channel_id: string;
  user_id: string;
  role: "OWNER" | "ADMIN" | "USER";
  last_visit?: Date;
  banned_at?: string;
}

export interface channelReqDto {
  channel_id: string;
  type: "PUBLIC" | "PRIVATE" | "PROTECTED"; 
  password: string;
}

export interface banManageSignalDto {
  user_id: string;
  banner_id: string;
  type: "BAN" | "UNBAN";
  dm_id?: string;
  channel_id?: string;
  created_at?: Date;
}

export interface kickSignalDto {
  target_username: string;
  channel_id: string;
}
export interface setOwnerSignalDto {
  targeted_username: string;
  channel_id: string;
}


export interface UserBanMuteSignalDto {
  target_username: string;
  channel_id: string;
  actionDuration: number;
}