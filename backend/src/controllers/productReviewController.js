import pool from "../config/database.js";

export const createProductReview = async (req, res) => {
    const customerId = req.user.user_id;
    const { product_id, rating, review } = req.body;

    if (req.user.account_type !== "Customer") {
        return res.status(403).json({
            message: "Only customers can review products"
        });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({
            message: "Rating must be between 1 and 5"
        });
    }

    const purchaseResult = await pool.query(
        `SELECT oi.order_item_id
         FROM order_items oi
         JOIN orders o
           ON oi.order_id = o.order_id
         WHERE o.customer_id = $1
         AND oi.product_id = $2
         AND o.order_status != 'Cancelled'`,
        [customerId, product_id]
    );

    if (purchaseResult.rows.length === 0) {
        return res.status(400).json({
            message: "You can review only products you purchased"
        });
    }

    try {
        await pool.query(
            `INSERT INTO product_reviews
             (customer_id, product_id, rating, review_text)
             VALUES ($1, $2, $3, $4)`,
            [customerId, product_id, rating, review]
        );
    } catch (error) {
        if (error.code === "23505") {
            return res.status(400).json({
                message: "You have already reviewed this product"
            });
        }

        throw error;
    }

    return res.status(201).json({
        message: "Product review added successfully"
    });
};

export const getProductReviews = async (req, res) => {
    const { productId } = req.params;

    const result = await pool.query(
        `SELECT pr.review_id AS product_review_id,
                pr.customer_id,
                u.full_name AS customer_name,
                pr.rating,
                pr.review_text AS review,
                pr.created_at
         FROM product_reviews pr
         JOIN users u
           ON pr.customer_id = u.user_id
         WHERE pr.product_id = $1
         ORDER BY pr.created_at DESC`,
        [productId]
    );

    return res.status(200).json(result.rows);
};