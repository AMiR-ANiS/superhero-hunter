{
  // Get the marvel variable from the localStorage

  const marvel = JSON.parse(localStorage.getItem('marvel'));
  let characterData = null;

  // Clicking on back button or app name goes to home page

  document
    .getElementById('back-btn')
    .addEventListener('click', function (event) {
      location.assign('./index.html');
    });

  document
    .getElementById('app-name')
    .addEventListener('click', function (event) {
      location.assign('./index.html');
    });

  document.getElementById('footer').innerHTML = `${marvel.attributionHTML}`;

  // Autocomplete search function

  const enableAutocomplete = function () {
    const searchBar = document.getElementById('search-bar');
    let selected = -1;

    // Remove search results function

    const destroyLists = function () {
      selected = -1;
      document.querySelectorAll('.autocomplete-list').forEach(function (list) {
        list.remove();
      });
    };

    // Function to process search term input

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

    const handleKeydown = function (event) {
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
    searchBar.addEventListener('keydown', handleKeydown);
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

  // Function to create new superhero info

  const newSuperheroDOM = function (superhero) {
    return `<div id="superhero-img">
              <img
                src="${superhero.thumbnail.path}/detail.${superhero.thumbnail.extension}"
                alt="superhero-image"
              />
            </div>
            <div id="superhero-name">${superhero.name}</div>
            <div id="superhero-id">ID: ${superhero.id}</div>
            <div id="superhero-description">
              <h2>Description:</h2>
              <div>
                ${superhero.description}  
              </div>
            </div>
            <div id="superhero-stats">
              <div id="comics">
                <h3>Comics:</h3>
                Available comics: ${superhero.comics.available}
                <ul id="comics-list">
                  
                </ul>
              </div>
              <div id="stories">
                <h3>Stories:</h3>
                Available stories: ${superhero.stories.available}
                <ul id="stories-list">
                  
                </ul>
              </div>
              <div id="series">
                <h3>Series:</h3>
                Available series: ${superhero.series.available}
                <ul id="series-list">
                  
                </ul>
              </div>
              <div id="events">
                <h3>Events:</h3>
                Available events: ${superhero.events.available}
                <ul id="events-list">
                  
                </ul>
              </div>
            </div>`;
  };

  // Function to display superhero information

  const renderCharacter = function () {
    const superheroContainer = document.getElementById(
      'single-character-container'
    );
    let infoContainer = document.getElementById('info');
    if (infoContainer) {
      infoContainer.remove();
    }

    infoContainer = document.createElement('div');
    infoContainer.id = 'info';

    let superheroDOM = newSuperheroDOM(characterData);
    infoContainer.innerHTML = superheroDOM;

    superheroContainer.appendChild(infoContainer);

    if (characterData.description == '') {
      document.querySelector('#superhero-description div').innerHTML =
        'Description not available!';
    }

    let comicsList = document.getElementById('comics-list');
    let eventsList = document.getElementById('events-list');
    let seriesList = document.getElementById('series-list');
    let storiesList = document.getElementById('stories-list');

    if (characterData.comics.available == 0) {
      comicsList.remove();
    } else {
      characterData.comics.items.forEach(function (item) {
        let li = document.createElement('li');
        li.innerHTML = item.name;
        comicsList.appendChild(li);
      });
    }

    if (characterData.series.available == 0) {
      seriesList.remove();
    } else {
      characterData.series.items.forEach(function (value) {
        let li = document.createElement('li');
        li.innerHTML = value.name;
        seriesList.appendChild(li);
      });
    }

    if (characterData.stories.available == 0) {
      storiesList.remove();
    } else {
      characterData.stories.items.forEach(function (value) {
        let li = document.createElement('li');
        li.innerHTML = value.name;
        storiesList.appendChild(li);
      });
    }

    if (characterData.events.available == 0) {
      eventsList.remove();
    } else {
      characterData.events.items.forEach(function (value) {
        let li = document.createElement('li');
        li.innerHTML = value.name;
        eventsList.appendChild(li);
      });
    }
  };

  // Fetch details of a single character from the Marvel API

  const fetchCharacter = function () {
    const id = marvel.id;
    if (id != null) {
      const API_ROOT = 'https://gateway.marvel.com';
      const ts = 2;
      const publicKey = '917ee510cf42654a13644448b8470ad3';
      const hash = '967615c8277734f7fc55f9ba050024f3';
      let url = `${API_ROOT}/v1/public/characters/${id}?ts=${ts}&apikey=${publicKey}&hash=${hash}`;

      fetch(url, {
        method: 'GET',
        headers: {
          Accept: '*/*'
        }
      })
        .then((response) => response.json())
        .then((data) => {
          characterData = JSON.parse(JSON.stringify(data.data.results[0]));
          document.title = `Superhero Hunter | ${characterData.name}`;
          renderCharacter();
        });
    }
  };

  enableAutocomplete();
  fetchCharacter();
}
