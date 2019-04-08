'use strict';

this.searchButton = document.querySelector('#search-button');

class Books {
	constructor() {
		this.startIndex = 0;
		this.totalItemsFoundInAPI = 0;
		this.output = ``;
	}

	runDataLoad(scrolled) {
		// create string with all words written by user joined with +
		// then Google Books API looks for each word seaparated by + not the exact phrase
		const searchTerm = document.querySelector('#input-search').value.split(' ').join('+');
		if (searchTerm) {
			// on scroll add startIndex API position by 10 to load more books
			if (scrolled) {
				this.startIndex += 10;
				this.loadData(searchTerm);
				// else is added in cases when user clicks on press enter to search new or same phrase
				// then new content is visible rather then adding new content to already existing
			} else {
				this.output = '';
				this.loadData(searchTerm);
			}
		} else {
			alert('Please type searched phrase!');
		}
	}

	checkIfScrollHitBottom() {
		// checks the actual scroll position
		// this is a bit of a hack to assure work on Chrome, Firefox and IE
		const scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
		// actual page height
		// accounting for cases where html/body are set to height:100%
		const scrollHeight =
			(document.documentElement && document.documentElement.scrollHeight) || document.body.scrollHeight;
		// checker whether user scrolled to bottom of the page
		// There can be some problems due to scroll bar thats why Math.ceil and >=
		const scrolledToBottom = Math.ceil(scrollTop + window.innerHeight) >= scrollHeight;

		if (scrolledToBottom && this.startIndex <= this.totalItemsFoundInAPI) {
			this.runDataLoad(true);
		}
	}

	loadData(search) {
		const endpoint = `https://www.googleapis.com/books/v1/volumes?q=${search}&maxResults=10&startIndex=${this
			.startIndex}&orderBy=newest&fields=totalItems,items(volumeInfo/title,volumeInfo/authors,volumeInfo/industryIdentifiers,volumeInfo/imageLinks,volumeInfo/description,volumeInfo/publishedDate)`;
		// start pulling data from API endpoint
		fetch(endpoint)
			.then((resp) => resp.json())
			.then((data) => {
				this.totalItemsFoundInAPI = data['totalItems'];
				// iterate through each object in result
				// and create output out of each object property
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
		// checks whether title information exists in passed object
		if (data['volumeInfo']['title']) {
			return data['volumeInfo']['title'];
		} else {
			return '';
		}
	}

	getISBN(data) {
		// checks whether ISBN information exists in passed object
		// if yes then filter ISBN information to include only ISBN_13
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
		// checks whether description information exists in passed object
		// return only first 40 words as a description
		if (data['volumeInfo']['description']) {
			return data['volumeInfo']['description'].split(' ').slice(0, 39).join(' ') + '...';
		} else {
			return '...';
		}
	}

	getThumbnail(data) {
		// checks whether thumbnail link exists in passed object
		if (data['volumeInfo']['imageLinks']) {
			return data['volumeInfo']['imageLinks']['thumbnail'];
		} else {
			return 'http://placehold.it/128x198';
		}
	}

	getAuthor(data) {
		// checks whether author information exists in passed object
		// return each author on the same line separated by comma
		if (data['volumeInfo']['authors']) {
			return data['volumeInfo']['authors'].join(', ');
		} else {
			return '';
		}
	}

	getPublishedDate(data) {
		// checks whether publishing date exists in passed object
		if (data['volumeInfo']['publishedDate']) {
			return data['volumeInfo']['publishedDate'];
		} else {
			return '';
		}
	}
}

const book = new Books();

// added scroll event to window
window.addEventListener('scroll', function() {
	// checks whether user scrolled to bottom of the page
	// and adds new content
	book.checkIfScrollHitBottom();
});

// add search functionality when enter is pressed
document.addEventListener('keydown', function(e) {
	if (e.keyCode === 13) {
		book.runDataLoad(false);
	}
});

// run loading data on click
searchButton.addEventListener('click', function() {
	book.runDataLoad(false);
});
