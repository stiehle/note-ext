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
const LOCAL_STORAGE_KEY_SETUP = "notesApp-color";

let notesList = [];

loadSetupFromLocalStorage();
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
          <div class="note-entry-colorbar" style="background-color: ${element.colorbar}">
            <div class="icon-small">${element.id}</div>
              <div class="icon-menu"></div>
                <div class="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>          
            <div class="note-title">${escapeHtml(element.title)}</div>
        <div class="note-content-teaser">${escapeHtml(element.content)}</div>  
        <div class="note-date">${new Date(element.lastUpdated).toLocaleString("de-DE")}</div> 
      </div>`;
  });

  notesListEl.innerHTML = html;
  const notesListElListener = document.querySelectorAll(".note-entry");
  notesListElListener.forEach((element) => {
    element.addEventListener("click", selectedNoteEntry);

    const noteEntryColorbarEl = element.querySelector(".note-entry-colorbar");
    noteEntryColorbarEl.setAttribute("data-id", `${element.getAttribute("data-id")}`);

    noteEntryColorbarEl.addEventListener("click", noteEntryColorbar);
  });
}

function noteEntryColorbar(e) {
  const element = e.currentTarget;

  const subMenuEl = element.querySelector(".sub-menu");
  if (subMenuEl) return;

  const colors = colorThemes.palette.standard;

  let html1 = `
  <div tabindex=-1 class="sub-menu"> 
    <div class="sub-menu-title">Farbe wählen</div>  
      <div class="sub-menu-color">`;

  let html2 = "";

  colors.forEach((color) => {
    html2 += `<div class="sub-menu-color-box" style="background-color: ${color}" data-color="${color}"></div> `;
  });

  let html3 = `
      </div>
    <div class="sub-menu-footer sub-menu-title">mehr Farben ...</div> 
    <div class="sub-menu-more-colors"></div>
  </div> 
  `;

  element.innerHTML += html1 + html2 + html3;

  const subMenu = element.querySelector(".sub-menu");
  subMenu.focus();
  subMenu.addEventListener("focusout", checkToRemoveSubMenu);

  const moreColors = element.querySelector(".sub-menu-footer");
  moreColors.addEventListener("click", moreSubMenuColors);
  element.classList.add("active-sub-menu");
}

function moreSubMenuColors(e) {
  e.stopPropagation();
  let html = "";

  const numberOfColors = Object.keys(allStandardColors).length;
  const startPositionColors = 12;
  const moreColors = 32;
  const moreColorsSpacing = Math.floor((numberOfColors - startPositionColors) / moreColors);

  for (let i = 0; i < moreColors; i++) {
    let colorNumber = i * moreColorsSpacing;
    let color = allStandardColors[Object.keys(allStandardColors)[colorNumber + startPositionColors]];

    html += `<div class="sub-menu-color-box" style="background-color: ${color}" data-color="${color}"></div> `;
  }

  const colorBox = getStillSelectetObject().querySelector(".sub-menu-more-colors");
  colorBox.innerHTML = html;

  const subMenuPosition = getStillSelectetObject().querySelector(".sub-menu");
  subMenuPosition.style.top = "130px";
}

function getStillSelectetObject() {
  const element = document.querySelector(".note-entry.selected");
  return element;
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
  const el = e.currentTarget.getAttribute("data-id");
  deleteAllSelections();
  e.currentTarget.classList.add("selected");
  const findNote = notesList.find((note) => note.id === Number(el));

  if (e.target.classList.contains("sub-menu-color-box")) {
    const color = e.target.getAttribute("data-color");
    findNote.colorbar = color;

    showNotesList();
  }

  const colorbarEl = e.currentTarget.querySelector(".note-entry-colorbar");

  if (colorbarEl.classList.contains("active-sub-menu")) {
    colorbarEl.classList.remove("active-sub-menu");
    colorbarEl.classList.add("stop-action");
  } else if (!colorbarEl.classList.contains("stop-action")) {
    titleInputEl.value = findNote.title;
    contentInputEl.value = findNote.content;
    switchDisplay("text");
  } else {
    if (!colorbarEl.querySelector(".sub-menu")) {
      colorbarEl.classList.remove("stop-action");
    }
  }

  saveToLocalStorage();
}

function deleteAllSelections() {
  const elements = document.querySelectorAll(".note-entry.selected");

  elements.forEach((select) => {
    select.classList.remove("selected");
  });
}

function checkToRemoveSubMenu() {
  const elements = document.querySelectorAll(".sub-menu");

  elements.forEach((select) => {
    if (select) {
      select.remove();
    }
  });
}

function deleteNoteEntry() {
  const element = document.querySelector(".note-entry.selected");
  if (element === null) return;

  const note = getStillSelcetedNote();

  const filteredNotesList = notesList.filter((element) => {
    return element !== note;
  });

  notesList = filteredNotesList;

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

  if (!document.querySelector(".setup-content")) {
    notesApp.insertAdjacentHTML("beforeend", `<div class="setup-content"></div>`);
  }

  const html1 = `
  <div class="title-and-save">
    <button class="back">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
    </button>
  </div>
  <div class="command-wrapper"></div>
    <h2 id="title-input">Farbpalette wählen:</h2>  
  </div>    
  `;

  const html2 = `
  <div class="color-wrapper">    
  `;

  let html3 = "";

  Object.keys(colorThemes.palette).forEach((color) => {
    if (color.includes("color")) {
      html3 += `<div class="color-palette-wrapper" data-color="${color}">`;
      colorThemes.palette[color].forEach((colorNumbers) => {
        html3 += `<div class="color-piece" style="background-color: ${colorNumbers}"></div>`;
      });
      html3 += `</div>`;
    }
  });

  const html4 = ` 
  </div>
`;

  const setupContent = document.querySelector(".setup-content");
  setupContent.innerHTML = html1 + html2 + html3 + html4;

  const backButtonEl = setupContent.querySelector(".back");
  backButtonEl.addEventListener("click", goBack);

  const colorWrapper = setupContent.querySelectorAll(".color-palette-wrapper");
  colorWrapper.forEach((colorPalette) => {
    const colorP = colorPalette.getAttribute("data-color");
    colorPalette.addEventListener("click", () => chooseColor(colorP));
  });

  switchDisplay("setup");
}

function chooseColor(palette) {
  const root = document.querySelector(":root");

  root.style.setProperty("--color-main", colorThemes.palette[palette][0]);
  root.style.setProperty("--color-font", colorThemes.palette[palette][1]);
  root.style.setProperty("--color-background", colorThemes.palette[palette][2]);
  root.style.setProperty("--color-other", colorThemes.palette[palette][3]);
  root.style.setProperty("--color-main-font", colorThemes.palette[palette][0]);

  if (palette === "color9" || palette === "color10") {
    root.style.setProperty("--color-main-font", colorThemes.palette[palette][1]);
  }
  saveSetupToLocalStorage(palette);
}

function saveSetupToLocalStorage(setupInfo) {
  localStorage.setItem(LOCAL_STORAGE_KEY_SETUP, JSON.stringify(setupInfo));
}

function loadSetupFromLocalStorage() {
  const setup = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_SETUP));

  if (setup !== null) {
    chooseColor(setup);
  }
}

function escapeHtml(unsafe) {
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
