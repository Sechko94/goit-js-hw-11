import { markup } from './markup';
import { Api } from './apiservices';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  form: document.querySelector('.search-form'),
  button: document.querySelector('button[type="submit"]'),
  gallery: document.querySelector('.gallery'),
  delimiter: document.querySelector('.delimiter'),
  spinner: document.querySelector('.spinner'),
};

const slider = new SimpleLightbox('.slide-wrapper', {
  overlayOpacity: 0.9,
  showCounter: false,
  captionsData: 'alt',
  captionDelay: 150,
});

// Простые решения для сложных задач с Intersection Observer API - https://www.youtube.com/watch?v=ZYqBZmU-tA0
const intersectionObserver = new IntersectionObserver(onEndOfScroll);
intersectionObserver.observe(refs.delimiter);

const api = new Api();
let query = '';

Notify.init({ showOnlyTheLastOne: true, clickToClose: true });
refs.form.addEventListener('submit', onSubmit);

async function onSubmit(event) {
  event.preventDefault();
  query = refs.form.searchQuery.value.trim();
  if (query === '' || query === api.lastSearch) return;


  refs.button.disabled = true;
  clearPage();
  await renderPage();
  refs.button.disabled = false;
}

function clearPage() {
  refs.gallery.innerHTML = '';
}

async function renderPage() {
  try {
    refs.spinner.classList.remove('hidden');
    const srcData = await api.getData(query);
    const srcElements = srcData.data.hits;

    if (srcElements.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    if (api.isNewSearch) {
      Notify.info(`Hooray! We found ${srcData.data.totalHits} images.`);
    }

    const htmlMarkup = await markup.createManyCards(srcElements);
    refs.gallery.insertAdjacentHTML('beforeend', htmlMarkup);
    slider.refresh();
  }

  catch (error) {
    Notify.failure(error.message);
  }

  finally {
    refs.spinner.classList.add('hidden');
  }
}

function onEndOfScroll(intersectionEntries) {
  intersectionEntries.forEach(entry => {
    if (entry.isIntersecting && query !== '' && query === api.lastSearch) {
      if (!api.isEndOfPages) renderPage();
      else
        Notify.warning(
          "We're sorry, but you've reached the end of search results."
        );
    }
  });
}

