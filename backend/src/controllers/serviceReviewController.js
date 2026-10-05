import pool from "../config/database.js";

export const createServiceReview = async (req, res) => {
    const customerId = req.user.user_id;
    const { service_id, rating, review } = req.body;

    if (req.user.account_type !== "Customer") {
        return res.status(403).json({
            message: "Only customers can review services"
        });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({
            message: "Rating must be between 1 and 5"
        });
    }

    const requestResult = await pool.query(
        `SELECT request_id
         FROM service_requests
         WHERE customer_id = $1
         AND service_id = $2
         AND request_status = 'Completed'`,
        [customerId, service_id]
    );

    if (requestResult.rows.length === 0) {
        return res.status(400).json({
            message: "You can review a service only after completion"
        });
    }

    await pool.query(
        `INSERT INTO service_reviews
         (customer_id, service_id, rating, review_text)
         VALUES ($1, $2, $3, $4)`,
        [customerId, service_id, rating, review]
    );

    return res.status(201).json({
        message: "Service review added successfully"
    });
};

export const getServiceReviews = async (req, res) => {
    const { serviceId } = req.params;

    const result = await pool.query(
        `SELECT sr.review_id AS service_review_id,
                sr.customer_id,
                u.full_name AS customer_name,
                sr.rating,
                sr.review_text AS review,
                sr.created_at
         FROM service_reviews sr
         JOIN users u
           ON sr.customer_id = u.user_id
         WHERE sr.service_id = $1
         ORDER BY sr.created_at DESC`,
        [serviceId]
    );

    return res.status(200).json(result.rows);
};
