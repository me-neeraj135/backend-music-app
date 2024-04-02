/** @format */

let profileDiv = document.querySelector(`.profile`);
let drpIcon = document.querySelector(`.drp-img`);
let dropDownUl = document.querySelector(`.drop-down`);
let drpImgBox = document.querySelector(`.drpImgBox`);

function dropDown(e) {
  dropDownUl.classList.toggle(`dpBlock`);
  drpImgBox.classList.toggle(`rotate`);
}

profileDiv.addEventListener(`click`, dropDown);
