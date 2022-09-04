{
  let marvel = {
    copyright: '',
    attributionHTML: '',
    attributionText: '',
    home: [],
    characters: [],
    favourites: [],
    showFavourites: false,
    expiry: null,
    id: null
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
      if (marvel.showFavourites) {
        document.getElementById(id).remove();
        if (marvel.favourites.length == 0) {
          const list = document.getElementById('characters-list');
          const empty = document.createElement('h1');
          empty.id = 'empty-list';
          empty.innerHTML = 'Nothing here to display!';
          list.appendChild(empty);
        }
      } else {
        btn.className = 'favourite-btn';
        btn.innerHTML = 'Add to favourites';
      }
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

  const characterTab = document.getElementById('character-tab');
  const favouriteTab = document.getElementById('favourite-tab');

  characterTab.addEventListener('click', toggleTab);
  favouriteTab.addEventListener('click', toggleTab);

  const renderCharacters = function () {
    const list = document.getElementById('characters-list');

    const footer = document.getElementById('footer');
    footer.innerHTML = `${marvel.copyright}`;

    list.innerHTML = '';

    let characters;
    if (marvel.showFavourites) {
      favouriteTab.classList.add('active-tab');
      characters = marvel.home.filter((value) => {
        let id = value.id.toString();
        return marvel.favourites.indexOf(id) != -1;
      });
    } else {
      characterTab.classList.add('active-tab');
      characters = marvel.home;
    }

    if (characters.length == 0) {
      const empty = document.createElement('h1');
      empty.id = 'empty-list';
      empty.innerHTML = 'Nothing here to display!';
      list.appendChild(empty);
    }

    characters.forEach((element) => {
      const card = document.createElement('div');
      card.className = 'character-item';
      card.id = element.id;

      let index = marvel.favourites.indexOf(element.id.toString());
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
    const API_ROOT = 'https://gateway.marvel.com';
    const ts = 2;
    const publicKey = '917ee510cf42654a13644448b8470ad3';
    const hash = '967615c8277734f7fc55f9ba050024f3';
    let limit = 100;
    let offset = 0;
    let orderBy = 'name';
    let url = `${API_ROOT}/v1/public/characters?ts=${ts}&apikey=${publicKey}&hash=${hash}&limit=${limit}&offset=${offset}&orderBy=${orderBy}`;

    let response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: '*/*'
      }
    });
    let data = await response.json();

    let total = data.data.total;
    let ms = Date.now();
    marvel.expiry = ms + 1000 * 60 * 60 * 24;
    marvel.copyright = data.copyright;
    marvel.attributionHTML = data.attributionHTML;
    marvel.attributionText = data.attributionText;
    marvel.home = data.data.results;
    marvel.home.forEach(function (value) {
      let obj = {
        name: value.name,
        id: value.id
      };
      marvel.characters.push(obj);
    });

    marvel = JSON.parse(JSON.stringify(marvel));
    renderCharacters();

    offset += 100;
    while (offset < total) {
      const url = `${API_ROOT}/v1/public/characters?ts=${ts}&apikey=${publicKey}&hash=${hash}&limit=${limit}&offset=${offset}&orderBy=${orderBy}`;
      response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: '*/*'
        }
      });
      data = await response.json();

      data.data.results.forEach(function (value) {
        let obj = {
          name: value.name,
          id: value.id
        };
        marvel.characters.push(obj);
      });

      offset += 100;
    }

    localStorage.setItem('marvel', JSON.stringify(marvel));
    marvel = JSON.parse(localStorage.getItem('marvel'));
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

  const enableAutocomplete = function () {
    const searchBar = document.getElementById('search-bar');
    let selected = -1;

    const destroyLists = function (element) {
      document.querySelectorAll('.autocomplete-list').forEach(function (list) {
        if (element != searchBar) {
          selected = -1;
          list.remove();
        }
      });
    };

    const handleTextInput = function (event) {
      let inputBox = event.target;
      let inputValue = inputBox.value;
      destroyLists();
      if (!inputValue) {
        return;
      }

      let newList = document.createElement('div');
      newList.classList.add('autocomplete-list');
      let parent = document.querySelector('.autocomplete');
      parent.appendChild(newList);
      marvel.characters.forEach(function (value) {
        if (
          inputValue.toUpperCase() ==
          value.name.slice(0, inputValue.length).toUpperCase()
        ) {
          let item = document.createElement('div');
          item.innerHTML = `<strong>${value.name.slice(
            0,
            inputValue.length
          )}</strong>${value.name.slice(inputValue.length)}`;

          item.addEventListener('click', function (event) {
            marvel.id = value.id;
            localStorage.setItem('marvel', JSON.stringify(marvel));
            location.assign('./singleCharacter.html');
          });
          newList.appendChild(item);
        }
      });
    };

    const removeActive = function (divs) {
      divs.forEach(function (div) {
        div.classList.remove('autocomplete-active');
      });
    };

    const addActive = function (divs) {
      removeActive(divs);
      if (selected >= divs.length) {
        selected = 0;
      }
      if (selected < 0) {
        selected = divs.length - 1;
      }
      divs[selected].classList.add('autocomplete-active');
      divs[selected].scrollIntoView();
    };

    const handleKeyDown = function (event) {
      const list = document.querySelector('.autocomplete-list');
      if (!list) {
        return;
      }
      const items = list.querySelectorAll('div');
      if (items.length == 0) {
        return;
      }

      switch (event.keyCode) {
        case 40:
          selected++;
          addActive(items);
          break;
        case 38:
          selected--;
          addActive(items);
          break;
        case 13:
          event.preventDefault();
          if (selected > -1) {
            items[selected].click();
          }
      }
    };

    const handleDocumentClick = function (event) {
      destroyLists(event.target);
    };
    searchBar.addEventListener('input', handleTextInput);
    searchBar.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleDocumentClick);
  };

  enableAutocomplete();
}
