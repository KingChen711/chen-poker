export type CreateRoomParams = {
  userId: string
}

export type GetCurrentRoomParams = {
  userId: string
}

export type LeaveRoomParams = {
  userId: string
}

export type JoinRoomParams = {
  userId: string
  roomCode: string
}

export type StartGameParams = {
  roomId: string
}

export type CallBetParams = {
  roomId: string
  userId: string
}

export type CheckBetParams = {
  roomId: string
  userId: string
}

export type AllInBetParams = {
  roomId: string
  userId: string
}

export type FoldBetParams = {
  roomId: string
  userId: string
}

export type RaisePetParams = {
  roomId: string
  userId: string
  raiseValue: number
}

export type ShowDownFoldParams = {
  roomId: string
  lastFoldPlayer: string
}

export type CleanUpInGameRoomParams = {
  roomId: string
  userId: string
}
