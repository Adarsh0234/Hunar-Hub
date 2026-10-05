import pool from "../config/database.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "../services/emailService.js";
import jwt from "jsonwebtoken";

const otpStore = new Map();
const pendingRegistrations = new Map();


export const registerUser = async (req, res) => {
    const { full_name,
        email,
        phone,
        password,
        confirm_password,
        account_type,
        business_name,
        category_name,
        description,
        address } = req.body;

    if (!["Customer", "Business User"].includes(account_type)) {
        return res.status(400).json({
            message: "Invalid account type"
        });
    }

    if (account_type === "Business User" &&
        (!business_name || !category_name)) {
        return res.status(400).json({
            message: "Business details are required"
        });
    }

    let categoryId = null;

    if (account_type === "Business User") {
        const categoryResult = await pool.query(
            "SELECT category_id FROM business_categories WHERE category_name = $1",
            [category_name]
        );

        if (categoryResult.rows.length === 0) {
            return res.status(400).json({
                message: "Invalid business category"
            });
        }

        categoryId = categoryResult.rows[0].category_id;
    }


    if (password !== confirm_password) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    const result = await pool.query(
        "SELECT user_id FROM users WHERE email = $1",
        [email]
    );
    const result1 = await pool.query(
        "SELECT user_id FROM users WHERE phone = $1",
        [phone]
    )

    if (result.rows.length > 0 || result1.rows.length > 0) {
        return res.status(409).json({ message: "Email or Phone number already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // const user = await pool.query(
    //     `INSERT INTO users (full_name, email, phone, password_hash, account_type)
    //  VALUES ($1, $2, $3, $4, $5)
    //  RETURNING user_id`,
    //     [full_name, email, phone, hashedPassword, account_type]
    // );
    // const userId = user.rows[0].user_id;

    pendingRegistrations.set(email, {
        full_name,
        phone,
        password_hash: hashedPassword,
        account_type,
        business_name,
        category_id: categoryId,
        description,
        address
    });

    //generate OTP
    const otp = crypto.randomInt(100000, 1000000);
    console.log("Generated OTP is: ", otp);

    const otpHash = await bcrypt.hash(otp.toString(), 10);
    // const expiresAt = new Date(Date.now() + 60 * 1000);
    otpStore.set(email, {
        otpHash,
        expiresAt: Date.now() + 60 * 1000
    });

    await sendEmail(
        email,
        "HunarHub Email Verification",
        `Your OTP is ${otp}. It expires in 1 minute.`
    );

    return res.status(200).json({
        message: "OTP sent to your email. Please verify to complete registration."
    });
}

export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    const otpData = otpStore.get(email);

    if (!otpData) {
        return res.status(400).json({
            message: "OTP not found or already used"
        });
    }

    if (Date.now() > otpData.expiresAt) {
        otpStore.delete(email);
        pendingRegistrations.delete(email);

        return res.status(400).json({
            message: "OTP has expired"
        });
    }

    const isValid = await bcrypt.compare(
        otp.toString(),
        otpData.otpHash
    );
    if (!isValid) {
        return res.status(400).json({
            message: "Invalid OTP"
        });
    }


    const registrationData = pendingRegistrations.get(email);

    if (!registrationData) {
        return res.status(400).json({
            message: "No pending registration found. Please register again."
        });
    }
    const result = await pool.query(
        `INSERT INTO users (full_name, email, phone, password_hash, account_type, email_verified)
     VALUES ($1, $2, $3, $4, $5, TRUE)
     RETURNING user_id`,
        [
            registrationData.full_name,
            email,
            registrationData.phone,
            registrationData.password_hash,
            registrationData.account_type
        ]
    );
    if (registrationData.account_type === "Business User") {
        await pool.query(
            `INSERT INTO business_profiles
        (owner_id, category_id, business_name, business_email_verified, description, phone, address)
        VALUES ($1, $2, $3, TRUE, $4, $5, $6)`,
            [
                result.rows[0].user_id,
                registrationData.category_id,
                registrationData.business_name,
                registrationData.description,
                registrationData.phone,
                registrationData.address
            ]
        );
    }
    otpStore.delete(email);
    pendingRegistrations.delete(email);

    return res.status(201).json({
        message: "Registration completed successfully"
    });
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const result = await pool.query(
        "SELECT user_id, password_hash, email_verified, account_type FROM users WHERE email = $1",
        [email]
    );
    if (result.rows.length === 0) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }
    if (!result.rows[0].email_verified) {
        return res.status(403).json({
            message: "Please verify your email first"
        });
    }
    const isPasswordValid = await bcrypt.compare(
        password,
        result.rows[0].password_hash
    );

    if (!isPasswordValid) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    const token = jwt.sign(
        {
            user_id: result.rows[0].user_id,
            account_type: result.rows[0].account_type
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

    return res.status(200).json({
        message: "Login successful",
        token: token
    });

};