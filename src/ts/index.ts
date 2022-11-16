require("../css/main.css");

/* --------------- Global Vars --------------- */
// Don't try this at work :P.

let cid: string;
let title: string;

const server = "http://localhost:3000";

/* --------------- Get DOM --------------- */

// Inputs.
const inputIds = ["upload", "upload2", "saveBookmarkInput", "getBookmarkInput"];
const inputs: { [key: string]: HTMLInputElement } = {};
inputIds.forEach((id) => {
  inputs[id] = document.getElementById(id) as HTMLInputElement;
});

// Contents e.g div p.
const contentIds = [
  "tutorial",
  "homeButtons",
  "fileUploadStats",
  "fileUploadStats--title",
  "fileUploadStats--progress-bar",
  "fileUploadStats--uploadPercent",
  "findModal",
  "findModalContainer",
  "saveModal",
  "saveModalContainer",
  "view1",
  "view2",
  "imageHolder",
];

const content: { [key: string]: HTMLParagraphElement | HTMLDivElement } = {};
contentIds.forEach((id) => {
  content[id] = document.getElementById(id) as
    | HTMLParagraphElement
    | HTMLDivElement;
});

// Buttons.
const buttonIds = ["find", "bookmark", "getBookmark", "saveBookmark"];
const buttons: { [key: string]: HTMLButtonElement } = {};
buttonIds.forEach((id) => {
  buttons[id] = document.getElementById(id) as HTMLButtonElement;
});

/* --------------- Actions --------------- */

inputs.upload.onchange = () => {
  const file = (inputs.upload.files as FileList)[0];
  initUploadState(file);
  uploadImage(file);
  setImageHolder(file);
};

inputs.upload2.onchange = () => {
  content.view1.style.display = "flex";
  content.view2.style.display = "none";
  const file = (inputs.upload2.files as FileList)[0];
  setImageHolder(file);
  initUploadState(file);
  uploadImage(file);
};

buttons.find.onclick = () => {
  content.findModal.style.display = "flex";
};

buttons.bookmark.onclick = () => {
  content.saveModal.style.display = "flex";
};

buttons.saveBookmark.onclick = (ev) => {
  ev.preventDefault();
  saveBookmark();
};

buttons.getBookmark.onclick = (ev) => {
  ev.preventDefault();
  getBookmark();
};

content.findModal.onclick = () => {
  content.findModal.style.display = "none";
};

content.findModalContainer.onclick = function (ev) {
  ev.stopPropagation();
};

content.saveModal.onclick = () => {
  content.saveModal.style.display = "none";
};

content.saveModalContainer.onclick = function (ev) {
  ev.stopPropagation();
};

/* --------------- Action Handlers --------------- */

function initUploadState(file: File) {
  // Hide #homeButtons.
  content.homeButtons.style.display = "none";

  // Hide #tutorial.
  content.tutorial.style.display = "none";

  // Show #fileUploadStats.
  content.fileUploadStats.style.display = "flex";

  // Get progress.
  const pb = document.querySelector(
    "#fileUploadStats--progress-bar > div"
  ) as HTMLDivElement;
  let progress = parseInt(pb.style.width, 10);
  progress = 0;

  pb.style.width = progress + "%";

  // Set #fileUploadStats values
  content["fileUploadStats--title"].innerHTML = file.name;
  content["fileUploadStats--uploadPercent"].innerHTML = "0%";
}

function uploadImage(file: File) {
  const formdata = new FormData();
  formdata.append("image", file);

  const ajax = new XMLHttpRequest();
  ajax.upload.addEventListener("progress", (ev) => progressHandler(ev), true);
  ajax.onload = function () {
    const response = JSON.parse(this.response) as {
      status: boolean;
      msg: { cid: string; title: string };
    };
    cid = response.msg.cid;
    title = response.msg.title;
  };
  ajax.addEventListener("load", () => navigationHandler(), true);
  ajax.addEventListener("error", () => alert("Upload Failed"), true);
  ajax.addEventListener("abort", () => alert("Upload Aborted"), true);
  ajax.open("POST", server + "/api/upload-image");
  ajax.send(formdata);
}

function progressHandler(ev: ProgressEvent<XMLHttpRequestEventTarget>) {
  const percent = (ev.loaded / ev.total) * 100;

  // Gets the progress bar & updates it.
  const query = "#fileUploadStats--progress-bar > div";
  const pb = document.querySelector(query) as HTMLDivElement;
  pb.style.width = percent + "%";

  // Changes the upload percent
  content["fileUploadStats--uploadPercent"].innerHTML =
    Math.round(percent) + "%";
}

function setImageHolder(file: File) {
  const imageHolder = content.imageHolder;

  while (imageHolder.firstChild) {
    imageHolder.removeChild(imageHolder.firstChild);
  }
  var reader = new FileReader();

  const elem = document.createElement("img");

  elem.title = file.name;

  imageHolder.appendChild(elem);

  reader.onload = function (event) {
    elem.src = event.target.result as string;
  };

  reader.readAsDataURL(file);
}

function navigationHandler() {
  content.view1.style.display = "none";
  content.view2.style.display = "flex";
}

function saveBookmark() {
  const tag = inputs.saveBookmarkInput.value;

  if (tag.length < 2) {
    return alert("tag too short");
  }

  const bookmark = {
    cid,
    title,
    tag,
  };

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookmark),
  };

  fetch(server + "/api/bookmark-image", options)
    .then((data) => {
      if (!data.ok) {
        throw Error("" + data.status);
      }
      return data.json();
    })
    .then((response) => {
      alert("saved");
      console.log(response, "save-bookmark");
    })
    .catch((e) => {
      console.log(e);
    });
}

function getBookmark() {
  const tag = inputs.getBookmarkInput.value;

  if (tag.length < 3) {
    return alert("tag too short");
  }

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tag }),
  };

  fetch(server + "/api/get-bookmarks", options)
    .then((data) => {
      if (!data.ok) {
        throw Error("" + data.status);
      }
      return data.json();
    })
    .then((response: { msg: any[] }) => {
      var target = document.querySelector(".modal .findResult");

      while (target.firstChild) {
        target.removeChild(target.firstChild);
      }

      response.msg.forEach((res) => {
        const template = `
        <a href="https://${res.cid}.ipfs.w3s.link">
        <span>${res.title}</span>
        <span>${new Date(res.createdAt).toDateString()}</span>
        </a>
      `;

        target.insertAdjacentHTML("beforeend", template);
      });

      console.log(response);
    })
    .catch((e) => {
      console.log(e);
    });
}

export {};
