import UserModel from '../models/UserModel';
import OrderModel from '../models/OrderModel';
import { getTier } from '../loyalty';

export async function awardPointsForOrder(orderId: string, userId: string, session?: any) {
  const order = await OrderModel.findById(orderId).session(session);
  if (!order || !order.isPaid || order.pointsAwarded) return;

  const pointsToEarn = Math.floor(order.totalPrice / 10);
  if (pointsToEarn <= 0) return;

  const user = await UserModel.findById(userId).session(session);
  if (!user) return;

  // Award points
  user.loyaltyPoints = (user.loyaltyPoints || 0) + pointsToEarn;
  
  // Add to history
  user.loyaltyHistory.push({
    type: 'earn',
    points: pointsToEarn,
    description: `Earned from Order #${orderId.substring(orderId.length - 6).toUpperCase()}`,
    date: new Date(),
    orderId: orderId,
  });

  // Update Tier
  user.loyaltyTier = getTier(user.loyaltyPoints);

  await user.save({ session });

  // Mark order as points awarded to prevent double awarding
  order.pointsAwarded = true;
  await order.save({ session });

  // Handle Referral Reward if this is the user's first paid order
  if (user.referredBy) {
    const paidOrdersCount = await OrderModel.countDocuments({
      user: userId,
      isPaid: true,
      _id: { $ne: orderId }
    }).session(session);

    if (paidOrdersCount === 0) {
      // Award credit to the referrer
      const referrer = await UserModel.findOne({ referralCode: user.referredBy }).session(session);
      if (referrer) {
        const rewardAmount = 500; // ₹500 referral bonus
        referrer.referralCredits = (referrer.referralCredits || 0) + rewardAmount;
        referrer.referralHistory.push({
          referredUserId: userId,
          referredUserEmail: user.email,
          reward: rewardAmount,
          date: new Date(),
          orderId: orderId,
        });
        await referrer.save({ session });
      }
    }
  }
}
