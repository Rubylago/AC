const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []       //準備一個空陣列接全部的電影清單
let filteredMovies = [] //拿來放符合搜尋結果的電影陣列
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const MOVIES_PER_PAGE = 12
let nowMode = 'card'  //全域變數，紀錄現在是什麼樣式
let page = 1          //全域變數，紀錄現在正在第幾頁
const modePanel = document.querySelector('#change-mode')

axios
  .get(INDEX_URL)
  .then((response) => {   // 用展開運算子把response.data.results物件內容一一push到movies陣列中
    movies.push(...response.data.results)
    // console.log(movies)           //得到有80個物件的陣列
    renderPagination(movies.length)  //呼叫分頁器函式
    renderMovieList(getMoviesByPage(1))   //調用顯示電影清單函式
  }).catch((error) => {
    console.log(error)
  })

//監聽器 more按鈕-顯示更多資料
dataPanel.addEventListener('click', function onPanelClick(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
    //我討厭bootstrap。
  } else if (event.target.matches('.btn-add-favorite')) {
    //抓新增按鈕的id，傳入function addToFavorite裡面
    addToFavorite(Number(event.target.dataset.id))
  }
})

//監聽器 切換版面
modePanel.addEventListener('click', function (event) {
  const mode = event.target.dataset.mode
  nowMode = mode  //更新全域變數
  renderMovieList(getMoviesByPage(page))
})

//監聽器 搜尋框的submit按鈕 
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault() //停止瀏覽器預設事件(這裡是綁在form上，所以form的所有預設事件都會停掉)
  const keyword = searchInput.value.trim().toLowerCase()
  if (keyword.length === 0) {
    return alert('請輸入內容')
  }

  filteredMovies = movies.filter(function (movie) {
    return movie.title.toLowerCase().includes(keyword)
  })
  console.log(filteredMovies)
  if (filteredMovies.length === 0) {
    return alert(`沒有符合關鍵字 ${keyword}的電影`)
  }
  //重設分頁器，依照篩選結果分頁
  renderPagination(filteredMovies.length)
  //預設顯示第 1 頁的搜尋結果
  return renderMovieList(getMoviesByPage(1))
})

//監聽器 分頁
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName === 'A') {
    page = Number(event.target.dataset.page)
    renderMovieList(getMoviesByPage(page))
  }
})

//addToFavorite() - 將使用者點擊的電影傳進local storage清單裡面
function addToFavorite(id) {
  // console.log(id)  //確定有抓到，一步一步debug
  //陣列中的電影清單id===點選+號的電影id，回傳該id，用變數接住該id
  const favoriteMovie = movies.find((movie) => movie.id === id)
  // const favoriteMovie = movies.find(matchId)
  // function matchId(movie) {
  //   return movie.id === id
  // }
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || [] //接住被選進favoriteMovie的電影們
  //先用空陣列避免一開始初始值localStorage.getItem('favoriteMovies')是null，但其實若只用 list = []
  //因為list是在addToFavorite這個函式裡宣告的，所以她每被執行一次就會更新一次，永遠都只會有當下那個電影
  //所以初始的時候用||隔開，新增第一部電影的時候[]內有值不是重點，重點是localStorage裡面存了一個值，
  //未來所有第二三次點的list都會存進localStorage的紀錄裏面，不會隨著function更新。
  //另外一種做法就是存在最外面的全域中，但這樣就沒有辦法讓使用者的本地儲存紀錄資料，也就是使用者只要更新一次瀏覽器他原本儲存的內容就會消失了
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }

  //list的主要目的是要把localStorage的內容拿出來重複使用，比如加上判斷限制等等

  list.push(favoriteMovie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//整頁電影清單-card/list
function renderMovieList(data) {
  if (nowMode === 'card'){
    let rowHTML = ""
    data.forEach((item) => {
      rowHTML += `
      <div class="col-sm-3">    
        <div class="mb-2 mt-2">         
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="movie poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movieModal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
      `
    });
    dataPanel.innerHTML = rowHTML
  } else if (nowMode === 'list'){
    let rowHTML = ""
    data.forEach((item) => {
      rowHTML += `
      <div class="card" style="flex-direction: row; justify-content: space-between;">
                <div>
                  <h5 class="card-title" style="margin: 15px;">${item.title}</h5>
                </div>
                <div class="btn">
                 <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movieModal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
                </div>
              </div>
      `
    });
    dataPanel.innerHTML = rowHTML
  }

}


//計算分頁器的分頁數
function renderPagination(amount) {
  //計算總頁數= 無條件進位(電影數量/每頁數量)
  const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE)

  //用總頁數製作innerHTML
  let rawHTML = ''
  for (let page = 1; page <= numberOfPage; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
  `
  }
  //放回HTML
  paginator.innerHTML = rawHTML
}

//跳出電影細節
function showMovieModal(id) { 
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImg = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  
  axios
    .get(INDEX_URL + id)     
    .then(function (response) {    
      const data = response.data.results
      modalTitle.innerText = data.title
      modalImg.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid"> `
      modalDate.innerText = 'Release date: ' + data.release_date
      modalDescription.innerText = data.description
    }).catch(function (error) {    
      console.log(error)
    })
}

//分頁器顯示內容  回傳page該頁面要顯示的電影陣列
function getMoviesByPage(page) {
  //startIndex
  const startIndex = MOVIES_PER_PAGE * (page - 1)
  //有沒有篩選陣列?  有的話優先顯示篩選陣列的結果
  const data = filteredMovies.length>0 ? filteredMovies : movies
  //回傳無論是movies陣列還是篩選後的filteredMovies陣列都適用的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}
