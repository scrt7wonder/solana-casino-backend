import Referral from "../models/referral";

export class ReferralService {
    public async checkAffiliate(referral: string): Promise<boolean> {
        const reffer = await Referral.findOne({ referral });

        if (reffer) {
            if (reffer.affiliate > 100 * reffer.count) {
                return true;
            } else return false
        } else {
            return false;
        }
    }

    public async updateAffiliate(referral: string, amount: number, count: number): Promise<boolean> {
        const refferRes = await Referral.findOne({ referral });
        const reffer = await Referral.findOneAndUpdate(
            { referral },
            { $set: { count : refferRes!.count + count, affiliate: refferRes!.affiliate + amount } },
            { new: true }
        )
        if (reffer) return true
        else return false
    }
}