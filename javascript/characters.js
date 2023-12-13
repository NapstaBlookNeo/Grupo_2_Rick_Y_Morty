let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let url = new URLSearchParams(window.location.search)
let searchParams = url.get('page')
let characterSchema = {
    status: ['alive', 'dead', 'unknown'],
    species: ['Human', 'Alien', 'Humanoid', 'Poopybutthole', 'Mythological Creature', 'robot', 'Cronenberg', 'Disease', 'Animal', 'Unknown'],
    gender: ['male', 'female', 'unknown', 'genderless']
}
let filters = {};

let speciesParam = url.get('species')
if (speciesParam) {
    filters.species = speciesParam.split('&')
}

let nameParam = url.get('name');
if (nameParam) {
    filters.name = nameParam.split('&');
}

let genderParam = url.get('gender')
if (genderParam) {
    filters.gender = genderParam.split('&')
}

let statusParam = url.get('status')
if (statusParam) {
    filters.status = statusParam.split('&')
}

if (searchParams == null) {
    searchParams = 1
}

let apiUrl = "https://rickandmortyapi.com/api/character/?page=" + searchParams;

if (Object.keys(filters).length > 0) {
    apiUrl += "&"
    for (let key in filters) {
        apiUrl += `${key}=${filters[key].join(',')}&`
    }
    apiUrl = apiUrl.slice(0, -1)
}

fetch(apiUrl)
    .then(response => response.json())
    .then(responseData => {
        let data = responseData;
        //---------------------------------- Elements Render ------------------------------------

        // Main cards Render
        function renderCharacterCards(data, favorites) {
            let characterCards = document.getElementById("characterCards");
            characterCards.innerHTML = '';

            for (let i = 0; i < data.results.length; i++) {
                let card = document.createElement("div");
                card.classList.add("col-12", "col-lg-4", "my-2");
                card.innerHTML = `
                    <div class="card">
                        <p class="bi bi-star-fill position-absolute top-0 end-0 m-3 h1 clickeable" data-value="${data.results[i].id}" id="favoriteButton-${data.results[i].id}"></p>
                        <img src="${data.results[i].image}" class="card-img-top" onerror="this.src='images/default.png'">
                        <div class="card-body">
                            <h3 class="card-title mb-4 text-center">${data.results[i].name}</h3>
                            <p class="card-text">Origin: ${data.results[i].origin.name}</p>
                            <p class="card-text">Specie: ${data.results[i].species}</p>
                            <p class="card-text">Gender: ${data.results[i].gender}</p>
                            <p class="card-text">Status: ${data.results[i].status}</p>
                        </div>
                    </div>
                `;
                characterCards.appendChild(card);

                let favoriteButton = document.getElementById(`favoriteButton-${data.results[i].id}`);
                favoriteButton.addEventListener('click', function () {
                    favoriteToggle(data.results[i].id);
                });

                // Verificar si el personaje actual está en la lista de favoritos
                if (favorites.includes(data.results[i].id.toString())) {
                    favoriteButton.classList.add('favorite');
                } else {
                    favoriteButton.classList.remove('favorite');
                }
            }
        }

        // Pagination Render
        let pagination = document.getElementById("pagination")
        let paginationElements = document.createElement("nav")
        paginationElements.setAttribute('aria-label', 'Page navigation example')
        paginationElements.innerHTML = `
            <ul class="pagination justify-content-center">
                    ${paginationNumeration(searchParams)}
            </ul>
        `
        pagination.appendChild(paginationElements)

        function paginationNumeration(size) {
            size = parseInt(size);
            let maxSize = parseInt(data.info.pages);
            let element = "";
            let currentQuery = window.location.search.substring(1);
            let queryParameters = new URLSearchParams(currentQuery);
            if (queryParameters.has('page')) {
                queryParameters.delete('page');
            }
            currentQuery = queryParameters.toString();
            if (size > 5) {
                for (let i = size - 4; i <= size + 5; i++) {
                    if (i <= maxSize && i > 0) {
                        if (i === size) {
                            element += `<li class="page-item"><a class="page-link active" href="?${currentQuery}&page=${i}">${i}</a></li>`;
                        } else {
                            element += `<li class="page-item"><a class="page-link" href="?${currentQuery}&page=${i}">${i}</a></li>`;
                        }
                    }
                }
                return element;
            } else {
                for (let i = 1; i <= Math.min(10, maxSize); i++) {
                    if (i === size) {
                        element += `<li class="page-item"><a class="page-link active" href="?${currentQuery}&page=${i}">${i}</a></li>`;
                    } else {
                        element += `<li class="page-item"><a class="page-link" href="?${currentQuery}&page=${i}">${i}</a></li>`;
                    }
                }
                return element;
            }
        }

        //---------------------------------- Filters ------------------------------------

        // Sidebar and Offcanvas Category Filter
        let filtersSidebar = document.getElementById('filtersSidebar')
        renderFilter(filtersSidebar)
        let filtersOffcanvas = document.getElementById('filtersOffcanvas')
        renderFilter(filtersOffcanvas)

        function renderFilter(filters) {
            let accordion = document.createElement('div')
            accordion.classList.add('accordion')
            accordion.setAttribute('id', 'accordionExample')

            for (let i = 0; i < Object.keys(characterSchema).length; i++) {
                accordion.innerHTML +=
                    `
            <div class="accordion-item">
                <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}" aria-expanded="false" aria-controls="collapse${i}">
                    ${Object.keys(characterSchema)[i]}
                </button>
                </h2>
                <div id="collapse${i}" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
                <div class="accordion-body">
                    ${filtersCheckbox(Object.keys(characterSchema)[i])}
                </div>
                </div>
            </div>
            `
            }
            filters.appendChild(accordion)
        }

        function filtersCheckbox(schemaElement) {
            let checkboxes = ''

            characterSchema[schemaElement].forEach(parameter => {
                checkboxes += `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${parameter}" id="${schemaElement}">
                <label class="form-check-label" for="${parameter}">
                    ${parameter}
                </label>
            </div>
        `
            })

            return checkboxes
        }

        document.getElementById('filterButtonSidebar').addEventListener('click', filterCategories)
        document.getElementById('filterButtonOffcanvas').addEventListener('click', filterCategories)

        function filterCategories() {
            let activeCheckbox = {}
            let checkboxes = document.querySelectorAll('input[type="checkbox"]:checked')
            checkboxes.forEach(checkbox => {
                let schemaElement = checkbox.id
                let parameter = checkbox.value
                if (!activeCheckbox[schemaElement]) {
                    activeCheckbox[schemaElement] = [parameter]
                } else {
                    activeCheckbox[schemaElement].push(parameter)
                }
            })

            let urlParams = new URLSearchParams()
            for (let key in activeCheckbox) {
                urlParams.set(key, activeCheckbox[key].join('&'))
            }
            let urlString = window.location.pathname + '?' + urlParams.toString()
            urlString = urlString.replace(/%26/g, '&')
            window.location.href = urlString
        }

        // Search Filter
        document.getElementById('searchButton').addEventListener('click', filterSearch);
        document.getElementById('searchInput').addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                filterSearch();
            }
        });
        function filterSearch() {
            let searchInput = document.getElementById('searchInput').value;
            let urlParams = new URLSearchParams(window.location.search);
            urlParams.set('name', searchInput);
            let newUrl = window.location.pathname + '?' + urlParams.toString();
            window.location.href = newUrl;
        }

        //Favorite Filter and Local Storage Save
        function favoriteToggle(id) {
            const i = favorites.indexOf(id.toString());
            if (i !== -1) {
                favorites.splice(i, 1);
            } else {
                favorites.push(id.toString());
            }
            localStorage.setItem('favorites', JSON.stringify(favorites));
            console.log("Elementos favoritos:", favorites);

            renderCharacterCards(responseData, favorites);
            displayFavoriteCharacters();

            const allCharacters = document.querySelectorAll('[id^="favoriteButton-"]');
            allCharacters.forEach(character => {
                const characterId = character.getAttribute('data-value');
                if (favorites.includes(characterId)) {
                    character.classList.add('favorite');
                } else {
                    character.classList.remove('favorite');
                }
            });
        }

        renderCharacterCards(responseData, favorites)

    })

async function fetchCharacterData(id) {
    try {
        const response = await fetch(`https://rickandmortyapi.com/api/character/${id}`);
        if (response.ok) {
            const characterData = await response.json();
            return characterData;
        }
        throw new Error('Network response was not ok.');
    } catch (error) {
        console.error('Error fetching character data:', error);
    }
}


async function displayFavoriteCharacters() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    const favoriteCardsContainer = document.getElementById('favoriteCards');
    favoriteCardsContainer.innerHTML = '';
    for (const id of favorites) {
        const characterData = await fetchCharacterData(id);

        if (characterData) {

            const card = document.createElement('div');
            card.classList.add('col-md-4', 'mb-4');
            card.innerHTML = `
                    <div class="card">
                        <img src="${characterData.image}" class="card-img-top" alt="${characterData.name}">
                        <div class="card-body">
                            <h3 class="card-title mb-4 text-center">${characterData.name}</h5>
                            <p class="card-text">Origin: ${characterData.origin.name}</p>
                            <p class="card-text">Status: ${characterData.status}</p>
                            <p class="card-text">Species: ${characterData.species}</p>
                            <p class="card-text">Gender: ${characterData.gender}</p>
                        </div>
                    </div>
                `;
            const removeButton = document.createElement('button');
            removeButton.classList.add('btn', 'btn-danger', 'btn-sm', 'mt-2', 'col-12');
            removeButton.setAttribute('data-value', id);
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', function () {
                removeFavoriteCharacter(id);
                displayFavoriteCharacters();
            });
            card.querySelector('.card-body').appendChild(removeButton);
            favoriteCardsContainer.appendChild(card);

        }
    }
}

function removeFavoriteCharacter(idToRemove) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const indexToRemove = favorites.indexOf(idToRemove.toString());
    if (indexToRemove !== -1) {
        favorites.splice(indexToRemove, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
}

window.addEventListener('DOMContentLoaded', () => {
    displayFavoriteCharacters();
});