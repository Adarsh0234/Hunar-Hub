import pool from "../config/database.js";

export const getBusinessProfile = async (req, res) => {
    const ownerId = req.user.user_id;

    const result = await pool.query(
        `SELECT business_id, business_name, category_id, description, phone, address, created_at
     FROM business_profiles
     WHERE owner_id = $1`,
        [ownerId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            message: "Business profile not found"
        });
    }
    return res.status(200).json(result.rows[0]);
};

export const updateBusinessProfile = async (req, res) => {
    const ownerId = req.user.user_id;
    const {
        business_name,
        category_name,
        description,
        phone,
        address
    } = req.body;
    const categoryResult = await pool.query(
        "SELECT category_id FROM business_categories WHERE category_name = $1",
        [category_name]
    );

    if (categoryResult.rows.length === 0) {
        return res.status(404).json({
            message: "Category not found"
        });
    }

    const categoryId = categoryResult.rows[0].category_id;

    let result;
    if (req.file) {
        result = await pool.query(
            `UPDATE business_profiles
         SET business_name = $1, category_id = $2, description = $3, phone = $4, address = $5, logo_data = $6
         WHERE owner_id = $7`,
            [business_name, categoryId, description, phone, address, req.file.buffer, ownerId]
        );
    } else {
        result = await pool.query(
            `UPDATE business_profiles
         SET business_name = $1, category_id = $2, description = $3, phone = $4, address = $5
         WHERE owner_id = $6`,
            [business_name, categoryId, description, phone, address, ownerId]
        );
    }

    if (result.rowCount === 0) {
        return res.status(404).json({
            message: "Business profile not found"
        });
    }

    return res.status(200).json({
        message: "Business profile updated successfully"
    });
};

export const uploadBusinessLogo = async (req, res) => {
    const ownerId = req.user.user_id;
    if (!req.file) {
        return res.status(400).json({
            message: "No logo file provided"
        });
    }

    const result = await pool.query(
        `UPDATE business_profiles
         SET logo_data = $1
         WHERE owner_id = $2`,
        [req.file.buffer, ownerId]
    );

    if (result.rowCount === 0) {
        return res.status(404).json({
            message: "Business profile not found"
        });
    }

    return res.status(200).json({
        message: "Business logo updated successfully"
    });
};

export const getBusinessCategories = async (req, res) => {
    const result = await pool.query(
        "SELECT category_id, category_name FROM business_categories ORDER BY category_id"
    );
    return res.status(200).json(result.rows);
};

export const getBusinessLogo = async (req, res) => {
    const ownerId = req.user.user_id;

    const result = await pool.query(
        `SELECT logo_data
         FROM business_profiles
         WHERE owner_id = $1`,
        [ownerId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            message: "Business profile not found"
        });
    }

    if (!result.rows[0].logo_data) {
        return res.status(404).json({
            message: "Business logo not found"
        });
    }

    return res.status(200).json({
        logo: result.rows[0].logo_data.toString("base64")
    });
};