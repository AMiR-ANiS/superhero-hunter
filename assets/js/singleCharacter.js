{
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

  document
    .getElementById('back-btn')
    .addEventListener('click', function (event) {
      location.assign('./index.html');
    });
}
