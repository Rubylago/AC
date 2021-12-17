const Basic_URL = 'https://lighthouse-user-api.herokuapp.com/api/v1' //主機位置
const Index_URL = Basic_URL + '/users/'  //所有人
// Show_URL = Index_URL + Id    //單一人
const dataPanel = document.querySelector('#data-panel') // 卡片要塞進來
const all = JSON.parse(localStorage.getItem('BFF'))
const modal = document.querySelector('#exampleModal')   //整個modal

let nowPage = 1
const perPage = 6
const paginationUL = document.querySelector('#pagination')
const paginationNav = document.querySelector('#paginationNav')


addNewPeople(getAvatarByPage(1))
getPaginationPage(all)

//綁監聽器在dataPanel上，抓點擊事件，跳出單人modal資訊
dataPanel.addEventListener('click', function clickAPerson(event) {
  let target = event.target
  if (target.parentElement.matches('.clickableCard')) {  //抓父層，如果是clickableCard的一部分
    // console.log(target.parentElement.dataset.id) //抓出id
    let id = target.parentElement.dataset.id
    showModal(id)
  }
})

//移除收藏，在modal放監聽器，如果點到絕交按鈕就把那個人從儲存空間刪掉
modal.addEventListener('click', function (event) {
  let target = event.target
  if (all.length === 0) return   //初始值防報錯
  if (target.classList.contains('btn')) {
    let ID = Number(target.dataset.id)
    const favoritFriend = all.findIndex(element => element.id === ID) //拿出來比較的兩個id type要一樣
    all.splice(favoritFriend, 1)    //刪掉!
    localStorage.setItem('BFF', JSON.stringify(all))  //覆蓋
  }
  getPaginationPage(all)
  addNewPeople(getAvatarByPage(nowPage))   //重新渲染
})

//客製化單人modal資訊
function showModal(id) {
  const modalName = document.querySelector('#modal-name') //modal名字
  const modalImg = document.querySelector('#modal-img') // img
  const modalInfo = document.querySelector('#modal-info') //modal資料
  let Show_URL = Index_URL + id

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
        <button type="button" class="btn btn-danger" data-id="${response.data.id}" data-bs-dismiss="modal" >絕交謝謝</button>
      </div>
      `
    }).catch(function (error) {
      console.log(error)
    })
}

// 新增人物資料
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

function getAvatarByPage(page) {
  let startIndex = (page - 1) * perPage //0
  let endIndex = startIndex + perPage  //6
  return all.slice(startIndex, endIndex)

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


