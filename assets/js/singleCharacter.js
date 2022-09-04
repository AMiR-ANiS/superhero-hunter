{
  const marvel = JSON.parse(localStorage.getItem('marvel'));
  let characterData = null;

  document
    .getElementById('back-btn')
    .addEventListener('click', function (event) {
      location.assign('./index.html');
    });

  document.getElementById('footer').innerHTML = `${marvel.attributionHTML}`;

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
