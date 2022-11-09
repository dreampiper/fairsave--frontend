const c = require("../img/1.png");

const buttonIds = ["show", "remove"];
const buttons: { [key: string]: HTMLButtonElement } = {};
const imageHolder = document.getElementById("image") as HTMLDivElement;

buttonIds.forEach((id) => {
  buttons[id] = document.getElementById(id) as HTMLButtonElement;
});

buttons.show.onclick = async () => {
  const elem = document.createElement("img");
  imageHolder.appendChild(elem);
  elem.src = c;
  elem.setAttribute("width", "1024");
  elem.setAttribute("alt", "DreamUp");
};

buttons.remove.onclick = async () => {
  while (imageHolder.firstChild) {
    imageHolder.removeChild(imageHolder.firstChild);
  }
};
export {};
