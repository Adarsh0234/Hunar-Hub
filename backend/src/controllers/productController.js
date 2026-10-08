import pool from "../config/database.js";

export const createProduct = async (req, res) => {
    const ownerId = req.user.user_id;
    const result = await pool.query(
        "SELECT business_id FROM business_profiles WHERE owner_id = $1",
        [ownerId]
    );
    if (result.rows.length === 0) {
        return res.status(404).json({
            message: "Business profile not found"
        });
    }
    const {
        product_name,
        description,
        price,
        stock
    } = req.body;

    const imageData = req.file ? req.file.buffer : null;
    const businessId = result.rows[0].business_id;

    await pool.query(
        `INSERT INTO products
     (business_id, product_name, description, price, stock, image_data)
     VALUES ($1, $2, $3, $4, $5, $6)`,
        [businessId, product_name, description, price, stock, imageData]
    );
    return res.status(201).json({
        message: "Product created successfully"
    });
};

export const getProducts = async (req, res) => {
    const result = await pool.query(
        "SELECT * FROM products ORDER BY created_at DESC"
    );
    return res.status(200).json(result.rows);
};

export const getProductsByCategory = async (req, res) => {
    const { categoryId } = req.params;

    const result = await pool.query(
        `SELECT p.*
         FROM products p
         JOIN business_profiles bp
           ON p.business_id = bp.business_id
         WHERE bp.category_id = $1
         ORDER BY p.created_at DESC`,
        [categoryId]
    );

    return res.status(200).json(result.rows);
};

export const getBusinessProducts = async (req, res) => {
    const { businessId } = req.params;
    const result = await pool.query(
        `SELECT * FROM products
     WHERE business_id = $1
     ORDER BY created_at DESC`,
        [businessId]
    );
    return res.status(200).json(result.rows);
};

export const updateProduct = async (req, res) => {
    const { productId } = req.params;
    const ownerId = req.user.user_id;
    const businessResult = await pool.query(
        "SELECT business_id FROM business_profiles WHERE owner_id = $1",
        [ownerId]
    );
    if (businessResult.rows.length === 0) {
        return res.status(404).json({
            message: "Business profile not found"
        });
    }
    const {
        product_name,
        description,
        price,
        stock
    } = req.body || {};

    const imageData = req.file ? req.file.buffer : null;

    const businessId = businessResult.rows[0].business_id;
    // const result = await pool.query(
    //     `UPDATE products
    //  SET product_name = $1, description = $2, price = $3, stock = $4
    //  WHERE product_id = $5 AND business_id = $6`,
    //     [product_name, description, price, stock, productId, businessId]
    // );

    const fields = [];
    const values = [];
    if (product_name !== undefined) {
        fields.push(`product_name = $${values.length + 1}`);
        values.push(product_name);
    }

    if (description !== undefined) {
        fields.push(`description = $${values.length + 1}`);
        values.push(description);
    }
    if (price !== undefined) {
        fields.push(`price = $${values.length + 1}`);
        values.push(price);
    }
    if (stock !== undefined) {
        fields.push(`stock = $${values.length + 1}`);
        values.push(stock);
    }

    if (imageData) {
        fields.push(`image_data = $${values.length + 1}`);
        values.push(imageData);
    }

    if (fields.length === 0) {
        return res.status(400).json({
            message: "No fields provided for update"
        });
    }
    values.push(productId, businessId);

    const result = await pool.query(
        `UPDATE products
     SET ${fields.join(", ")}
     WHERE product_id = $${values.length - 1}
     AND business_id = $${values.length}`,
        values
    );


    if (result.rowCount === 0) {
        return res.status(404).json({
            message: "Product not found or does not belong to your business"
        });
    }
    return res.status(200).json({
        message: "Product updated successfully"
    });
};

export const deleteProduct = async (req, res) => {
    const { productId } = req.params;
    const ownerId = req.user.user_id;

    const businessResult = await pool.query(
        "SELECT business_id FROM business_profiles WHERE owner_id = $1",
        [ownerId]
    );

    if (businessResult.rows.length === 0) {
        return res.status(404).json({
            message: "Business profile not found"
        });
    }

    const businessId = businessResult.rows[0].business_id;
    const result = await pool.query(
        `DELETE FROM products
         WHERE product_id = $1 AND business_id = $2`,
        [productId, businessId]
    );

    if (result.rowCount === 0) {
        return res.status(404).json({
            message: "Product not found or does not belong to your business"
        });
    }
    return res.status(200).json({
        message: "Product deleted successfully"
    });
}

export const getMyProducts = async (req, res) => {
    const ownerId = req.user.user_id;

    if (req.user.account_type !== "Business User") {
        return res.status(403).json({
            message: "Only Business Users can view their products"
        });
    }

    const result = await pool.query(
        `SELECT p.product_id,
                p.business_id,
                p.product_name,
                p.description,
                p.price,
                p.stock,
                p.created_at
         FROM products p
         JOIN business_profiles bp
           ON p.business_id = bp.business_id
         WHERE bp.owner_id = $1
         ORDER BY p.created_at DESC`,
        [ownerId]
    );

    return res.status(200).json(result.rows);
};
export const getProductImage = async (req, res) => {
    const { productId } = req.params;

    const result = await pool.query(
        `SELECT image_data
         FROM products
         WHERE product_id = $1`,
        [productId]
    );

    if (result.rows.length === 0 || !result.rows[0].image_data) {
        return res.status(404).json({ message: "Product image not found" });
    }

    res.set("Content-Type", "image/jpeg");
    res.send(result.rows[0].image_data);
};