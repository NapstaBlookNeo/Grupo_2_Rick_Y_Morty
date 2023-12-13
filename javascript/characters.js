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
        data = responseData
        let characterCards = document.getElementById("characterCards")
        for (let i = 0; i < data.results.length; i++) {
            let card = document.createElement("div")
            card.classList.add("col-12", "col-lg-4", "my-2")
            card.innerHTML = `
                <div class="card">
                    <img src="${data.results[i].image}" class="card-img-top" onerror="this.src="images/default.png"">
                    <div class="card-body">
                        <h3 class="card-title mb-4 text-center">${data.results[i].name}</h3>
                        <p class="card-text">Origin: ${data.results[i].origin.name}</p>
                        <p class="card-text">Specie: ${data.results[i].species}</p>
                        <p class="card-text">Gender: ${data.results[i].gender}</p>
                        <p class="card-text">Status: ${data.results[i].status}</p>
                    </div>
                </div>
            `
            characterCards.appendChild(card)
        }

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

        // Filters
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

        document.getElementById('searchButton').addEventListener('click', filterSearch);
        document.getElementById('searchInput').addEventListener('keypress', function(event) {
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
    })

