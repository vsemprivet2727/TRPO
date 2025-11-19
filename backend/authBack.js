import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";

const router = express.Router();

// Регистрация
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Все поля обязательны" });
        }

        // Проверка существующего пользователя
        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: "Email уже используется" });
        }

        // Хэширование пароля
        const hash = await bcrypt.hash(password, 10);

        // Создание пользователя
        const user = await User.create({
            username,
            email,
            password: hash
        });

        res.json({ message: "Успешная регистрация!", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

export default router;
