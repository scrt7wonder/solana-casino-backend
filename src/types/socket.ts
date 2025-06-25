import { IHistory } from "./history";

export enum ESOCKET_NAMESPACE {
    chat = '/chat',
    game = '/game',
}

export enum EChatEvent {
    JOIN = 'join',
    MESSAGE = 'message',
    MESSAGE_HISTORY = 'message_history',
    NEW_MESSAGE = 'new_message'
}

export enum EGameEvent {
    UPDATE_ROUND = 'update_round',
    DURATION_STATE = 'duration_state',
    UPDATE_REMAIN_TIME = 'update_remain_time',
    IS_EXPIRED = 'is_Expired',
    WINNER = 'winner',
    GET_WAGER = 'get_wager',
    WAGER = 'wager',
    SAVE_HISTORY = 'save_history',
    UPDATE_TOTAL_AMOUNT = 'update_total_amout'
}

interface IChatItem {
    user: string;
    content: string;
    avatar: string;
    time: string;
}

export interface IChatClientToServerEvents {
    [EChatEvent.JOIN]: (id: string) => void;
    [EChatEvent.MESSAGE]: ({ content, sender }: {
        content: string;
        sender: string
    }) => void;
}

export interface IChatServerToClientEvents {
    [EChatEvent.MESSAGE_HISTORY]: (messages: IChatItem[]) => void;
    [EChatEvent.NEW_MESSAGE]: (message: IChatItem) => void;
}

export interface IGameClientToServerEvents {
    [EGameEvent.SAVE_HISTORY]: (history: IHistory) => void;
    [EGameEvent.GET_WAGER]: (user_id: string) => void;
}

export interface IGameServerToClientEvents {
    [EGameEvent.DURATION_STATE]: (state: boolean) => void;
    [EGameEvent.UPDATE_ROUND]: (messages: number) => void;
    [EGameEvent.WINNER]: (message: string) => void;
    [EGameEvent.UPDATE_TOTAL_AMOUNT]: (data: number) => void;
    [EGameEvent.UPDATE_REMAIN_TIME]: (time: number) => void;
    [EGameEvent.WAGER]: (wager: number) => void;
}