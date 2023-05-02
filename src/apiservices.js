import axios from 'axios';

// Конструктор класу Api встановлює початкові значення для деяких властивостей.
// lastSearch - рядок, який містить останній пошуковий запит.
// perPage - кількість елементів на сторінці, яку необхідно отримати з API.
// currentPage - номер поточної сторінки.
// isNewSearch - флаг, який вказує, чи є поточний запит новим пошуком, чи продовженням попереднього запиту.
// isEndOfPages - флаг, який вказує, чи досягнуто кінця результатів пошуку на сторінці.

export class Api {
    #BASE_URL = 'https://pixabay.com/api/';
    #API_KEY = '35987017-79a2968fba1cab1059c25ffe8';

    constructor() {
        this.lastSearch = '';
        this.perPage = 40;
        this.currentPage = 1;
        this.isNewSearch = false;
        this.isEndOfPages = false;
    }

async getData(query) {
    if (query !== this.lastSearch) {
      this.isNewSearch = true;
      this.currentPage = 1;
    } else {
      this.isNewSearch = false;
    }

    const response = await axios.get(this.#BASE_URL, {
      params: {
        key: this.#API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: this.perPage,
        page: this.currentPage,
      },
    });

    this.lastSearch = query;
    this.isEndOfPages = this.perPage * this.currentPage >= response.data.totalHits;
    this.currentPage += 1;
    return response;
  }
}
 


