{
  let marvel = {
    data: null,
    favourites: [],
    showFavourites: false,
    expiry: null
  };

  const newListDom = function (character, btnClass, btn) {
    return `<div class="image-container">
              <img
                src="${character.thumbnail.path}/portrait_uncanny.${character.thumbnail.extension}"
              />
            </div>
            <div class="character-name">${character.name}</div>
            <div class="character-desc">${character.description}</div>
            <div class="character-stats">
              <div>Comics: ${character.comics.available}, 
                Stories: ${character.stories.available},
                Events: ${character.events.available}, 
                Series: ${character.series.available}
              </div>
              <div class="${btnClass}" data-id="${character.id}">${btn}</div>
            </div>
            <div class="attribution">
              <a href="http://marvel.com" target="_blank"
                >Data provided by Marvel. © 2022 MARVEL</a
              >
            </div>`;
  };

  const toggleFavourite = function (event) {
    let btn = event.target;
    let btnClass = btn.className;
    let id = btn.getAttribute('data-id');
    if (btnClass == 'favourite-btn') {
      marvel.favourites.push(id);
      btn.className = 'unfavourite-btn';
      btn.innerHTML = 'Remove from favourites';
    } else {
      let index = marvel.favourites.indexOf(id);
      marvel.favourites.splice(index, 1);
      btn.className = 'favourite-btn';
      btn.innerHTML = 'Add to favourites';
    }

    localStorage.setItem('marvel', JSON.stringify(marvel));
  };

  const toggleTab = function (event) {
    let tab = event.target;
    let tabId = tab.id;
    if (marvel.showFavourites) {
      if (tabId == 'character-tab') {
        marvel.showFavourites = false;
        tab.classList.add('active-tab');
        document.getElementById('favourite-tab').classList.remove('active-tab');
      }
    } else {
      if (tabId == 'favourite-tab') {
        marvel.showFavourites = true;
        tab.classList.add('active-tab');
        document.getElementById('character-tab').classList.remove('active-tab');
      }
    }

    localStorage.setItem('marvel', JSON.stringify(marvel));
    renderCharacters();
  };

  const renderCharacters = function () {
    const list = document.getElementById('characters-list');
    const characterTab = document.getElementById('character-tab');
    const favouriteTab = document.getElementById('favourite-tab');

    list.innerHTML = '';
    characterTab.removeEventListener('click', toggleTab);
    favouriteTab.removeEventListener('click', toggleTab);

    characterTab.addEventListener('click', toggleTab);
    favouriteTab.addEventListener('click', toggleTab);

    let characters;
    if (marvel.showFavourites) {
      characters = marvel.favourites;
    } else {
      characters = marvel.data.data.results;
    }

    characters.forEach((element) => {
      const card = document.createElement('div');
      card.className = 'character-item';

      let index = marvel.favourites.indexOf(element.id);
      let btnClass;
      let btn;
      if (index == -1) {
        btnClass = 'favourite-btn';
        btn = 'Add to favourites';
      } else {
        btnClass = 'unfavourite-btn';
        btn = 'Remove from favourites';
      }

      card.innerHTML = newListDom(element, btnClass, btn);
      list.appendChild(card);
      card
        .querySelector(`.${btnClass}`)
        .addEventListener('click', toggleFavourite);
    });
  };

  const fetchCharacters = async function () {
    const url =
      'https://gateway.marvel.com/v1/public/characters?ts=2&apikey=917ee510cf42654a13644448b8470ad3&hash=967615c8277734f7fc55f9ba050024f3&limit=50&offset=1200';
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: '*/*'
      }
    });
    const data = await response.json();

    marvel.data = { ...data };
    let ms = Date.now();
    marvel.expiry = ms + 1000 * 60 * 60 * 24;
    localStorage.setItem('marvel', JSON.stringify(marvel));
    renderCharacters();
  };

  if (localStorage.getItem('marvel')) {
    marvel = JSON.parse(localStorage.getItem('marvel'));
    let ms = Date.now();
    if (ms >= marvel.expiry) {
      fetchCharacters();
    } else {
      renderCharacters();
    }
  } else {
    fetchCharacters();
  }
}
