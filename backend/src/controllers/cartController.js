import pool from "../config/database.js";

export const addToCart = async (req, res) => {
    const userId = req.user.user_id;

    if (req.user.account_type !== "Customer") {
        return res.status(403).json({
            message: "Only customers can add products to cart"
        });
    }
    const { product_id } = req.body;

    const productResult = await pool.query(
        "SELECT product_id, stock FROM products WHERE product_id = $1",
        [product_id]
    );

    if (productResult.rows.length === 0) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    if (productResult.rows[0].stock <= 0) {
        return res.status(400).json({
            message: "Product is out of stock"
        });
    }

    const cartResult = await pool.query(
        "SELECT cart_id FROM carts WHERE user_id = $1",
        [userId]
    );

    let cartId;

    if (cartResult.rows.length === 0) {
        const newCart = await pool.query(
            `INSERT INTO carts (user_id)
         VALUES ($1)
         RETURNING cart_id`,
            [userId]
        );

        cartId = newCart.rows[0].cart_id;
    } else {
        cartId = cartResult.rows[0].cart_id;
    }

    const cartItemResult = await pool.query(
        `SELECT cart_item_id, quantity
     FROM cart_items
     WHERE cart_id = $1 AND product_id = $2`,
        [cartId, product_id]
    );

    if (cartItemResult.rows.length > 0) {
        const quantity = cartItemResult.rows[0].quantity + 1;
        if (quantity > productResult.rows[0].stock) {
            return res.status(400).json({
                message: "Requested quantity exceeds available stock"
            });
        }

        await pool.query(
            `UPDATE cart_items
     SET quantity = $1
     WHERE cart_item_id = $2`,
            [quantity, cartItemResult.rows[0].cart_item_id]
        );

        return res.status(200).json({
            message: "Product quantity updated in cart"
        });
    }

    await pool.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity)
     VALUES ($1, $2, 1)`,
        [cartId, product_id]
    );

    return res.status(201).json({
        message: "Product added to cart"
    });


};

export const getMyCart = async (req, res) => {
    const userId = req.user.user_id;

    const result = await pool.query(
        `SELECT ci.cart_item_id, ci.product_id, ci.quantity,
                p.product_name, p.price, p.stock
         FROM carts c
         JOIN cart_items ci ON c.cart_id = ci.cart_id
         JOIN products p ON ci.product_id = p.product_id
         WHERE c.user_id = $1`,
        [userId]
    );

    return res.status(200).json(result.rows);
};

export const updateCartItem = async (req, res) => {
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.user_id;
    const result = await pool.query(
        `SELECT ci.cart_item_id, ci.product_id, p.stock
     FROM cart_items ci
     JOIN carts c ON ci.cart_id = c.cart_id
     JOIN products p ON ci.product_id = p.product_id
     WHERE ci.cart_item_id = $1 AND c.user_id = $2`,
        [cartItemId, userId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            message: "Cart item not found"
        });
    }

    if (quantity <= 0) {
        return res.status(400).json({
            message: "Quantity must be greater than 0"
        });
    }

    if (quantity > result.rows[0].stock) {
        return res.status(400).json({
            message: "Requested quantity exceeds available stock"
        });
    }

    await pool.query(
        `UPDATE cart_items
     SET quantity = $1
     WHERE cart_item_id = $2`,
        [quantity, cartItemId]
    );

    return res.status(200).json({
        message: "Cart quantity updated successfully"
    });


}

export const removeCartItem = async (req, res) => {
    const { cartItemId } = req.params;
    const userId = req.user.user_id;

    const result = await pool.query(
        `DELETE FROM cart_items
     WHERE cart_item_id = $1
     AND cart_id = (
         SELECT cart_id
         FROM carts
         WHERE user_id = $2
     )
     RETURNING cart_item_id`,
        [cartItemId, userId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            message: "Cart item not found"
        });
    }

    return res.status(200).json({
        message: "Cart item removed successfully"
    });


}

export const clearCart = async (req, res) => {
    const userId = req.user.user_id;

    if (req.user.account_type !== "Customer") {
        return res.status(403).json({
            message: "Only customers can clear their cart"
        });
    }

    const result = await pool.query(
        `DELETE FROM cart_items
         WHERE cart_id = (
             SELECT cart_id
             FROM carts
             WHERE user_id = $1
         )
         RETURNING cart_item_id`,
        [userId]
    );

    return res.status(200).json({
        message: "Cart cleared successfully",
        items_removed: result.rowCount
    });
};