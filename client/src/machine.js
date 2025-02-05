import { html } from "../node_modules/lit-html/lit-html.js";
import { request } from "./request.js";
import api from "./api.js";
import { contacts } from "./contacts.js";
import renderSpinner from "./spinner.js";

let isEdit = false;

function closeScreenElement(event, className) {
  if (event.target.classList.contains(className)) {
    event.target.classList.add("hidden");
  }
}

//close all opene windows
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const imageEditor = document.querySelector(".image-editor");
    const filesBox = document.querySelector(".files-box");
    const fullScreenBox = document.querySelector(".full-screen-box");
    const screens = [imageEditor, filesBox, fullScreenBox];

    screens.forEach((screen) => {
      if (screen) {
        screen.classList.add("hidden");
      }
    });
  }
});

export async function renderMachine(ctx, next) {
  renderSpinner();
  const accessToken = localStorage.getItem("accessToken");
  let machine;

  try {
    const data = await request(
      api.server + `/api/agro-2000/machines/${ctx.params.id}`
    );

    if (data.status === "success") {
      renderSpinner();
      machine = data.data.machine;
    }
    if (data.status === "fail") {
      renderSpinner();
      throw new Error(data.message);
    }
  } catch (err) {
    alert(err.message);
  }

  const isOwner =
    accessToken && localStorage.getItem("userId") === machine.owner;

  //image editor rendering=======================//
  const editorImages = [];
  const editorVideos = [];

  for (let i = 0; i < machine.images.length + 1; i++) {
    if (machine.images[i]) {
      editorImages.push(html`
        <div class="image-grid-element">
          <img
            src="${api.server}/${machine._id}/photos/${machine.images[i]}"
            alt="${machine.images[i]}"
          />

          <button class="delete-image-btn" @click=${handleDeleteImage} id=${i}>
            <ion-icon name="trash-outline"></ion-icon>
          </button>
        </div>
      `);
    } else {
      editorImages.push(html`
        <div class="image-grid-element">
          <input
            @change="${handleImageFileChange}"
            type="file"
            id=${i}
            name="image"
            accept="image/*"
            style="display: none"
          />

          <button
            class="add-photo-btn"
            type="button"
            onclick="document.getElementById(${i}).click()"
          >
            <ion-icon name="camera-outline"></ion-icon>
          </button>
        </div>
      `);
    }
  }
  // ===========================================

  //vodeos editor rendering=======================//

  for (let i = 0; i < machine.videos.length + 1; i++) {
    if (machine.videos[i]) {
      editorVideos.push(html`
        <div class="video-box image-grid-element">
          <div class="video-container">
            <iframe
              id="youtube-iframe"
              src=${machine.videos[i]}
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>

          ${isOwner
            ? html`
                <button id=${i} @click=${handleDeleteVideo}>
                  <ion-icon name="trash-outline"></ion-icon>
                </button>
              `
            : ""}
        </div>
      `);
    } else {
      if (isOwner) {
        editorVideos.push(html`
          <div class="video-box">
            <div class="video-input">
              <ion-icon name="videocam"></ion-icon>
              <input
                type="text"
                id=${i}
                @change=${handleVideoChange}
                name="video"
                placeholder="видео линк"
              />
            </div>
          </div>
        `);
      }
    }
  }
  // ===========================================================

  const templete = html`
    <div class="machine-stats">
      <div class="machine-photos-main">
        <div class="machine-photo-box">
          <img
            @click=${(e) => {
              const fullscreen = document.querySelector(".full-screen-box");
              const fullScreenPhoto =
                document.querySelector(".full-screen-photo");
              fullscreen.classList.remove("hidden");

              fullScreenPhoto.src = e.target.src;
              fullScreenPhoto.alt = e.target.alt;
              fullScreenPhoto.id = e.target.id;
            }}
            class="machine-main-photo"
            id=${0}
            src="${api.server}/${machine._id}/photos/${machine.images[0]}"
            alt="${machine.images[0]}"
          />

          <ion-icon
            class="photo-left-button"
            name="chevron-back-outline"
            @click=${(e) => scrollMainPhoto("-")}
          ></ion-icon>
          <ion-icon
            class="photo-right-button"
            name="chevron-forward-outline"
            @click=${() => scrollMainPhoto("+")}
          ></ion-icon>
        </div>
        <div class="machine-secondary-photos">
          <div class="machine-photo-scroll-buttons">
            <ion-icon
              name="chevron-back-outline"
              @click=${() => {
                document.querySelector(".machine-photos-scroll").scrollBy({
                  left: -100,
                  behavior: "smooth",
                });
              }}
            ></ion-icon>
            <ion-icon
              name="chevron-forward-outline"
              @click=${() => {
                document.querySelector(".machine-photos-scroll").scrollBy({
                  left: 100,
                  behavior: "smooth",
                });
              }}
            ></ion-icon>
          </div>
          <div class="machine-photos-scroll">
            ${machine.images.map(
              (image, i) =>
                html`
                  <img
                    @click=${onSelectPhoto}
                    id=${i}
                    class="machine-photo"
                    src="${api.server}/${machine._id}/photos/${image}"
                    alt="${image}"
                  />
                `
            )}
          </div>
        </div>
        ${isOwner
          ? html`
              <div class="machine-stats-buttons">
                <button @click=${onPhotoGridClick} class="machine-stats-btn">
                  <ion-icon name="camera-outline"></ion-icon>
                  Снимки
                </button>
                <button @click=${onDocumentsClick} class="machine-stats-btn">
                  <ion-icon name="folder-outline"></ion-icon>
                  Документи
                </button>
              </div>
            `
          : ""}
      </div>

      <div class="machine-details">
        <div class="machine-details-table">
          ${isEdit === true
            ? html`
                <form @submit=${onEdit} id="edit-form">
                  <div class="machine-details-price">
                    <p>цена</p>
                    <input
                      type="number"
                      name="price"
                      .value="${machine.price}"
                    />

                    <select
                      name="currency"
                      id="currency"
                      .value="${machine.currency}"
                    >
                      <option value="BGN">BGN</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div></div>

                  <table>
                    <tr>
                      <td>тип</td>
                      <td>
                        <select name="type" id="type" .value=${machine.type}>
                          <option value="tractor">трактор</option>
                          <option value="harvester">комбайн</option>
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <td>марка</td>
                      <td>
                        <select name="make" id="make" .value=${machine.make}>
                          <option value="Jhon Deere">Jhon Deere</option>
                          <option value="Claas">Claas</option>
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <td>модел</td>
                      <td>
                        <input
                          type="text"
                          name="model"
                          id="model"
                          .value=${machine.model}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>двигател</td>
                      <td>
                        <input
                          type="text"
                          name="engine"
                          id="engine"
                          .value=${machine.details.engine}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>мощност/кс</td>
                      <td>
                        <input
                          type="number"
                          name="horsepower"
                          id="horsepower"
                          .value=${machine.details.horsepower}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>трансмисия</td>
                      <td>
                        <select
                          name="transmission"
                          id="transmission"
                          .value=${machine.details.transmission}
                        >
                          <option value="IVT-autopower">IVT-autopower</option>
                          <option value="Powershift">Powershift</option>
                          <option value="AutoPower">AutoPower</option>
                          <option value="CommandQuad">CommandQuad</option>
                          <option value="DirectDrive">DirectDrive</option>
                          <option value="ElectroIVT">ElectroIVT</option>
                          <option value="SynchroTransmission">
                            SynchroTransmission
                          </option>
                          <option value="PowerQuad-AutoQuad">
                            PowerQuad-AutoQuad
                          </option>
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <td>SCV</td>
                      <td>
                        <input
                          type="number"
                          name="scv"
                          id="scv"
                          .value=${machine.details.scv}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>хидравлична помпа</td>
                      <td>
                        <input
                          type="text"
                          name="hydraulicPumps"
                          id="hydraulicPumps"
                          .value=${machine.details.hydraulicPumps}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>разнмери на предни гуми</td>
                      <td>
                        <input
                          type="text"
                          name="frontTires"
                          id="frontTires"
                          .value=${machine.details.frontTires}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>размери на задни гуми</td>
                      <td>
                        <input
                          type="text"
                          name="rearTires"
                          id="rearTires"
                          .value=${machine.details.rearTires}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>часове</td>
                      <td>
                        <input
                          type="number"
                          name="hours"
                          id="hours"
                          .value=${machine.details.hours}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>статут</td>
                      <td>
                        <input
                          type="status"
                          name="status"
                          id="status"
                          .value=${machine.details.status}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>година</td>
                      <td>
                        <input
                          type="number"
                          name="year"
                          id="year"
                          .value=${machine.details.year}
                        />
                      </td>
                    </tr>
                  </table>

                  <textarea
                    id="description"
                    name="description"
                    placeholder="Информация..."
                    .value=${machine.details.description}
                  ></textarea>
                </form>
              `
            : html`
                <div class="machine-details-price">
                  <span>
                    ${machine.price
                      ? `
                          ${machine.price.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        `
                      : `по договаряне`}
                  </span>
                  <span>${machine.price ? `${machine.currency}` : ""}</span>
                </div>
                <table>
                  <tr>
                    <td>тип</td>
                    <td>${machine.type}</td>
                  </tr>
                  <tr>
                    <td>марка</td>
                    <td>${machine.make}</td>
                  </tr>
                  <tr>
                    <td>модел</td>
                    <td>${machine.model}</td>
                  </tr>
                  <tr>
                    <td>двигател</td>
                    <td>${machine.details.engine}</td>
                  </tr>
                  <tr>
                    <td>мощност/кс</td>
                    <td>${machine.details.horsepower}</td>
                  </tr>
                  <tr>
                    <td>трансмисия</td>
                    <td>${machine.details.transmission}</td>
                  </tr>
                  <tr>
                    <td>SCV</td>
                    <td>${machine.details.scv}</td>
                  </tr>
                  <tr>
                    <td>хидравлична помпа</td>
                    <td>${machine.details.hydraulicPumps}</td>
                  </tr>
                  <tr>
                    <td>размери на предни гуми</td>
                    <td>${machine.details.frontTires}</td>
                  </tr>
                  <tr>
                    <td>размери на задни гуми</td>
                    <td>${machine.details.rearTires}</td>
                  </tr>
                  <tr>
                    <td>часове</td>
                    <td>${machine.details.hours}</td>
                  </tr>
                  <tr>
                    <td>статут</td>
                    <td>${machine.details.status}</td>
                  </tr>
                  <tr>
                    <td>година</td>
                    <td>${machine.details.year}</td>
                  </tr>
                </table>

                <div class="machine-contacts-elements">
                  <a
                    class="machine-contacts-element"
                    href="tel:${contacts.phone}"
                    target="_blank"
                  >
                    <ion-icon name="call"></ion-icon>
                    <span>${contacts.phone}</span>
                  </a>
                  <a
                    class="machine-contacts-element"
                    href="mailto:${contacts.email_1}?subject=${machine.type}%20${machine.make}%20${machine.model}&body=Относно ${machine.type}%20${machine.make}%20${machine.model} - ${api.client}/machine/${machine._id}"
                  >
                    <ion-icon name="mail"></ion-icon>
                    <span>${contacts.email_1}</span>
                  </a>
                  <a
                    class="machine-contacts-element"
                    href="mailto:${contacts.email_2}?subject=${machine.type}%20${machine.make}%20${machine.model}&body=Относно ${machine.type}%20${machine.make}%20${machine.model} - ${api.client}/machine/${machine._id}"
                  >
                    <ion-icon name="mail"></ion-icon>
                    <span>${contacts.email_2}</span>
                  </a>
                </div>
              `}
        </div>
        <div class="machine-buttons">
          ${isOwner
            ? html`
                ${isEdit
                  ? html`
                      <button
                        class="machine-stats-btn"
                        onclick="document.getElementById('edit-form').requestSubmit()"
                      >
                        Готов
                      </button>
                    `
                  : html`
                      <button
                        @click=${() => {
                          isEdit = isEdit === false ? true : false;
                          ctx.page.redirect(`/machine/${machine._id}`);
                        }}
                        class="machine-stats-btn"
                      >
                        Редактирай
                      </button>
                    `}
              `
            : ""}
          ${JSON.parse(localStorage.getItem("saved")).includes(machine._id)
            ? html`
                <a
                  class="machine-stats-btn saved"
                  @click=${removeItemLocalStorage}
                >
                  <span class="text">Запазен</span>
                </a>
              `
            : html`
                <a class="machine-stats-btn" @click=${addItemLocalStorage}>
                  <span class="text">Запази</span>
                </a>
              `}
        </div>
      </div>
    </div>

    <div class="image-editor hidden">
      <button class="close" @click=${closePhotoGrid}>
        <ion-icon name="close-circle-outline"></ion-icon>
      </button>
      <div class="image-grid">${editorImages}</div>
    </div>

    <div class="files-box hidden">
      <button class="close" @click=${onCloseDocumentClick}>
        <ion-icon name="close-circle-outline"></ion-icon>
      </button>
      <input
        @change="${handleDocumentFileChange}"
        type="file"
        id="file"
        name="file"
        accept=".pdf, .doc, .docx, .xls, .xlsx"
        style="display: none"
      />

      <button
        class="add-file-btn"
        type="button"
        onclick="document.getElementById('file').click()"
      >
        <ion-icon name="folder-outline"></ion-icon>
        add document
      </button>
      ${machine.files.map(
        (file, i) =>
          html`
            <div class="files-box-element">
              <a
                href="${api.server}/${machine._id}/files/${file}"
                target="_blank"
              >
                ${file}
              </a>
              <button
                class="delete-file-btn"
                @click=${handleDeleteFile}
                id="${i}"
              >
                <ion-icon name="trash-outline"></ion-icon>
              </button>
            </div>
          `
      )}
    </div>
    <div>
      <div class="videos-editor">
        <div class="videos-grid">${editorVideos}</div>
      </div>

      <h1>Информация:</h1>
      <div class="machine-info">
        <p>${machine.details.description}</p>
      </div>
    </div>

    ${isOwner
      ? html`
          <button @click=${onDelete} class="btn-delete">
            <ion-icon name="trash-bin-outline"></ion-icon>
          </button>
        `
      : ""}

    <div
      @click=${(e) => {
        closeScreenElement(e, "full-screen-box");
      }}
      class="full-screen-box hidden"
    >
      <button
        @click=${() =>
          document.querySelector(".full-screen-box").classList.add("hidden")}
      >
        <ion-icon name="close-outline"></ion-icon>
      </button>

      <img class="full-screen-photo" />

      <ion-icon
        @click=${() => scrollFullScreenPhoto("-")}
        class="full-screen-left-button"
        name="chevron-back-outline"
      ></ion-icon>
      <ion-icon
        @click=${() => scrollFullScreenPhoto("+")}
        class="full-screen-right-button"
        name="chevron-forward-outline"
      ></ion-icon>
    </div>
  `;

  ctx.renderMain(templete);

  //image editor logic//
  async function handleImageFileChange(e) {
    const file = e.target.files[0];

    if (file) {
      renderSpinner();
      const formData = new FormData();
      formData.append("image", file);
      try {
        const data = await fetch(
          api.server + `/api/agro-2000/machines/image/${machine._id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            body: formData,
          }
        );
        const res = await data.json();

        if (res.status === "success") {
          renderSpinner();
          ctx.page.redirect(`/machine/${machine._id}`);
        }
        if (res.status === "fail") {
          renderSpinner();
          e.target.value = "";
          throw new Error(res.message);
        }
      } catch (err) {
        alert(err.message);
      }
    }
  }

  async function handleDeleteImage(e) {
    const index = { index: Number(e.target.id) };

    try {
      renderSpinner();
      const data = await fetch(
        api.server + `/api/agro-2000/machines/image/delete/${machine._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(index),
        }
      );
      const res = await data.json();

      if (res.status === "success") {
        renderSpinner();
        ctx.page.redirect(`/machine/${machine._id}`);
      }
      if (res.status === "fail") {
        renderSpinner();
        e.target.value = "";
        throw new Error(res.message);
      }
    } catch (err) {
      alert(err.message);
    }
  }

  function onPhotoGridClick() {
    const imageEditor = document.querySelector(".image-editor");
    if (imageEditor.classList.contains("hidden")) {
      imageEditor.classList.remove("hidden");
    } else {
      imageEditor.classList.add("hidden");
    }
  }

  function closePhotoGrid() {
    document.querySelector(".image-editor").classList.add("hidden");
  }

  //file editor logic//
  async function handleDocumentFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        renderSpinner();
        const data = await fetch(
          api.server + `/api/agro-2000/machines/file/${machine._id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            body: formData,
          }
        );
        const res = await data.json();

        if (res.status === "success") {
          renderSpinner();
          ctx.page.redirect(`/machine/${machine._id}`);
        }
        if (res.status === "fail") {
          renderSpinner();
          throw new Error(res.message);
        }
      } catch (err) {
        alert(err.message);
      }
    }
  }

  async function handleDeleteFile(e) {
    const index = { index: Number(e.target.id) };

    try {
      renderSpinner();
      const data = await fetch(
        api.server + `/api/agro-2000/machines/file/delete/${machine._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(index),
        }
      );
      const res = await data.json();

      if (res.status === "success") {
        renderSpinner();
        ctx.page.redirect(`/machine/${machine._id}`);
      }
      if (res.status === "fail") {
        renderSpinner();
        e.target.value = "";
        throw new Error(res.message);
      }
    } catch (err) {
      alert(err.message);
    }
  }

  function onDocumentsClick() {
    document.querySelector(".files-box").classList.remove("hidden");
  }
  function onCloseDocumentClick() {
    document.querySelector(".files-box").classList.add("hidden");
  }

  // video aditor logic

  async function handleVideoChange(e) {
    const value = e.target.value;
    e.target.value = "";
    if (value) {
      try {
        renderSpinner();
        const data = await fetch(
          api.server + `/api/agro-2000/machines/video/${machine._id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "content-type": "application/json",
            },
            body: JSON.stringify({ video: value }),
          }
        );
        const res = await data.json();

        if (res.status === "success") {
          renderSpinner();
          ctx.page.redirect(`/machine/${machine._id}`);
        }
        if (res.status === "fail") {
          renderSpinner();
          e.target.value = "";
          throw new Error(res.message);
        }
      } catch (err) {
        alert(err.message);
      }
    }
  }

  async function handleDeleteVideo(e) {
    const index = { index: Number(e.target.id) };

    try {
      renderSpinner();
      const data = await fetch(
        api.server + `/api/agro-2000/machines/video/delete/${machine._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(index),
        }
      );
      const res = await data.json();

      if (res.status === "success") {
        renderSpinner();
        ctx.page.redirect(`/machine/${machine._id}`);
      }
      if (res.status === "fail") {
        renderSpinner();
        e.target.value = "";
        throw new Error(res.message);
      }
    } catch (err) {
      alert(err.message);
    }
  }

  //edit machine logic
  async function onEdit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    const patchedData = {
      currency: formData.get("currency"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      price: formData.get("price"),
      type: formData.get("type"),
      make: formData.get("make"),
      model: formData.get("model"),
      details: {
        engine: formData.get("engine"),
        horsepower: formData.get("horsepower"),
        transmission: formData.get("transmission") || null,
        scv: formData.get("scv"),
        hours: formData.get("hours"),
        status: formData.get("status"),
        year: formData.get("year"),
        hydraulicPumps: formData.get("hydraulicPumps"),
        frontTires: formData.get("frontTires"),
        rearTires: formData.get("rearTires"),
        description: formData.get("description"),
      },
    };

    try {
      renderSpinner();
      const data = await fetch(
        api.server + `/api/agro-2000/machines/${ctx.params.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(patchedData),
        }
      );
      const res = await data.json();

      if (res.status === "success") {
        renderSpinner();
        isEdit = false;
        ctx.page.redirect(`/machine/${ctx.params.id}`);
      }
      if (res.status === "fail") {
        renderSpinner();
        throw new Error(res.message);
      }
    } catch (err) {
      alert(err.message);
    }
  }

  //photo selection logic

  function onSelectPhoto(e) {
    const mainPhoto = document.querySelector(".machine-main-photo");
    const photos = document.querySelectorAll(".machine-photo");
    photos.forEach((photo) => {
      if (photo.classList.contains("photo-selected")) {
        photo.classList.remove("photo-selected");
      }
    });
    e.target.classList.add("photo-selected");
    mainPhoto.src = photos[e.target.id].src;
    mainPhoto.alt = photos[e.target.id].alt;
    mainPhoto.id = photos[e.target.id].id;

    photos[e.target.id].scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }

  function scrollMainPhoto(step) {
    const photoElement = document.querySelector(".machine-main-photo");
    const photos = document.querySelectorAll(".machine-photo");
    let integer = Number(photoElement.id);
    if (step === "-") integer = integer - 1;
    if (step === "+") integer = integer + 1;
    if (integer < 0 || integer > photos.length - 1) {
      return;
    }

    photos.forEach((photo) => {
      if (photo.classList.contains("photo-selected")) {
        photo.classList.remove("photo-selected");
      }
    });
    photos[integer].classList.add("photo-selected");

    photos[integer].scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });

    photoElement.src = photos[integer].src;
    photoElement.alt = photos[integer].alt;
    photoElement.id = photos[integer].id;
  }

  function scrollFullScreenPhoto(step) {
    const photoElement = document.querySelector(".full-screen-photo");
    const photos = document.querySelectorAll(".machine-photo");
    let integer = Number(photoElement.id);
    if (step === "-") integer = integer - 1;
    if (step === "+") integer = integer + 1;
    if (integer < 0 || integer > photos.length - 1) {
      return;
    }

    photoElement.src = photos[integer].src;
    photoElement.alt = photos[integer].alt;
    photoElement.id = photos[integer].id;
  }

  //delete machine logic//
  async function onDelete(e) {
    try {
      renderSpinner();
      const data = await fetch(
        api.server + `/api/agro-2000/machines/${machine._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (data.status === 204) {
        renderSpinner();
        ctx.page.redirect(`/deals`);
      } else {
        throw new Error("Error 404 !");
      }
    } catch (err) {
      alert(err.message);
    }
  }

  function addItemLocalStorage() {
    const saved = JSON.parse(localStorage.getItem("saved"));
    if (!saved.includes(machine._id)) {
      saved.push(machine._id);
      localStorage.setItem("saved", JSON.stringify(saved));
      ctx.page.redirect(`/machine/${machine._id}`);
    }
  }

  function removeItemLocalStorage() {
    let saved = JSON.parse(localStorage.getItem("saved"));
    if (saved.includes(machine._id)) {
      saved = saved.filter((el) => el !== machine._id);
      localStorage.setItem("saved", JSON.stringify(saved));
      ctx.page.redirect(`/machine/${machine._id}`);
    }
  }
}
