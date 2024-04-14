const notesListEl = document.querySelector(".notes-list");
const saveButtonEl = document.querySelector(".save-note");
const deleteButtonEl = document.querySelector(".delete-note");
const createNewButtonEl = document.querySelector(".create-new");
const setupButtonEl = document.querySelector(".setup");
const titleInputEl = document.querySelector("#title-input");
const contentInputEl = document.querySelector("#content-input");
const backButtonEl = document.querySelector(".back");

createListeners();

const DISPLAYS = {
  main: "sidebar-wrapper",
  text: "main-content",
  setup: "setup-content",
};

const LOCAL_STORAGE_KEY = "notesApp-notes";

let notesList = [];

loadFromLocalStorage();

switchDisplay();

function createListeners() {
  saveButtonEl.addEventListener("click", saveNoteEntry);
  deleteButtonEl.addEventListener("click", deleteNoteEntry);
  createNewButtonEl.addEventListener("click", createNewText);
  setupButtonEl.addEventListener("click", setup);
  backButtonEl.addEventListener("click", goBack);
}

function saveNoteEntry() {
  if (!checkOfSelectedNote()) {
    createNewNoteEntry();
  }

  saveToLocalStorage();
  switchDisplay();
}

function createNewNoteEntry() {
  if (titleInputEl.value === "") {
    titleInputEl.value = "?";
  }

  if (contentInputEl.value === "") {
    contentInputEl.value = "?";
  }

  notesEntry = {
    id: getNextID(),
    title: titleInputEl.value,
    content: contentInputEl.value,
    lastUpdated: Date.now(),
  };
  notesList.push(notesEntry);

  clearInput();
  showNotesList();
}

function getNextID() {
  const sortedNotesList = notesList.sort((a, b) => {
    return a.id - b.id;
  });

  if (sortedNotesList.at(-1) !== undefined) {
    return sortedNotesList.at(-1).id + 1;
  } else {
    return 0;
  }
}

function showNotesList() {
  const sortedNotesList = notesList.sort((a, b) => {
    return b.lastUpdated - a.lastUpdated;
  });

  let html = "";
  sortedNotesList.forEach((element) => {
    html += `
  <div class="note-entry" data-id="${element.id}">
  <div class="note-entry-colorbar" style="background-color: ${element.colorbar}";">
  <div class="note-entry-iconbar">
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-small">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
  </div>   
  </div> 
  <div class="note-title">${element.title}</div>
  <div class="note-content-teaser">${element.content}</div>  
  <div class="note-date">${new Date(element.lastUpdated).toLocaleString("de-DE")}</div> 
  </div>`;
  });
  // <div class="note-date">${element.lastUpdated} / ${new Date(element.lastUpdated).toLocaleString("de-DE")}</div>

  notesListEl.innerHTML = html;

  const notesListElListener = document.querySelectorAll(".note-entry");

  notesListElListener.forEach((element) => {
    // element.addEventListener("click", () => selectedNoteEntry(element.getAttribute("data-id")));
    element.addEventListener("click", selectedNoteEntry);
    const noteEntryColorbarEl = element.querySelector(".note-entry-colorbar");

    // console.log("colorbar", noteEntryColorbarEl);
    noteEntryColorbarEl.innerHTML += element.getAttribute("data-id");
    noteEntryColorbarEl.setAttribute("data-id", `${element.getAttribute("data-id")}`);
    noteEntryColorbarEl.addEventListener("click", noteEntryColorbar);
  });
}

function noteEntryColorbar(e) {
  this.removeEventListener("click", noteEntryColorbar);

  const element = e.target;

  const colorThemesAll = [
    ...colorThemes.palette.standard,
    ...colorThemes.palette.color0,
    ...colorThemes.palette.color1,
    ...colorThemes.palette.color2,
    ...colorThemes.palette.color3,
    ...colorThemes.palette.color4,
    ...colorThemes.palette.color5,
    ...colorThemes.palette.color6,
  ];

  let html1 = `
  <div class="sub-menu"> 
  <div class="sub-menu-title">Farbe wählen</div>  
  <div class="sub-menu-color">`;

  let html2 = "";

  colorThemesAll.forEach((color) => {
    html2 += `<div class="sub-menu-color-box" style="background-color: ${color};">${color}</div> `;
  });

  let html3 = `</div></div>`;

  element.innerHTML += html1 + html2 + html3;
}

function createNewText() {
  switchDisplay("text");
  clearInput();
}

function clearInput() {
  titleInputEl.value = "";
  contentInputEl.value = "";
  showNotesList();
}

function switchDisplay(display = "main") {
  const notesApp = document.querySelectorAll(".notes-app > div");

  notesApp.forEach((element) => {
    if (element.className === DISPLAYS[display]) {
      element.style.display = "initial";
    } else {
      element.style.display = "none";
    }
  });
}

function goBack() {
  switchDisplay();
  showNotesList();
}

function selectedNoteEntry(e) {
  const el = this.getAttribute("data-id");
  deleteAllSelections();
  this.classList.add("selected");

  const findNote = notesList.find((note) => note.id === Number(el));
  titleInputEl.value = findNote.title;
  contentInputEl.value = findNote.content;

  if (e.target.classList.value !== "note-entry-colorbar" && e.target.classList.value !== "sub-menu-color-box") {
    switchDisplay("text");
  }

  if (e.target.classList.value === "sub-menu-color-box") {
    const colorbar = this.querySelector(".note-entry-colorbar");
    colorbar.style.backgroundColor = e.target.innerHTML;
    findNote.colorbar = e.target.innerHTML;
    saveToLocalStorage();
    clearInput();
    showNotesList();
  }
}

function deleteAllSelections() {
  const elements = document.querySelectorAll(".note-entry.selected");

  elements.forEach((select) => {
    select.classList.remove("selected");
  });
}

function deleteNoteEntry() {
  const element = document.querySelector(".note-entry.selected");
  if (element === null) return;

  note = getStillSelcetedNote();

  const filteredNotesList = notesList.filter((element) => {
    return element !== note;
  });

  notesList = filteredNotesList;
  console.log("NotesList after delete ", notesList);

  clearInput();
  showNotesList();
  saveToLocalStorage();
  switchDisplay();
}

function getStillSelcetedNote() {
  const element = document.querySelector(".note-entry.selected");
  const stillSelectetElement = element.getAttribute("data-id");
  const findNote = notesList.find((note) => note.id === Number(stillSelectetElement));

  return findNote;
}

function checkOfSelectedNote() {
  const element = document.querySelector(".note-entry.selected");

  if (element !== null) {
    const stillSelectetElement = element.getAttribute("data-id");

    const findNote = notesList.find((note) => note.id === Number(stillSelectetElement));
    findNote.title = titleInputEl.value;
    findNote.content = contentInputEl.value;
    findNote.lastUpdated = Date.now();

    clearInput();
    showNotesList();

    return true;
  }
  return false;
}

function saveToLocalStorage() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notesList));
}

function loadFromLocalStorage() {
  const notes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));

  if (notes !== null) {
    notesList = notes;
  }
  showNotesList();
}

function setup() {
  const notesApp = document.querySelector(".notes-app");

  // if (!document.querySelector(".setup-content")) {
  //   document.querySelector(".notes-app").innerHTML += `<div class="setup-content"></div>`;
  // }

  if (!document.querySelector(".setup-content")) {
    const addSetupNode = document.createElement("div");
    addSetupNode.classList.add("setup-content");
    notesApp.appendChild(addSetupNode);
  }

  const html = `
        <div class="title-and-save">
          <button class="back">
          
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div class="command-wrapper">

          </div>
        </div>
        <h2 id="title-input">Farpalette wählen:</h2>
        
      <div class="colorPalette">
      <input type="radio" id="color" name="color" value="color0" />
      <label for="color0">Palette 0</label><br />
      <input type="radio" id="color" name="color" value="color1" />
      <label for="color1">Palette 1</label><br />
      <input type="radio" id="color" name="color" value="color2" />
      <label for="color2">Palette 2</label><br />
      <input type="radio" id="color" name="color" value="color3" />
      <label for="color3">Palette 3</label><br />
      <input type="radio" id="color" name="color" value="color4" />
      <label for="color4">Palette 4</label><br />
      <input type="radio" id="color" name="color" value="color5" />
      <label for="color5">Palette 5</label><br />
      <input type="radio" id="color" name="color" value="color6" />
      <label for="color6">Palette 6</label><br />
      </div>
    
  `;
  const setupContent = document.querySelector(".setup-content");

  setupContent.innerHTML = html;

  const backButtonEl = setupContent.querySelector(".back");
  backButtonEl.addEventListener("click", goBack);

  const choice = setupContent.querySelector(".colorPalette");
  choice.addEventListener("click", () => chooseColor(setupContent));

  switchDisplay("setup");
}

function chooseColor(content) {
  const color = content.querySelectorAll("#color");
  color.forEach((element) => {
    if (element.checked) {
      root = document.querySelector(":root");
      root.style.setProperty("--color-palette-0", colorThemes.palette[element.value][0]);
      root.style.setProperty("--color-palette-1", colorThemes.palette[element.value][1]);
      root.style.setProperty("--color-palette-2", colorThemes.palette[element.value][2]);
      root.style.setProperty("--color-palette-3", colorThemes.palette[element.value][3]);
    }
  });
}
