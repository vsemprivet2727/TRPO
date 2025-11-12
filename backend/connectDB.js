const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

mongoose.connect('mongodb://localhost:27017/trpo', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    year: Number
});

const Book = mongoose.model('Book', bookSchema);

app.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (error) {
        res.json([
            { _id: "1", title: "Война и мир", author: "Лев Толстой", year: 1869 },
            { _id: "2", title: "Преступление и наказание", author: "Федор Достоевский", year: 1866 },
            { _id: "3", title: "Мастер и Маргарита", author: "Михаил Булгаков", year: 1967 },
            { _id: "4", title: "1984", author: "Джордж Оруэлл", year: 1949 },
            { _id: "5", title: "Гарри Поттер и философский камень", author: "Дж. К. Роулинг", year: 1997 }
        ]);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});