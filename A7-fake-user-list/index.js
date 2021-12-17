const Basic_URL = 'https://lighthouse-user-api.herokuapp.com/api/v1' //主機位置
const Index_URL = Basic_URL + '/users/'  //所有人
// Show_URL = Index_URL + Id    //單一人
const dataPanel = document.querySelector('#data-panel') // 卡片要塞進來的位置
const all = [] //宣告一個空陣列放所有人
let nowPage = 1
const perPage = 18
const paginationUL = document.querySelector('#pagination')
const paginationNav = document.querySelector('#paginationNav')
const dataSearchInput = document.querySelector('.data-search-input')        //搜尋框
const searchBtn = document.querySelector('#data-search-button')             //search按鈕
let searchFriends = []       //放搜尋的內容
const modal = document.querySelector('#exampleModal')   //整個modal

//綁監聽器在dataPanel上，抓點擊事件，跳出單人modal資訊
dataPanel.addEventListener('click', function clickAPerson(event) {
  let target = event.target
  if (target.parentElement.matches('.clickableCard')) {  //抓父層，如果是clickableCard的一部分
    // console.log(target.parentElement.dataset.id)     //抓出id
    let id = target.parentElement.dataset.id
    showModal(id) //客製化單人modal資訊
  } else if (target.closest(".avatar")) {
    let id = target.parentElement.dataset.id
    showModal(id)
  }
})

// 新增所有人物資料
function addNewPeople(data) {
  let newHTML = ''
  data.forEach(function add(item) {
    newHTML += `
        <div class="col-sm-2 mt-2 avatar">
          <div role="button" class="card clickableCard" data-bs-toggle="modal" data-bs-target="#exampleModal" data-id="${item.id}">
            <img src="${item.avatar}" class="card-img-top" alt="...">
            <h5 class="card-title" style="text-align: center;">${item.name}</h5>
          </div>
        </div>
  `
  })
  dataPanel.innerHTML = newHTML
}

//客製化單人modal資訊
function showModal(id) {
  const modalName = document.querySelector('#modal-name') //modal名字
  const modalImg = document.querySelector('#modal-img') // img
  const modalInfo = document.querySelector('#modal-info') //modal資料
  let Show_URL = Index_URL + id
  // console.log(Show_URL)  //抓到單人資料

  axios
    .get(Show_URL)
    .then(function (response) {
      // console.log(response.data.name)
      modalName.innerText = response.data.name
      modalImg.innerHTML = `<img src="${response.data.avatar}" class="card-img-top" alt="...">`
      modalInfo.innerHTML = `
      gender: ${response.data.gender}</br>
      birthday: ${response.data.birthday}</br>
      age: ${response.data.age}</br>
      email: ${response.data.email} </br>
       <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-id="${response.data.id}" data-bs-dismiss="modal" >加入最愛</button>
      </div>
      `
    }).catch(function (error) {
      console.log(error)
    })
}

//A11: 你的社群名單：手刻功能 - 搜尋好友功能、加入最愛清單、分頁器

searchBtn.addEventListener('click', function onSearchSubmitted(event) {
  // console.log(event.target)  //有抓到，因為沒有要送出表單所以這裡沒有用form跟submit
  const keyword = dataSearchInput.value.trim().toLowerCase()

  searchFriends = all.filter(function (avatar) {
    return avatar.name.toLowerCase().includes(keyword)
  })

  if (searchFriends.length === 0) {       //簡易提醒請大家好好輸入內容
    alert('查無此人')
    searchFriends = []
    addNewPeople(getAvatarByPage(1))
  } else if (keyword.trim().length === 0) {
    alert('請輸入內容!')
    searchFriends = []
    addNewPeople(getAvatarByPage(1))
  } else {
    getPaginationPage(searchFriends)   //分頁器重新數有幾頁
    addNewPeople(getAvatarByPage(1))   //重新渲染畫面
  }
})

//在搜尋欄放監聽器
dataSearchInput.addEventListener('input', function onInput(event) {
  const inputValue = event.target.value
  if (inputValue){
    searchFriends = all.filter(function (avatar) {
      return avatar.name.toLowerCase().includes(inputValue)
    })
    getPaginationPage(searchFriends)   //分頁器重新數有幾頁
    addNewPeople(getAvatarByPage(1))   //重新渲染畫面
  }
})


//在modal放監聽器，如果點到加入最愛按鈕就把那個人加進儲存空間
modal.addEventListener('click', function (event) {
  let target = event.target
  const list = JSON.parse(localStorage.getItem('BFF')) || []   //要存在本地資料的陣列
  if (target.classList.contains('btn')) {
    let ID = Number(target.dataset.id)

    //防止重複名單
    if (list.some(item => item.id === ID)) {
      return alert('已經加過了')
    }

    const favoritFriend = all.find(element => element.id === ID) //拿出來比較的兩個id type要一樣
    list.push(favoritFriend)
    localStorage.setItem('BFF', JSON.stringify(list))
  }
})

function getAvatarByPage(page) {
  let startIndex = (page - 1) * perPage
  let endIndex = startIndex + perPage
  const data = searchFriends.length ? searchFriends : all
  return data.slice(startIndex, endIndex)
}

//製作分頁器頁數
function getPaginationPage(arr) {
  const pageNumbers = Math.ceil(arr.length / perPage)
  let pageHTML = ''
  for (let page = 1; page <= pageNumbers; page++) {
    pageHTML += `
    <li class="page-item">
      <a class="page-link" href="#" data-page="${page}">${page}</a>
    </li>
    `
  }
  paginationUL.innerHTML = pageHTML
}

//監聽器  分頁顯示畫面
paginationNav.addEventListener('click', function paginationOnClicked(event) {
  const target = event.target
  const pageOnClicked = Number(target.innerText)
  nowPage = pageOnClicked
  addNewPeople(getAvatarByPage(pageOnClicked))
})

axios
  .get(Index_URL)
  .then(function (response) {
    all.push(...response.data.results)       //全部推進空陣列中
    getPaginationPage(all)
    addNewPeople(getAvatarByPage(1))
  }).catch(function (error) {
    console.log(error)
  })
