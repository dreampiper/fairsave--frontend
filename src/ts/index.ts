const buttonIds = ["alert"];
const buttons: { [key: string]: HTMLButtonElement } = {};

buttonIds.forEach((id) => {
  buttons[id] = document.getElementById(id) as HTMLButtonElement;
});

async function alerter(msg: string) {
  alert(msg);
}

buttons.alert.onclick = async () => {
  alerter("Welcome to Fairsave it works!");
};

export {};
