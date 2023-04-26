const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = [] // 使用const代表希望movies的內容維持不變，其他人閱讀到 const movies時，也會意識到 movies 裡面放的是不會被隨便更動的資料。
let filteredMovies = []
let currentPage = 1
let input = false

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const modeSwitch = document.querySelector('#mode-switch')

function renderMovieList(data) { // 不使用movies的原因：增加函式的可用性，不只跟movies綁在一起
  let rawHTML = ''

  data.forEach((item) => {
    rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="movie poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-success btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
  })

  dataPanel.innerHTML = rawHTML
};

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE) // Math.ceil 無條件進位

  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>` // 要綁在a（超連結）上面
  }

  paginator.innerHTML = rawHTML
}

// show 12 movies every page
function getMoviesByPage(page) {
  // 下面的函式翻譯：如果filteredMovies是有長度的，那麼顯示filteredMovies；若否，則顯示movies
  const data = filteredMovies.length ? filteredMovies : movies

  // page 1 => movies 0-11
  // page 2 => movies 12-23
  // page 3 => movies 24-35
  // ...

  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) { // 抓id，因為不會重複
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios
    .get(INDEX_URL + id)
    .then(response => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release Date: ' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `
      <img src="${POSTER_URL + data.image}">
      `
    })
}

function addToFavorite(id) {

  function isMovieIdMatched(movie) { // 如果id符合的話
    return movie.id === id
  }
  const movie = movies.find(isMovieIdMatched) // find跟filter很像，參數一樣是給一個函式

  // 可以改寫成以下的箭頭函式
  //  const movie = movies.find((movie) => movie.id === id)

  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || [] // 我想要||左側的東西，如果沒有的話，就給我右側的東西（左邊為優先）
  // 因為getItem的缺點是只能抓字串，所以要用JSON.parse 把字串變成JS陣列或物件

  if (list.some((movie) => movie.id === id)) {
    return alert('The movie is already in the list!')
  } else {
    alert(`${movie.title} is added successfully!`)
  }

  list.push(movie)

  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {

  // 如果我點擊的不是 <a></a> 的話，這個function就結束
  if (event.target.tagName !== 'A') return

  currentPage = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(currentPage))
})

searchForm.addEventListener('input', function onSearchFormInputted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase() // 去頭去尾&全部變成小寫

  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  input = true
  currentPage = 1

  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(currentPage))

  if (filteredMovies.length === 0) {
    dataPanel.innerHTML = ''
  }
})

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(currentPage))
  })
  .catch((err) => console.log(err))