let allAuthors = [];
const books = [
  { 
    title: "The Great Gatsby", 
    author: "F. Scott Fitzgerald", 
    pages: 180, 
    year: 1925, 
    isbn: "9780743273565" 
  },
  { 
    title: "To Kill a Mockingbird", 
    author: "Harper Lee", 
    pages: 281, 
    year: 1960, 
    isbn: "9780061120084" 
  },
  { 
    title: "1984", 
    author: "George Orwell", 
    pages: 328, 
    year: 1949, 
    isbn: "9780451524935" 
  }
];

// Write a function here
function getInventory() {
  let totalBooks = 0;
  let totalPages = 0;
  let oldestBook = books[0];
  let newestBook = books[0];

  for (let i = 0; i < books.length; i++) {
    let book = books[i];
    totalBooks++;
    totalPages += book.pages;
    if (!allAuthors.includes(book.author)) {
      allAuthors.push(book.author);
    }
    if (book.year < oldestBook.year) {
      oldestBook = book;
    }
    if (book.year > newestBook.year) {
      newestBook = book;
    }
  }

  return {
    totalBooks,
    totalPages,
    allAuthors,
    oldestBook,
    newestBook
  };
}
console.log(getInventory(books));


  