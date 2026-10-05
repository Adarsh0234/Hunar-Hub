import pool from "../config/database.js";

export const createService = async (req, res) => {
    const ownerId = req.user.user_id;

    if (req.user.account_type !== "Business User") {
        return res.status(403).json({
            message: "Only Business Users can create services"
        });
    }

    const {
        service_name,
        description,
        price
    } = req.body;

    const businessResult = await pool.query(
        `SELECT business_id
         FROM business_profiles
         WHERE owner_id = $1`,
        [ownerId]
    );

    if (businessResult.rows.length === 0) {
        return res.status(404).json({
            message: "Business profile not found"
        });
    }

    const businessId = businessResult.rows[0].business_id;

    await pool.query(
        `INSERT INTO services
         (business_id, service_name, description, price)
         VALUES ($1, $2, $3, $4)`,
        [businessId, service_name, description, price]
    );

    return res.status(201).json({
        message: "Service created successfully"
    });
};

export const getServices = async (req, res) => {
    const result = await pool.query(
        `SELECT s.service_id,
                s.business_id,
                s.service_name,
                s.description,
                s.price,
                s.created_at,
                bp.business_name
         FROM services s
         JOIN business_profiles bp
           ON s.business_id = bp.business_id
         ORDER BY s.created_at DESC`
    );

    return res.status(200).json(result.rows);
};

export const getBusinessServices = async (req, res) => {
    const { businessId } = req.params;

    const result = await pool.query(
        `SELECT service_id,
                business_id,
                service_name,
                description,
                price,
                created_at
         FROM services
         WHERE business_id = $1
         ORDER BY created_at DESC`,
        [businessId]
    );

    return res.status(200).json(result.rows);
};
export const updateService = async (req, res) => {
    const ownerId = req.user.user_id;
    const { serviceId } = req.params;

    const {
        service_name,
        description,
        price
    } = req.body;

    const businessResult = await pool.query(
        `SELECT business_id
         FROM business_profiles
         WHERE owner_id = $1`,
        [ownerId]
    );

    if (businessResult.rows.length === 0) {
        return res.status(404).json({
            message: "Business profile not found"
        });
    }

    const businessId = businessResult.rows[0].business_id;

    const result = await pool.query(
        `UPDATE services
         SET service_name = $1,
             description = $2,
             price = $3
         WHERE service_id = $4
         AND business_id = $5`,
        [service_name, description, price, serviceId, businessId]
    );

    if (result.rowCount === 0) {
        return res.status(404).json({
            message: "Service not found or does not belong to your business"
        });
    }

    return res.status(200).json({
        message: "Service updated successfully"
    });
};

export const deleteService = async (req, res) => {
    const ownerId = req.user.user_id;
    const { serviceId } = req.params;

    const businessResult = await pool.query(
        `SELECT business_id
         FROM business_profiles
         WHERE owner_id = $1`,
        [ownerId]
    );

    if (businessResult.rows.length === 0) {
        return res.status(404).json({
            message: "Business profile not found"
        });
    }

    const businessId = businessResult.rows[0].business_id;

    const result = await pool.query(
        `DELETE FROM services
         WHERE service_id = $1
         AND business_id = $2`,
        [serviceId, businessId]
    );

    if (result.rowCount === 0) {
        return res.status(404).json({
            message: "Service not found or does not belong to your business"
        });
    }

    return res.status(200).json({
        message: "Service deleted successfully"
    });
};

export const getMyServices = async (req, res) => {
    const ownerId = req.user.user_id;

    if (req.user.account_type !== "Business User") {
        return res.status(403).json({
            message: "Only Business Users can view their services"
        });
    }

    const result = await pool.query(
        `SELECT s.service_id,
                s.business_id,
                s.service_name,
                s.description,
                s.price,
                s.created_at
         FROM services s
         JOIN business_profiles bp
           ON s.business_id = bp.business_id
         WHERE bp.owner_id = $1
         ORDER BY s.created_at DESC`,
        [ownerId]
    );

    return res.status(200).json(result.rows);
};