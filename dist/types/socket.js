"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EGameEvent = exports.EChatEvent = exports.ESOCKET_NAMESPACE = void 0;
var ESOCKET_NAMESPACE;
(function (ESOCKET_NAMESPACE) {
    ESOCKET_NAMESPACE["chat"] = "/chat";
    ESOCKET_NAMESPACE["game"] = "/game";
})(ESOCKET_NAMESPACE || (exports.ESOCKET_NAMESPACE = ESOCKET_NAMESPACE = {}));
var EChatEvent;
(function (EChatEvent) {
    EChatEvent["JOIN"] = "join";
    EChatEvent["MESSAGE"] = "message";
    EChatEvent["MESSAGE_HISTORY"] = "message_history";
    EChatEvent["NEW_MESSAGE"] = "new_message";
})(EChatEvent || (exports.EChatEvent = EChatEvent = {}));
var EGameEvent;
(function (EGameEvent) {
    EGameEvent["UPDATE_ROUND"] = "update_round";
    EGameEvent["DURATION_STATE"] = "duration_state";
    EGameEvent["UPDATE_REMAIN_TIME"] = "update_remain_time";
    EGameEvent["IS_EXPIRED"] = "is_Expired";
    EGameEvent["WINNER"] = "winner";
    EGameEvent["GET_WAGER"] = "get_wager";
    EGameEvent["WAGER"] = "wager";
    EGameEvent["SAVE_HISTORY"] = "save_history";
    EGameEvent["UPDATE_TOTAL_AMOUNT"] = "update_total_amout";
})(EGameEvent || (exports.EGameEvent = EGameEvent = {}));
