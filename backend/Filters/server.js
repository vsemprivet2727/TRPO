import express from "express";
import mongoose from "mongoose";
import Book from "./models/Book.js";
import User from "./models/User.js"
import cors from 'cors';



const app = express();

app.use(cors()); // разрешает все источники
app.use(express.json());
app.use(express.static('public'));

mongoose.connect("mongodb://localhost:27017/trpo")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

app.delete("/api/books/:id", async (req, res) => {
  try {
    const bookId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        return res.status(400).json({ message: "Некорректный формат ID книги." });
    }
    const bookObjectId = new mongoose.Types.ObjectId(bookId);

    const deletedBook = await Book.findByIdAndDelete(bookId);

    if (!deletedBook) {
        return res.status(404).json({ message: "Книга с указанным ID не найдена." });
    }

    await User.updateMany(
        { "borrowedBooks.bookId": bookObjectId },
        { $pull: { borrowedBooks: { bookId: bookObjectId } } } 
        //Все пользователи у которых была эта книга очищаются от "висячей ссылки".
    );

    res.status(200).json({ 
        message: "Книга успешно удалена", 
        deletedBookId: bookId 
    });

  } catch (error) {
    console.error("Ошибка при удалении книги:", error);
    res.status(500).json({ message: "Ошибка сервера при удалении", error: error.message });
  }
});
  
app.post("/api/books", async (req, res) => {
  try {
    // Получаем данные, которые пришли с фронтенда
    const { 
      title, author, publishDate, publisher, 
      genre, pages, isbn, language, inStock 
    } = req.body;

    // Создаем новый документ на основе Модели
    const newBook = new Book({
      title,
      author,
      publishDate,
      publisher,
      genre: Array.isArray(genre) ? genre : [genre], 
      pages,
      isbn,
      language,
      inStock
    });

    // Сохраняем в базу данных
    const savedBook = await newBook.save();

    // Отправляем ответ клиенту, что все прошло успешно
    res.status(201).json({ message: "Книга успешно добавлена!", book: savedBook });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при сохранении", error });
  }
});

app.get("/api/books", async (req, res) => {
    try {
    const { author, publisher, year, inStock, genre } = req.query;
    const filter = {};

    if (genre ) filter.genre = { $in: [genre] };
    if (author) filter.author = new RegExp(author, "i");
    if (publisher) filter.publisher = new RegExp(publisher, "i");

    if (year) {
      const start = new Date(`${year}-01-01`);
      const end   = new Date(`${year}-12-31`);
      filter.publishDate = { $gte: start, $lte: end };
    }

    if (inStock === "true") filter.inStock = true;

    const books = await Book.find(filter);
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const {username, email} = req.query;
    const filter = {};

    if (username) {
        filter.username = { $regex: new RegExp(username, 'i') };
    }
    if (email) {
        filter.email = { $regex: new RegExp(email, 'i') };
    }

    const users = await User.find(filter).populate({
    path: 'borrowedBooks.bookId',
    select: 'title author'
    });

    res.json(users);
  } catch (err) {
    console.error("Ошибка при получении пользователей:", err);
    res.status(500).json({ error: "Ошибка сервера при получении пользователей: " + err.message });
  }
});

// Регистрация
app.post("/api/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        
        if (existingUser) {
            return res.status(400).json({ message: "Логин или Email уже заняты" });
        }

        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).json({ message: "Пользователь создан!" });
    } catch (err) {
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Вход
app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        // Если ты НЕ используешь bcrypt (шифрование), поиск выглядит так:
        const user = await User.findOne({ username: username, password: password });

        if (user) {
            res.json({ username: user.username });
        } else {
            res.status(401).json({ message: "Логин или пароль неверны" });
        }
    } catch (err) {
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

app.listen(3000, () => console.log("Server started on port 3000"));
