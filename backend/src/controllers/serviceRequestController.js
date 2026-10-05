import pool from "../config/database.js";

export const createServiceRequest = async (req, res) => {
    const customerId = req.user.user_id;

    if (req.user.account_type !== "Customer") {
        return res.status(403).json({
            message: "Only customers can request services"
        });
    }

    const { service_id, scheduled_at } = req.body;

    const serviceResult = await pool.query(
        `SELECT service_id, business_id
         FROM services
         WHERE service_id = $1`,
        [service_id]
    );

    if (serviceResult.rows.length === 0) {
        return res.status(404).json({
            message: "Service not found"
        });
    }

    const businessId = serviceResult.rows[0].business_id;

    await pool.query(
        `INSERT INTO service_requests
         (customer_id, business_id, service_id, scheduled_at, request_status)
         VALUES ($1, $2, $3, COALESCE($4, CURRENT_TIMESTAMP), 'Pending')`,
        [customerId, businessId, service_id, scheduled_at || null]
    );

    return res.status(201).json({
        message: "Service requested successfully"
    });
};

export const getMyServiceRequests = async (req, res) => {
    const customerId = req.user.user_id;

    const result = await pool.query(
        `SELECT sr.request_id AS service_request_id,
                sr.service_id,
                sr.business_id,
                sr.request_status AS status,
                sr.created_at,
                s.service_name,
                s.price,
                bp.business_name
         FROM service_requests sr
         JOIN services s
           ON sr.service_id = s.service_id
         JOIN business_profiles bp
           ON sr.business_id = bp.business_id
         WHERE sr.customer_id = $1
         ORDER BY sr.created_at DESC`,
        [customerId]
    );

    return res.status(200).json(result.rows);
};

export const getBusinessServiceRequests = async (req, res) => {
    const ownerId = req.user.user_id;

    if (req.user.account_type !== "Business User") {
        return res.status(403).json({
            message: "Only Business Users can view service requests"
        });
    }

    const result = await pool.query(
        `SELECT sr.request_id AS service_request_id,
                sr.customer_id,
                sr.service_id,
                sr.request_status AS status,
                sr.created_at,
                s.service_name,
                s.price,
                u.full_name AS customer_name
         FROM service_requests sr
         JOIN business_profiles bp
           ON sr.business_id = bp.business_id
         JOIN services s
           ON sr.service_id = s.service_id
         JOIN users u
           ON sr.customer_id = u.user_id
         WHERE bp.owner_id = $1
         ORDER BY sr.created_at DESC`,
        [ownerId]
    );

    return res.status(200).json(result.rows);
};

export const updateServiceRequestStatus = async (req, res) => {
    const ownerId = req.user.user_id;
    const { requestId } = req.params;
    const { status } = req.body;

    if (req.user.account_type !== "Business User") {
        return res.status(403).json({
            message: "Only Business Users can update service requests"
        });
    }

    if (!["Accepted", "Rejected"].includes(status)) {
        return res.status(400).json({
            message: "Invalid service request status"
        });
    }

    const result = await pool.query(
        `UPDATE service_requests sr
         SET request_status = $1
         FROM business_profiles bp
         WHERE sr.request_id = $2
         AND sr.business_id = bp.business_id
         AND bp.owner_id = $3
         AND sr.request_status = 'Pending'
         RETURNING sr.request_id AS service_request_id, sr.request_status AS status`,
        [status, requestId, ownerId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            message: "Service request not found or cannot be updated"
        });
    }

    return res.status(200).json({
        message: "Service request status updated successfully",
        request: result.rows[0]
    });
};

export const cancelServiceRequest = async (req, res) => {
    const customerId = req.user.user_id;
    const { requestId } = req.params;

    const result = await pool.query(
        `UPDATE service_requests
         SET request_status = 'Cancelled'
         WHERE request_id = $1
         AND customer_id = $2
         AND request_status = 'Pending'
         RETURNING request_id AS service_request_id, request_status AS status`,
        [requestId, customerId]
    );

    if (result.rows.length === 0) {
        return res.status(400).json({
            message: "Service request cannot be cancelled"
        });
    }

    return res.status(200).json({
        message: "Service request cancelled successfully",
        request: result.rows[0]
    });
};

export const completeServiceRequest = async (req, res) => {
    const ownerId = req.user.user_id;
    const { requestId } = req.params;

    const result = await pool.query(
        `UPDATE service_requests sr
         SET request_status = 'Completed'
         FROM business_profiles bp
         WHERE sr.request_id = $1
         AND sr.business_id = bp.business_id
         AND bp.owner_id = $2
         AND sr.request_status = 'Accepted'
         RETURNING sr.request_id AS service_request_id, sr.request_status AS status`,
        [requestId, ownerId]
    );

    if (result.rows.length === 0) {
        return res.status(400).json({
            message: "Service request cannot be completed"
        });
    }

    return res.status(200).json({
        message: "Service request completed successfully",
        request: result.rows[0]
    });
};