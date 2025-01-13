export const getReviewsByBoatId = async (db, boatId) => {
    const [rows] = await db.query(
      `SELECT review_text, cleanliness_rating, overall_rating, driver_rating, created_at
       FROM boat_reviews
       WHERE boat_id = ?`,
      [boatId]
    );
    return rows;
  };
