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

  document
    .getElementById('app-name')
    .addEventListener('click', function (event) {
      location.assign('./index.html');
    });

  const newListDom = function (character, btnClass, btn) {
    return `<div class="image-container">
              <img
                src="${character.thumbnail.path}/portrait_uncanny.${character.thumbnail.extension}"
              />
            </div>
            <div class="character-name">${character.name}</div>
            <div class="character-desc">${character.description}</div>
            <div class="character-stats">
              <div>Comics: ${character.comics}, 
                Stories: ${character.stories},
                Events: ${character.events}, 
                Series: ${character.series}
              </div>
              <div class="${btnClass} prevent-select" data-id="${character.id}">${btn}</div>
            </div>
            <div class="attribution">
              <a href="http://marvel.com" target="_blank">${marvel.attributionText}</a>
            </div>`;
  };

  const toggleFavourite = function (event) {
    let btn = event.target;
    let id = btn.getAttribute('data-id');
    if (btn.classList.contains('favourite-btn')) {
      marvel.favourites.push(id);
      btn.classList.replace('favourite-btn', 'unfavourite-btn');
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
        btn.classList.replace('unfavourite-btn', 'favourite-btn');
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
      characters = marvel.characters.filter((obj) => {
        let id = obj.id.toString();
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

      if (element.description == '') {
        card.querySelector('.character-desc').innerHTML =
          'Description not available!';
      }

      card
        .querySelector(`.${btnClass}`)
        .addEventListener('click', toggleFavourite);

      card
        .querySelector('.image-container')
        .addEventListener('click', function (event) {
          marvel.id = element.id;
          localStorage.setItem('marvel', JSON.stringify(marvel));
          location.assign('./singleCharacter.html');
        });
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
    data.data.results.forEach(function (obj) {
      let objToPush = {
        name: obj.name,
        description: obj.description,
        id: obj.id,
        events: obj.events.available,
        stories: obj.stories.available,
        series: obj.series.available,
        comics: obj.comics.available,
        thumbnail: JSON.parse(JSON.stringify(obj.thumbnail))
      };
      marvel.home.push(objToPush);
      marvel.characters.push(objToPush);
    });

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

      data.data.results.forEach(function (obj) {
        let objToPush = {
          name: obj.name,
          description: obj.description,
          id: obj.id,
          events: obj.events.available,
          stories: obj.stories.available,
          series: obj.series.available,
          comics: obj.comics.available,
          thumbnail: JSON.parse(JSON.stringify(obj.thumbnail))
        };
        marvel.characters.push(objToPush);
      });

      offset += 100;
    }

    localStorage.setItem('marvel', JSON.stringify(marvel));
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

    const destroyLists = function () {
      selected = -1;
      document.querySelectorAll('.autocomplete-list').forEach(function (list) {
        list.remove();
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
      newList.classList.add('prevent-select');

      let parent = document.querySelector('.autocomplete');
      parent.appendChild(newList);

      marvel.characters.forEach(function (obj) {
        if (
          inputValue.toUpperCase() ==
          obj.name.slice(0, inputValue.length).toUpperCase()
        ) {
          let div = document.createElement('div');
          div.classList.add('autocomplete-item');

          let btn;
          let btnClass;
          if (marvel.favourites.indexOf(obj.id.toString()) == -1) {
            btn = '<i class="fa-regular fa-star"></i>';
            btnClass = 'autocomplete-item-favourite-btn';
          } else {
            btn = '<i class="fa-solid fa-star"></i>';
            btnClass = 'autocomplete-item-unfavourite-btn';
          }

          div.innerHTML = `<div class="autocomplete-item-name">
                              <strong>${obj.name.slice(
                                0,
                                inputValue.length
                              )}</strong>${obj.name.slice(inputValue.length)}
                            </div>
                            <div class="${btnClass}">
                              ${btn}
                            </div>`;
          newList.appendChild(div);

          div
            .querySelector('.autocomplete-item-name')
            .addEventListener('click', function (event) {
              marvel.id = obj.id;
              localStorage.setItem('marvel', JSON.stringify(marvel));
              location.assign('./singleCharacter.html');
            });

          div
            .querySelector(`.${btnClass}`)
            .addEventListener('click', function (event) {
              let btn = event.target.parentNode;
              let btnClass = btn.className;
              if (btnClass == 'autocomplete-item-favourite-btn') {
                marvel.favourites.push(obj.id.toString());

                btn.classList.remove('autocomplete-item-favourite-btn');
                btn.classList.add('autocomplete-item-unfavourite-btn');
                btn.innerHTML = '<i class="fa-solid fa-star"></i>';
              } else {
                let index = marvel.favourites.indexOf(obj.id.toString());
                marvel.favourites.splice(index, 1);

                btn.classList.remove('autocomplete-item-unfavourite-btn');
                btn.classList.add('autocomplete-item-favourite-btn');
                btn.innerHTML = '<i class="fa-regular fa-star"></i>';
              }
              localStorage.setItem('marvel', JSON.stringify(marvel));
              if (marvel.showFavourites) {
                renderCharacters();
              }
            });
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

    const handleKeyPress = function (event) {
      const list = document.querySelector('.autocomplete-list');
      if (!list) {
        return;
      }
      const items = list.querySelectorAll('.autocomplete-item');
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
            items[selected].querySelector('.autocomplete-item-name').click();
          }
      }
    };

    searchBar.addEventListener('input', handleTextInput);
    searchBar.addEventListener('keypress', handleKeyPress);
    document.addEventListener('click', function (event) {
      let clicked = event.target;
      if (clicked == searchBar) {
        return;
      }
      if (clicked.nodeName == 'I') {
        return;
      }
      destroyLists();
    });
  };

  enableAutocomplete();
}
