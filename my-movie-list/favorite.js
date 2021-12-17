const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = JSON.parse(localStorage.getItem('favoriteMovies'))   //從本地資料存儲撈出已經加進去的最愛電影資料並轉成JS可用
const dataPanel = document.querySelector('#data-panel')


//整頁電影清單
function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
      <div class="col-sm-3">    
        <div class="mb-2 mt-2">         
          <div class="card">
            <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="movie poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
      `
  });
  dataPanel.innerHTML = rawHTML
}

//跳出電影細節
function showMovieModal(id) {   //傳入id後就修改modal內容的函式
  const modalTitle = document.querySelector('#movie-modal-title')  //把要改的節點都用變數宣告出來
  const modalImg = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios
    .get(INDEX_URL + id)    //GET什麼API   => GET到的內容是 INDEX_URL + 電影id
    .then(function (response) {   //如果接到就做什麼動作 => API回傳電影資料
      const data = response.data.results
      modalTitle.innerText = data.title
      modalImg.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid"> `
      modalDate.innerText = 'Release date: ' + data.release_date
      modalDescription.innerText = data.description
    }).catch(function (error) {   //如果失敗要做什麼動作
      console.log(error)
    })
}


function removeFromFavorite(id) {
  //先排除初始清單為null的狀況
  if (!movies) return

  const movieIndex = movies.findIndex((movie) => movie.id === id)
  if (movieIndex === -1) return

  movies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovieList(movies)
}

//監聽器綁電影資訊more按鈕
dataPanel.addEventListener('click', function onPanelClick(event) {
  if (event.target.matches('.btn-show-movie')) {
    // console.log(event.target.dataset.id)  //抓到動態事件按鈕，回頭補上動態data-id，就可以點按鈕拿到字串id
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    //抓刪除按鈕的id，傳入removeFromFavorite function  裡面
    removeFromFavorite(Number(event.target.dataset.id))
  }
})


function showMovieModal(id) {   //傳入id後就修改modal內容的函式
  const modalTitle = document.querySelector('#movie-modal-title')  //把要改的節點都用變數宣告出來
  const modalImg = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios
    .get(INDEX_URL + id)    //GET什麼API   => GET到的內容是 INDEX_URL + 電影id
    .then(function (response) {   //如果接到就做什麼動作 => API回傳電影資料
      const data = response.data.results
      modalTitle.innerText = data.title
      modalImg.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid"> `
      modalDate.innerText = 'Release date: ' + data.release_date
      modalDescription.innerText = data.description
    }).catch(function (error) {   //如果失敗要做什麼動作
      console.log(error)
    })

}

function removeFromFavorite(id) {
  if (!movies) return

  const movieIndex = movies.findIndex((movie) => movie.id === id)
  if (movieIndex === -1) return

  movies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovieList(movies)
}

//listen to data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

renderMovieList(movies)