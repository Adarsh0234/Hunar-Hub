import pool from "../config/database.js";

export const getMyProfile = async (req, res) => {
    const result = await pool.query(
        "SELECT user_id, full_name, email, phone, account_type, email_verified, created_at FROM users WHERE user_id = $1",
        [req.user.user_id]
    );

    return res.status(200).json(result.rows[0]);
};