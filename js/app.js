'use strict';

this.searchButton = document.querySelector('#search-button');

class BooksData {
	constructor() {
		this.startIndex = 0;
		this.totalItemsFoundInAPI = 0;
		this.output = ``;
	}

	runDataLoad(scrolled) {
		const searchTerm = document.querySelector('#input-search').value.split(' ').join('+');
		if (searchTerm) {
			if (scrolled) {
				this.startIndex += 10;
				this.loadData(searchTerm);
			} else {
				this.output = '';
				this.loadData(searchTerm);
			}
		} else {
			alert('Please type searched phrase!');
		}
	}

	checkIfScrollHitBottom() {
		const scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
		const scrollHeight =
			(document.documentElement && document.documentElement.scrollHeight) || document.body.scrollHeight;
		const scrolledToBottom = Math.ceil(scrollTop + window.innerHeight) >= scrollHeight;

		if (scrolledToBottom && this.startIndex <= this.totalItemsFoundInAPI) {
			this.runDataLoad(true);
		}
	}

	loadData(search) {
		const endpoint = `https://www.googleapis.com/books/v1/volumes?q=${search}&maxResults=10&startIndex=${this
			.startIndex}&orderBy=newest&fields=totalItems,items(volumeInfo/title,volumeInfo/authors,volumeInfo/industryIdentifiers,volumeInfo/imageLinks,volumeInfo/description,volumeInfo/publishedDate)`;
		fetch(endpoint)
			.then((resp) => resp.json())
			.then((data) => {
				this.totalItemsFoundInAPI = data['totalItems'];
				data.items.forEach((item) => {
					this.output += `
                    <div class="book-wrapper">
                        <div class="book-thumbnail">
                            <img src=${this.getThumbnail(item)}>
                        </div>
                        <div class="book-details">
                            <h1>${this.getTitle(item)}</h1>
                            <h3>by: ${this.getAuthor(item)}</h3>
                            <p class="book-date">Published: ${this.getPublishedDate(item)}</p>
                            <p class="book-isbn">ISBN: ${this.getISBN(item)}</p>
                            <p class="book-description">${this.getDescription(item)}</p>
                        </div>
                    </div>`;
					document.querySelector('#results').innerHTML = this.output;
				});
			})
			.catch((err) => console.log(err));
	}

	getTitle(data) {
		if (data['volumeInfo']['title']) {
			return data['volumeInfo']['title'];
		} else {
			return '';
		}
	}

	getISBN(data) {
		if (data['volumeInfo']['industryIdentifiers'][0]['identifier']) {
			const filteredISBN = data['volumeInfo']['industryIdentifiers'].filter(
				(ident) => ident.type.toLowerCase() === 'isbn_13'
			);
			return filteredISBN.length !== 0 ? filteredISBN[0]['identifier'] : '';
		} else {
			return 'missing';
		}
	}

	getDescription(data) {
		if (data['volumeInfo']['description']) {
			return data['volumeInfo']['description'].split(' ').slice(0, 39).join(' ') + '...';
		} else {
			return '...';
		}
	}

	getThumbnail(data) {
		if (data['volumeInfo']['imageLinks']) {
			return data['volumeInfo']['imageLinks']['thumbnail'];
		} else {
			return 'http://placehold.it/128x198';
		}
	}

	getAuthor(data) {
		if (data['volumeInfo']['authors']) {
			return data['volumeInfo']['authors'].join(', ');
		} else {
			return '';
		}
	}

	getPublishedDate(data) {
		if (data['volumeInfo']['publishedDate']) {
			return data['volumeInfo']['publishedDate'];
		} else {
			return '';
		}
	}
}

const book = new BooksData();

window.addEventListener('scroll', function() {
	book.checkIfScrollHitBottom();
});
// add search functionality when enter is pressed
document.addEventListener('keydown', function(e) {
	if (e.keyCode === 13) {
		book.runDataLoad(false);
	}
});

searchButton.addEventListener('click', function() {
	book.runDataLoad(false);
});
