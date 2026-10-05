import pool from "../config/database.js";

export const createOrder = async (req, res) => {
    const customerId = req.user.user_id;

    if (req.user.account_type !== "Customer") {
        return res.status(403).json({
            message: "Only customers can place orders"
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const cartResult = await client.query(
            `SELECT c.cart_id
             FROM carts c
             WHERE c.user_id = $1`,
            [customerId]
        );

        if (cartResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Cart not found"
            });
        }

        const cartId = cartResult.rows[0].cart_id;

        const itemsResult = await client.query(
            `SELECT ci.product_id,
                    ci.quantity,
                    p.business_id,
                    p.price,
                    p.stock
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.product_id
             WHERE ci.cart_id = $1
             FOR UPDATE`,
            [cartId]
        );

        if (itemsResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        for (const item of itemsResult.rows) {
            if (item.quantity > item.stock) {
                await client.query("ROLLBACK");

                return res.status(400).json({
                    message: `Insufficient stock for product ${item.product_id}`
                });
            }
        }

        const businessGroups = {};

        for (const item of itemsResult.rows) {
            if (!businessGroups[item.business_id]) {
                businessGroups[item.business_id] = [];
            }

            businessGroups[item.business_id].push(item);
        }

        const createdOrders = [];

        for (const businessId in businessGroups) {
            const businessItems = businessGroups[businessId];

            let totalAmount = 0;

            for (const item of businessItems) {
                totalAmount += Number(item.price) * item.quantity;
            }

            const orderResult = await client.query(
                `INSERT INTO orders
                 (customer_id, business_id, total_amount, order_status, payment_status)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING order_id`,
                [
                    customerId,
                    businessId,
                    totalAmount,
                    "Pending",
                    "Pending"
                ]
            );

            const orderId = orderResult.rows[0].order_id;

            for (const item of businessItems) {
                await client.query(
                    `INSERT INTO order_items
                     (order_id, product_id, quantity, unit_price)
                     VALUES ($1, $2, $3, $4)`,
                    [
                        orderId,
                        item.product_id,
                        item.quantity,
                        item.price
                    ]
                );

                await client.query(
                    `UPDATE products
                     SET stock = stock - $1
                     WHERE product_id = $2`,
                    [item.quantity, item.product_id]
                );
            }

            createdOrders.push({
                order_id: orderId,
                business_id: Number(businessId),
                total_amount: totalAmount
            });
        }

        await client.query(
            `DELETE FROM cart_items
             WHERE cart_id = $1`,
            [cartId]
        );

        await client.query("COMMIT");

        const totalAmount = createdOrders.reduce(
            (total, order) => total + order.total_amount,
            0
        );

        return res.status(201).json({
            message: "Order placed successfully",
            orders: createdOrders,
            total_amount: totalAmount
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error(error);

        return res.status(500).json({
            message: "Failed to place order"
        });

    } finally {
        client.release();
    }
};
export const getMyOrders = async (req, res) => {
    const customerId = req.user.user_id;

    const result = await pool.query(
        `SELECT order_id, business_id, total_amount,
                order_status, payment_status, created_at
         FROM orders
         WHERE customer_id = $1
         ORDER BY created_at DESC`,
        [customerId]
    );

    return res.status(200).json(result.rows);
};

export const getOrderDetails = async (req, res) => {
    const customerId = req.user.user_id;
    const { orderId } = req.params;

    const result = await pool.query(
        `SELECT o.order_id,
                o.business_id,
                o.total_amount,
                o.order_status,
                o.payment_status,
                o.created_at,
                oi.product_id,
                oi.quantity,
                oi.unit_price,
                p.product_name
         FROM orders o
         JOIN order_items oi ON o.order_id = oi.order_id
         JOIN products p ON oi.product_id = p.product_id
         WHERE o.order_id = $1
         AND o.customer_id = $2`,
        [orderId, customerId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            message: "Order not found"
        });
    }

    return res.status(200).json({
        order_id: result.rows[0].order_id,
        business_id: result.rows[0].business_id,
        total_amount: result.rows[0].total_amount,
        order_status: result.rows[0].order_status,
        payment_status: result.rows[0].payment_status,
        created_at: result.rows[0].created_at,
        items: result.rows.map(row => ({
            product_id: row.product_id,
            product_name: row.product_name,
            quantity: row.quantity,
            unit_price: row.unit_price
        }))
    });
};

export const getBusinessOrders = async (req, res) => {
    const ownerId = req.user.user_id;

    const result = await pool.query(
        `SELECT o.order_id,
                o.customer_id,
                o.total_amount,
                o.order_status,
                o.payment_status,
                o.created_at
         FROM orders o
         JOIN business_profiles bp
           ON o.business_id = bp.business_id
         WHERE bp.owner_id = $1
         ORDER BY o.created_at DESC`,
        [ownerId]
    );

    return res.status(200).json(result.rows);
};

export const getBusinessOrderDetails = async (req, res) => {
    const ownerId = req.user.user_id;
    const { orderId } = req.params;

    const result = await pool.query(
        `SELECT o.order_id,
                o.customer_id,
                o.total_amount,
                o.order_status,
                o.payment_status,
                o.created_at,
                oi.product_id,
                oi.quantity,
                oi.unit_price,
                p.product_name
         FROM orders o
         JOIN business_profiles bp
           ON o.business_id = bp.business_id
         JOIN order_items oi
           ON o.order_id = oi.order_id
         JOIN products p
           ON oi.product_id = p.product_id
         WHERE o.order_id = $1
         AND bp.owner_id = $2`,
        [orderId, ownerId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            message: "Order not found"
        });
    }

    return res.status(200).json({
        order_id: result.rows[0].order_id,
        customer_id: result.rows[0].customer_id,
        total_amount: result.rows[0].total_amount,
        order_status: result.rows[0].order_status,
        payment_status: result.rows[0].payment_status,
        created_at: result.rows[0].created_at,
        items: result.rows.map(row => ({
            product_id: row.product_id,
            product_name: row.product_name,
            quantity: row.quantity,
            unit_price: row.unit_price
        }))
    });
};

export const updateOrderStatus = async (req, res) => {
    const ownerId = req.user.user_id;
    const { orderId } = req.params;
    const { order_status } = req.body;

    const allowedStatuses = [
        "Confirmed",
        "Shipped",
        "Delivered",
        "Cancelled"
    ];

    if (!allowedStatuses.includes(order_status)) {
        return res.status(400).json({
            message: "Invalid order status"
        });
    }

    const result = await pool.query(
        `UPDATE orders o
         SET order_status = $1
         FROM business_profiles bp
         WHERE o.order_id = $2
         AND o.business_id = bp.business_id
         AND bp.owner_id = $3
         RETURNING o.order_id, o.order_status`,
        [order_status, orderId, ownerId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            message: "Order not found"
        });
    }

    return res.status(200).json({
        message: "Order status updated successfully",
        order: result.rows[0]
    });
};

export const cancelOrder = async (req, res) => {
    const customerId = req.user.user_id;
    const { orderId } = req.params;

    const result = await pool.query(
        `UPDATE orders
         SET order_status = 'Cancelled'
         WHERE order_id = $1
         AND customer_id = $2
         AND order_status = 'Pending'
         RETURNING order_id, order_status`,
        [orderId, customerId]
    );

    if (result.rows.length === 0) {
        return res.status(400).json({
            message: "Order cannot be cancelled"
        });
    }

    return res.status(200).json({
        message: "Order cancelled successfully",
        order: result.rows[0]
    });
};