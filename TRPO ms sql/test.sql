USE TestDB;
GO

IF OBJECT_ID('BookCopies', 'U') IS NOT NULL DROP TABLE BookCopies;
IF OBJECT_ID('Readers', 'U') IS NOT NULL DROP TABLE Readers;
IF OBJECT_ID('Books', 'U') IS NOT NULL DROP TABLE Books;
GO

CREATE TABLE Books (
    BookID INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Author NVARCHAR(100) NOT NULL,
    Publisher NVARCHAR(100),
    YearPublished INT CHECK (YearPublished BETWEEN 1000 AND YEAR(GETDATE())),
    ISBN NVARCHAR(20) UNIQUE,
    IsRare BIT DEFAULT 0,
    CreatedDate DATETIME2 DEFAULT GETDATE(),
    ModifiedDate DATETIME2 DEFAULT GETDATE()
);
GO

CREATE TABLE Readers (
    ReaderID INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) CHECK (Email LIKE '%@%.%'),
    Phone NVARCHAR(20),
    RegistrationDate DATETIME2 DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1
);
GO

CREATE TABLE BookCopies (
    CopyID INT IDENTITY(1,1) PRIMARY KEY,
    BookID INT NOT NULL FOREIGN KEY REFERENCES Books(BookID) ON DELETE CASCADE,
    CopyNumber VARCHAR(20) NOT NULL,
    Condition NVARCHAR(50) DEFAULT 'Хорошее' CHECK (Condition IN ('Отличное', 'Хорошее', 'Удовлетворительное', 'Плохое')),
    IsAvailable BIT DEFAULT 1,
    Location NVARCHAR(100),
    AcquiredDate DATE DEFAULT GETDATE(),
    
    CONSTRAINT UQ_BookCopy UNIQUE (BookID, CopyNumber)
);
GO

CREATE TABLE BorrowRecords (
    RecordID INT IDENTITY(1,1) PRIMARY KEY,
    CopyID INT NOT NULL FOREIGN KEY REFERENCES BookCopies(CopyID),
    ReaderID INT NOT NULL FOREIGN KEY REFERENCES Readers(ReaderID),
    BorrowDate DATE NOT NULL DEFAULT GETDATE(),
    DueDate DATE NOT NULL,
    ReturnDate DATE NULL,
    
    CHECK (DueDate > BorrowDate),
    CHECK (ReturnDate IS NULL OR ReturnDate >= BorrowDate)
);
GO

CREATE INDEX IX_Books_Title ON Books(Title);
CREATE INDEX IX_Books_Author ON Books(Author);
CREATE INDEX IX_Readers_Email ON Readers(Email);
CREATE INDEX IX_BookCopies_BookID ON BookCopies(BookID);
CREATE INDEX IX_BorrowRecords_CopyID ON BorrowRecords(CopyID);
CREATE INDEX IX_BorrowRecords_ReaderID ON BorrowRecords(ReaderID);
GO

INSERT INTO Books (Title, Author, Publisher, YearPublished, ISBN, IsRare)
VALUES 
    ('Война и мир', 'Лев Толстой', 'Русский вестник', 1869, '978-5-17-145907-4', 1),
    ('Мастер и Маргарита', 'Михаил Булгаков', 'Художественная литература', 1967, '978-5-389-08228-9', 1),
    ('Преступление и наказание', 'Федор Достоевский', 'Русский вестник', 1866, '978-5-04-119252-3', 0),
    ('Евгений Онегин', 'Александр Пушкин', 'Современник', 1833, '978-5-4453-0421-3', 0),
    ('Тихий Дон', 'Михаил Шолохов', 'Молодая гвардия', 1940, '978-5-699-75569-5', 1);
GO

INSERT INTO Readers (FullName, Email, Phone)
VALUES 
    ('Иван Петров', 'ivan.petrov@example.com', '+7-912-345-67-89'),
    ('Мария Сидорова', 'maria.sidorova@example.com', '+7-923-456-78-90'),
    ('Алексей Иванов', 'alexey.ivanov@example.com', '+7-934-567-89-01'),
    ('Екатерина Смирнова', 'ekaterina.smirnova@example.com', '+7-945-678-90-12');
GO