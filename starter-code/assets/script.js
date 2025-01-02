"use strict";

// SELECTORS
const body = document.querySelector("body");
const toggleBoxes = document.querySelectorAll(".toggle-box");
const checkboxes = document.querySelectorAll(
  ".toggle-box input[type='checkbox']"
);
const dropdownMenu = document.querySelector(".dropdownMenu");
const dropdownIcon = document.querySelector(".dropdownMenu svg");
const fontOptions = document.querySelector(".font--options");
const emptyFieldErrorMsg = document.querySelector(".error--msg");
const fontFamilyOptions = document.querySelector(".font--options");
const displaySelectedFont = document.querySelector(".displaySelectedFont");
const search__field = document.getElementById("search__field");
const search__btn = document.querySelector(".search__btn");
const mainContent = document.querySelector(".content");
const spinner = document.querySelector(".spinner");

let globalmarkup = "";

// DARK AND LIGHT THEME FUNCTIONALITY
toggleBoxes.forEach((toggleBox) => {
  toggleBox.addEventListener("click", () => {
    let toggleBullet = toggleBox.querySelector(".circle");
    let checkbox = toggleBox.querySelector("input[type='checkbox']");
    if (checkbox.checked) {
      toggleBullet.style.left = "20px";
      document.body.classList.add("dark-theme");
    } else {
      toggleBullet.style.left = "0px";
      document.body.classList.remove("dark-theme");
    }
  });
});

// CHANGE FONT FAMILY BASED ON USERS CHOICE
const renderFontFamily = (e) => {
  const fontOption = e.target.closest("h3").textContent;
  if (!fontOption) return;
  displaySelectedFont.textContent = fontOption;
  if (fontOption === "Sans Serif") {
    body.style.fontFamily = "Inter, sans-serif";
  }
  if (fontOption === "Serif") {
    body.style.fontFamily = "Lora, serif";
  }
  if (fontOption === "Mono") {
    body.style.fontFamily = "Inconsolata, monospace";
  }
};

const inputValidation = () => {
  if (search__field.value === "") {
    emptyFieldErrorMsg.classList.remove("hidden");
    search__field.style.border = "1px solid var(--bright-pink)";
  } else {
    emptyFieldErrorMsg.classList.add("hidden");
    search__field.style.border = "";
    fetchData(search__field.value);
  }
};

// SPINNER
const displaySpinner = () => {
  mainContent.innerHTML = "";
  spinner.style.display = "block";
};

const removeSpinner = () => {
  spinner.style.display = "none";
};

// RENDER THE WORD, TRANSCRIPTION AND HOW THEY ARE PRONOUNCED
const renderWord = (data) => {
  const audio = data.phonetics.find((element) => element.audio !== "");
  const markup = `
     <div class="wordInfoContainer">
        <div class="word">
          <h1 class="title">${data.word}</h1>
          <p class="transcription">${data.phonetic ? data.phonetic : ""}</p>
        </div>
        <div class="playbox ${audio !== undefined ? audio : "hidden"}"">
            <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
              <g fill-rule="evenodd">
                <circle cx="37.5" cy="37.5" r="37.5" fill="#a445ed" fill-opacity=".25" />
                <path d="M29 27v21l21-10.5z" />
              </g>
            </svg>
            ${audio ? `<audio src="${audio.audio}"></audio>` : ""}
        </div>
      </div>
    `;
  mainContent.insertAdjacentHTML("afterbegin", markup);

  // PLAY AUDIO
  const play = mainContent.querySelector(".playbox");
  play.addEventListener("click", () => {
    document.querySelector("audio").play();
  });
};

// RENDER SOURCE URL
const renderSource = (sourceUrl) => {
  const markup = `
  <div class="line"></div>
  <div class="source hidden">
   <p class="sourceWord">Source</p>
   <div class="sourceUrl">
     <a href='${sourceUrl}'>${sourceUrl}</a>
     <img src="/starter-code/assets/images/icon-new-window.svg">
   </div>
 </div>
  `;
  mainContent.insertAdjacentHTML("beforeend", markup);
};

// RENDER MEANINGS
const renderMeanings = (data) => {
  data.meanings.forEach((meaning) => {
    const markup = `
      <div class="nounInfoContainer">
        <div class="part-of-speech__Title">
          <h3>${meaning.partOfSpeech}</h3>
          <div class="line"></div>
        </div>
         <p class="definitionPanel">Meaning</p>

      </div>
`;
    globalmarkup = markup;

    meaning.definitions
      .map((el) => {
        const meaningMarkup = `
         <div class="nounInfo">
            <ul>
              <li>${el.definition}</li>
              ${el.example ? `<p class="sentence">"${el.example}"</p>` : ""}
            </ul>
          </div>
    `;

        globalmarkup += meaningMarkup;
      })
      .join("");

    let synonym_markup = `
            <p class="anotherWord  ${
              meaning.synonyms.length === 0 ? "hidden" : meaning.synonyms
            }">Synonmys ${meaning.synonyms
      .map((el) => {
        return `<span class="synonymWords">${el}</span>`;
      })
      .join(", ")}
            </p>
`;

    let antonym_markup = `
    <p class="anotherWord ${
      meaning.antonyms.length === 0 ? "hidden" : meaning.antonyms
    }">Antonyms  ${meaning.antonyms
      .map((el) => {
        return `<span class="synonymWords">${el}</span>`;
      })
      .join(", ")}
    </p>
    `;
    globalmarkup += synonym_markup;
    globalmarkup += antonym_markup;
    mainContent.insertAdjacentHTML("beforeend", globalmarkup);

    getSynonyms();
  });
};

const getSynonyms = async () => {
  const synonymWord = await document.querySelectorAll(".synonymWords");
  synonymWord.forEach((word) => {
    word.addEventListener("click", () => {
      search__field.value = word.textContent;
      inputValidation();
    });
  });
};

// RENDER ERROR MESSAGE
const renderError = (data) => {
  console.log(data.title);
  const markup = `
      <div class="errorMessage">
        <img src="/starter-code/assets/images/emoji.png" alt="Confused Emoji">
        <h3>${data.title}</h3>
        <p>${data.message} ${data.resolution}</p>
      </div>
`;
  mainContent.insertAdjacentHTML("afterbegin", markup);
};

const fetchData = async (word) => {
  try {
    displaySpinner();

    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    const data = await res.json();

    if (!res.ok) throw new Error(JSON.stringify(data));
    mainContent.innerHTML = "";
    removeSpinner();

    // 1) RENDER WORD
    renderWord(data[0]);

    // 2) RENDER MEANINGS
    renderMeanings(data[0]);

    // 3) RENDER SOURCE URL
    renderSource(data[0].sourceUrls[0]);
  } catch (error) {
    mainContent.innerHTML = "";
    removeSpinner();
    const data = JSON.parse(error.message);
    console.error(data);
    renderError(data);
  }
};

// BUTTONS EVENT
fontFamilyOptions.addEventListener("click", renderFontFamily);
dropdownMenu.addEventListener("click", () => {
  fontOptions.classList.toggle("active");
  dropdownIcon.classList.toggle("rotate");
});
search__btn.addEventListener("click", inputValidation);
search__field.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    inputValidation();
  }
});

