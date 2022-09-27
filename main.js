const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovie = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')


//過濾符合keyword的電影
function searchFormSubmitted(event) {
  event.preventDefault()
  const keyWord = searchInput.value.trim().toLowerCase()
  //  if (!keyWord.length) {
  //   return alert('Please Enter A Valid String')
  //  }

  //迴圈法
  //  for (let movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyWord)) {
  //     filteredMovie.push(movie)
  //   }
  //  }
  //filter法
  filteredMovie = movies.filter(movie =>
    movie.title.toLowerCase().includes(keyWord)
  )

  if (filteredMovie.length === 0) {
    return alert(`Cannot find movies with keyword：${keyWord}`)
  }

  renderPaginator(filteredMovie.length)
  renderMovieList(getMoviesByPage(1))
}

//顯示特定電影詳細資訊
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    console.log(data)
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date：' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-image" class="img-fluid">`
  })
}

//渲染電影清單頁面
function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // title, image
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}

//輸入page，會回傳該頁面的12部電影
function getMoviesByPage(page) {
  const data = filteredMovie.length ? filteredMovie : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE

  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

//將電影加入收藏清單
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)
  if (list.some(movie => movie.id === id)) {
    return alert('此電影已經在收藏清單中')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}


function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPage; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
  console.log(numberOfPage)
}

//監聽清單的點擊事件
dataPanel.addEventListener('click', function onPanelClick(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
    console.log(event.target.dataset.id)
  }
})

//監聽分頁器的點擊事件
paginator.addEventListener('click', function (event) {
  const target = event.target
  if (target.tagName !== 'A') return
  const page = Number(target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})

searchForm.addEventListener('submit', searchFormSubmitted)
//小樂趣：綁定監聽事件為輸入
// searchForm.addEventListener('input', searchFormSubmitted)


//取得所有電影組成之陣列資料
axios.get(INDEX_URL).then((response) => {
  // console.log(response.data.results)
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(1))
})
  .catch((err) => console.log(err))

