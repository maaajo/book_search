{
  class Books {
    constructor(root) {
      this.root = root;
      this.startIndex = 0;
      this.totalItemsFoundInAPI = 0;
      this.output = ``;
      this.searchButton = this.root.querySelector('#search-button');
    }

    checkIfScrollHitBottom() {
      // checks the actual scroll position
      // this is a bit of a hack to assure work on Chrome, Firefox and IE
      const scrollTop =
        (document.documentElement && document.documentElement.scrollTop) ||
        document.body.scrollTop;
      // actual page height
      // accounting for cases where html/body are set to height:100%
      const scrollHeight =
        (document.documentElement && document.documentElement.scrollHeight) ||
        document.body.scrollHeight;
      // checker whether user scrolled to bottom of the page
      // There can be some problems due to scroll bar thats why Math.ceil and >=
      const scrolledToBottom =
        Math.ceil(scrollTop + window.innerHeight) >= scrollHeight;

      if (scrolledToBottom && this.startIndex <= this.totalItemsFoundInAPI) {
        this.performSearch(true);
      }
    }

    async runScrollAdd(searchTerm) {
      this.startIndex += 10;
      this.addBooksToPage(await this.fetchData(searchTerm));
    }

    async runNewSearch(searchTerm) {
      this.output = '';
      this.startIndex = 0;
      this.root.querySelector('#results').innerHTML = '';
      this.addBooksToPage(await this.fetchData(searchTerm));
    }

    async performSearch(scrolled) {
      // create string with all words written by user joined with +
      // then Google Books API looks for each word separated by + not the exact phrase
      // on scroll add startIndex API position by 10 to load more books
      if (scrolled) {
        await this.runScrollAdd(this.searchTerm);
        // else is added in cases when user clicks on press enter to search new or same phrase
        // then new content is visible rather then adding new content to already existing
      } else {
        this.searchTerm = this.root
          .querySelector('#input-search')
          .value.split(' ')
          .join('+');
        this.searchTerm
          ? await this.runNewSearch(this.searchTerm)
          : alert('Please type searched phrase!');
      }
    }

    async fetchData(search) {
      const endpoint = `https://www.googleapis.com/books/v1/volumes?q=${search}&maxResults=10&startIndex=${
        this.startIndex
      }&orderBy=newest&fields=totalItems,items(volumeInfo/title,volumeInfo/authors,volumeInfo/industryIdentifiers,volumeInfo/imageLinks,volumeInfo/description,volumeInfo/publishedDate)`;
      const response = await fetch(endpoint);
      const data = await response.json();
      this.totalItemsFoundInAPI = data.totalItems;
      const booksData = this.parseData(data);
      return booksData;
    }

    parseData(data) {
      return data.items.map(item => {
        const thumbnail = this.getThumbnail(item);
        const { title, publishedDate } = item.volumeInfo;
        const isbn = this.getISBN(item);
        const description = this.getDescription(item);
        const author = this.getAuthor(item);
        return {
          thumbnail,
          title,
          publishedDate,
          isbn,
          description,
          author,
        };
      });
    }

    createBooksLiteral(books) {
      let literal = ``;
      for (const book of books) {
        literal += `
      <div class="book-wrapper">
      <div class="book-thumbnail">
          <img src=${book.thumbnail}>
      </div>
      <div class="book-details">
          <h1>${book.title}</h1>
          <h3>by: ${book.author}</h3>
          <p class="book-date">Published: ${book.publishedDate}</p>
          <p class="book-isbn">ISBN: ${book.isbn}</p>
          <p class="book-description">${book.description}</p>
      </div>
  </div>`;
      }
      return literal;
    }

    addBooksToPage(books) {
      this.output += this.createBooksLiteral(books);
      this.root.querySelector('#results').innerHTML = this.output;
    }

    getISBN(data) {
      // checks whether ISBN information exists in passed object
      // if yes then filter ISBN information to include only ISBN_13
      try {
        const filteredISBN = data.volumeInfo.industryIdentifiers.filter(
          ident => ident.type.toLowerCase() === 'isbn_13'
        );
        return filteredISBN.length !== 0 ? filteredISBN[0].identifier : '';
      } catch (err) {
        return 'missing';
      }
    }

    getDescription(data) {
      // checks whether description information exists in passed object
      // return only first 40 words as a description
      try {
        return `${data.volumeInfo.description
          .split(' ')
          .slice(0, 39)
          .join(' ')}...`;
      } catch (err) {
        return '';
      }
    }

    getThumbnail(data) {
      // checks whether thumbnail link exists in passed object
      try {
        return data.volumeInfo.imageLinks.thumbnail;
      } catch (err) {
        return 'http://placehold.it/128x198';
      }
    }

    getAuthor(data) {
      // checks whether author information exists in passed object
      // return each author on the same line separated by comma
      try {
        return data.volumeInfo.authors.join(', ');
      } catch (err) {
        return '';
      }
    }

    attachEvents() {
      // added scroll event to window
      // checks whether user scrolled to bottom of the page
      // and adds new content
      window.addEventListener('scroll', () => this.checkIfScrollHitBottom());
      this.root.addEventListener('keydown', e => {
        if (e.keyCode === 13) {
          this.performSearch(false);
        }
      });
      this.searchButton.addEventListener('click', () =>
        this.performSearch(false)
      );
    }
  }
  const bookComponent = new Books(document);
  bookComponent.attachEvents();
}
