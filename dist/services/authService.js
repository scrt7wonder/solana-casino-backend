"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const user_1 = __importDefault(require("../models/user"));
const refferal_1 = __importDefault(require("../models/refferal"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("../config/constants");
class AuthService {
    async auth(userData) {
        const { username, address, email, refferal } = userData;
        const saveData = {
            username,
            address,
            email,
            invite_link: `${address}_${username}`,
            refferal
        };
        if (refferal !== "") {
            let refferRes = await refferal_1.default.findOne({ refferal });
            if (refferRes) {
                await refferal_1.default.findOneAndUpdate({ refferal }, { $set: { count: refferRes.count + 1 } }, { new: true });
            }
            else {
                const refferUser = await user_1.default.findOne({ invite_link: refferal });
                if (refferUser) {
                    refferRes = new refferal_1.default({
                        refferal,
                        count: 1,
                        user_id: refferUser._id.toString(),
                    });
                    await refferRes.save();
                }
            }
        }
        // Create new user
        const user = new user_1.default(saveData);
        await user.save();
        // Create and return JWT
        const token = this.generateToken(user._id.toString());
        return { token, user };
    }
    async check(address) {
        const user = await user_1.default.findOne({ address });
        if (!user) {
            return false;
        }
        else {
            // Create and return JWT
            const token = this.generateToken(user._id.toString());
            return { token, user };
        }
    }
    generateToken(userId) {
        return jsonwebtoken_1.default.sign({ id: userId }, constants_1.JWT_SECRET, { expiresIn: '1h' });
    }
}
exports.AuthService = AuthService;
