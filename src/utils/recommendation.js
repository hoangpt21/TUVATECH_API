import { reviewModel } from "../models/reviewModel";
// Tính cosine similarity
function cosineSimilarity(a, b) {
    const common = Object.keys(a).filter(k => b[k]);
    if (common.length === 0) return 0;
    let dot = 0, magA = 0, magB = 0;
    for (const k of common) dot += a[k] * b[k];
    for (const k in a) magA += a[k] * a[k];
    for (const k in b) magB += b[k] * b[k];
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// Lấy toàn bộ đánh giá người dùng
async function getUserRatings() {
    const rows = await reviewModel.list_reviews_by_conditions(
        ['approved'],
        ['review_id','user_id', 'product_id', 'rating'],
        [{ name: 'moderation_status' }],
    );

    const ratings = {};

    for (const row of rows) {
        const userId = row.user_id;
        const productId = row.product_id;
        const rating = row.rating;
        if (!ratings[userId]) ratings[userId] = {};
        if (!ratings[userId][productId]) {
            ratings[userId][productId] = { total: 0, count: 0 };
        }
        ratings[userId][productId].total += rating;
        ratings[userId][productId].count += 1;
    }

    // Tính trung bình
    for (const userId in ratings) {
        for (const productId in ratings[userId]) {
            const { total, count } = ratings[userId][productId];
            ratings[userId][productId] = total / count;
        }
    }

    return ratings;
}


// Đề xuất sản phẩm cho 1 user
export const recommendForUser = async (userId) => {
  // rows ở đây thực ra là ratings
  const ratings = await getUserRatings();

  if (!ratings[userId]) return [];

  const target = ratings[userId];

  const sims = Object.entries(ratings)
    .filter(([id]) => +id !== +userId)
    .map(([otherId, otherRatings]) => {
      const sim = cosineSimilarity(target, otherRatings);
      return { userId: otherId, sim };
    })
    .filter(x => x.sim > 0);

  const scores = {};
  const simSums = {};

  for (const { userId: otherId, sim } of sims) {
    for (const [productId, rating] of Object.entries(ratings[otherId])) {
      if (!target[productId]) {
        scores[productId] = (scores[productId] || 0) + sim * rating;
        simSums[productId] = (simSums[productId] || 0) + sim;
      }
    }
  }

  const normalizedScores = Object.entries(scores).map(([productId, score]) => ({
    productId: +productId,
    score: score / simSums[productId]
  }));

  return normalizedScores
    .sort((a, b) => b.score - a.score)
    .map(item => item.productId);
};

  
