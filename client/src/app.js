import { render, html } from "../node_modules/lit-html/lit-html.js";
import page from "../node_modules/page/page.mjs";
import { searchState, refreshSearchState } from "./searchState.js";
import { createState, refreshCreateState } from "./createState.js";
import { contacts } from "./contacts.js";

import { renderRegister } from "./register.js";
import { renderLogin } from "./login.js";
import { renderDeals } from "./deals.js";
import { onLogout } from "./logout.js";
import { renderCreate } from "./create.js";
import { renderMachine } from "./machine.js";

//check if logged
const accessToken = localStorage.getItem("accessToken");
const loginBtn = document.querySelector(".login-btn");
loginBtn.href = accessToken ? "/logout" : "/login";
//================================
const body = document.querySelector("body");
const mainNav = document.querySelector(".main-nav");
const sectionMain = document.querySelector(".section-main");
//===================

page(renderTempletes);
page(renderNavigation);

page("/", renderHero);
page("/register", renderRegister);
page("/login", renderLogin);
page("/deals", renderDeals);
page("/logout", onLogout);
page("/create", renderCreate);
page("/machine/:id", renderMachine);

page.start();

function renderTempletes(ctx, next) {
  ctx.renderNav = (templete) => render(templete, mainNav);
  ctx.renderMain = (templete) => render(templete, sectionMain);

  next();
}

function renderHero(ctx, next) {
  const templete = html`
    <div class="slideshow-container">
      <img id="slider" src="./images/hero/8.jpg" />
      <div class="slideshow-container-cover">
        <div class="hero-title">
          <span class="hero-logo">Agro 2000 Service ЕООД</span>
          <div class="hero-text">
            <span>Сервиз и Доставчик на</span>
            <a @click=${refreshCreateState} href="/deals">
              селскостопанска техника
            </a>
          </div>
        </div>
      </div>
    </div>
    <div class="contacts-container">
      <div class="info-contacts">
        <a
          class="info-contacts-element"
          href="tel:${contacts.phone}"
          target="_blank"
        >
          <ion-icon name="call"></ion-icon>
          <span>${contacts.phone}</span>
        </a>
        <a
          class="info-contacts-element"
          target="_blank"
          href="mailto:${contacts.email_1}"
        >
          <ion-icon name="mail"></ion-icon>
          <span>${contacts.email_1}</span>
        </a>
        <a
          class="info-contacts-element"
          target="_blank"
          href="mailto:${contacts.email_2}"
        >
          <ion-icon name="mail"></ion-icon>
          <span>${contacts.email_2}</span>
        </a>

        <a
          class="info-contacts-element"
          target="_blank"
          href="https://maps.app.goo.gl/e1NaLy8xrDznNSYK8"
        >
          <ion-icon name="location"></ion-icon>
          Адрес:
          <span>#</span>
        </a>
      </div>
      <img src="../images/logo/logo-rm-bg.png" alt="logo-icon" />
    </div>
  `;

  ctx.renderMain(templete);

  const images = [
    "./images/hero/1.jpg",
    "./images/hero/2.jpg",
    "./images/hero/3.jpg",
    "./images/hero/4.jpeg",
    "./images/hero/5.jpg",
    "./images/hero/6.jpeg",
    "./images/hero/7.avif",
    "./images/hero/7.jpg",
    "./images/hero/8.jpg",
    "./images/hero/9.jpg",
    "./images/hero/10.jpeg",
    "./images/hero/11.avif",
    "./images/hero/12.jpeg",
  ];
  let currentIndex = 0;

  const slider = document.getElementById("slider");

  function changeImage() {
    slider.classList.remove("fade-in");
    slider.classList.add("fade-out");

    setTimeout(() => {
      currentIndex = (currentIndex + 1) % images.length;
      slider.src = images[currentIndex];
      slider.classList.remove("fade-out");
      slider.classList.add("fade-in");
    }, 1200);
  }
  slider.classList.add("fade-in");

  setInterval(changeImage, 5000);
}

function renderNavigation(ctx, next) {
  const accessToken = localStorage.getItem("accessToken");
  // const user = localStorage.getItem("user");

  if (!localStorage.getItem("saved")) {
    localStorage.setItem("saved", JSON.stringify([]));
  }

  const templete = html`
      <ul class="sidebar-menu">
        ${
          accessToken
            ? html`
                <li class="dropdown" @click=${buttonDelegationCreate}>
                  <a class="main-nav-link" href="/create">
                    <span class="icon">
                      <img src="../images/icons/create.png" alt="create-icon" />
                    </span>
                    <span class="text">добави машина</span>
                  </a>

                  <ul class="dropdown-menu">
                    <li class="dropdown">
                      <a class="main-nav-link" data-type="tractor">
                        <span class="icon">
                          <img
                            src="../images/icons/tractor.png"
                            alt="tractor-icon"
                          />
                        </span>
                        <span class="text">трактор</span>
                      </a>
                      <ul class="dropdown-menu-secondary">
                        <li>
                          <a
                            class="main-nav-link"
                            data-type="tractor"
                            data-make="Jhon Deere"
                          >
                            <img
                              class="model-icon"
                              src="../images/icons/jhon-deere.png"
                              alt="jhon-deere-icon"
                            />
                          </a>
                        </li>
                        <li>
                          <a
                            class="main-nav-link"
                            data-type="tractor"
                            data-make="Claas"
                          >
                            <img
                              class="model-icon"
                              src="../images/icons/claas.png"
                              alt="claas-icon"
                            />
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li class="dropdown">
                      <a class="main-nav-link" data-type="harvester">
                        <span class="icon">
                          <img
                            src="../images/icons/harvester.png"
                            alt="harvester-icon"
                          />
                        </span>
                        <span class="text">комбайн</span>
                      </a>

                      <ul class="dropdown-menu-secondary">
                        <li>
                          <a
                            class="main-nav-link"
                            data-type="harvester"
                            data-make="Jhon Deere"
                          >
                            <img
                              class="model-icon"
                              src="../images/icons/jhon-deere.png"
                              alt="jhon-deere-icon"
                            />
                          </a>
                        </li>
                        <li>
                          <a
                            class="main-nav-link"
                            data-type="harvester"
                            data-make="Claas"
                          >
                            <img
                              class="model-icon"
                              src="../images/icons/claas.png"
                              alt="claas-icon"
                            />
                          </a>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
              `
            : ""
        }
        <li class="dropdown" @click=${buttonDelegationSearch}>
          <a class="main-nav-link" @click=${refreshSearchState} href="/deals">
            <span class="icon">
              <img src="../images/icons/machine.png" alt="machine-icon" />
            </span>
            <span class="text">техника</span>
          </a>
          <ul class="dropdown-menu">
            <li class="dropdown">
              <a class="main-nav-link" data-query="&type=tractor">
                <span class="icon">
                  <img src="../images/icons/tractor.png" alt="tractor-icon" />
                </span>
                <span class="text">трактори</span>
              </a>
              <ul class="dropdown-menu-secondary">
                <li>
                  <a
                    class="main-nav-link"
                    data-query="&type=tractor&make=Jhon Deere"
                  >
                    <img
                      class="model-icon"
                      src="../images/icons/jhon-deere.png"
                      alt="jhon-deere-icon"
                    />
                  </a>
                </li>
                <li>
                  <a
                    class="main-nav-link"
                    data-query="&type=tractor&make=Claas"
                  >
                    <img
                      class="model-icon"
                      src="../images/icons/claas.png"
                      alt="claas-icon"
                    />
                  </a>
                </li>
              </ul>
            </li>
            <li class="dropdown">
              <a class="main-nav-link" data-query="&type=harvester">
                <span class="icon">
                  <img
                    src="../images/icons/harvester.png"
                    alt="harvester-icon"
                  />
                </span>
                <span class="text">комбайни</span>
              </a>

              <ul class="dropdown-menu-secondary">
                <li>
                  <a
                    class="main-nav-link"
                    data-query="&type=harvester&make=Jhon Deere"
                  >
                    <img
                      class="model-icon"
                      src="../images/icons/jhon-deere.png"
                      alt="jhon-deere-icon"
                    />
                  </a>
                </li>
                <li>
                  <a
                    class="main-nav-link"
                    data-query="&type=harvester&make=Claas"
                  >
                    <img
                      class="model-icon"
                      src="../images/icons/claas.png"
                      alt="claas-icon"
                    />
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </li>
        <li>
          <a class="main-nav-link" @click=${searchByIds}>
            <span class="icon">
              <img src="../images/icons/saved.png" alt="saved-icon" />
            </span>
            <span class="text">запазени</span>
          </a>
        </li>
        <li class="dropdown" @click=${(e) => {
          const target = e.target;
          if (target.classList[0] === "main-nav-link") {
            removeAllDroppedElements();
          }
          const dropdown = target.nextElementSibling;
          if (dropdown) {
            dropdown.classList.add("dropped");
          }
        }}>
          <a class="main-nav-link">
            <span class="icon">
              <img src="../images/icons/search.png" alt="search-icon" />
            </span>
            <span class="text">модел</span>
          </a>

          <ul class="dropdown-menu">
            <li>
              <span class="icon" >
                <input  @input=${(e) => {
                  refreshCreateState();
                  searchState.query =
                    searchState.query + `&model=${e.target.value}`;
                  if (e.target.value.length >= 4) {
                    setTimeout(() => {
                      e.target.value = "";
                      ctx.page.redirect("/deals");
                    }, 1000);
                  }
                }} class="model-search"></input>
              </span>
            </li>
          </ul>
        </li>
      </ul>
  `;

  ctx.renderNav(templete);

  //remove all dropped elements
  function dropDownEvents(e) {
    if (!e.target.classList.contains("main-nav-link")) {
      removeAllDroppedElements();
    }

    body.removeEventListener("click", dropDownEvents);
  }

  body.addEventListener("click", dropDownEvents);

  //sidebar dropdown buttons logic

  function buttonDelegationSearch(event) {
    const target = event.target;
    const dropdown = target.nextElementSibling;
    if (target.href) {
      removeAllDroppedElements();
    }

    if (dropdown) {
      if (dropdown.classList.contains("dropped")) {
        dropdown.classList.remove("dropped");
      } else {
        document
          .querySelectorAll(".dropdown-menu-secondary")
          .forEach((el) => el.classList.remove("dropped"));
      }
      dropdown.classList.add("dropped");
    }

    if (target.dataset.query) {
      if (
        target.dataset.query.includes("type") &&
        !target.dataset.query.includes("make")
      ) {
        refreshSearchState();
        searchState.query += target.dataset.query;
        ctx.page.redirect("/deals");
      }

      if (
        target.dataset.query.includes("type") &&
        target.dataset.query.includes("make")
      ) {
        refreshSearchState();
        searchState.query += target.dataset.query;
        ctx.page.redirect("/deals");
      }
    }
  }

  function buttonDelegationCreate(event) {
    const target = event.target;
    const dropdown = target.nextElementSibling;

    if (target.href) {
      removeAllDroppedElements();
    }

    if (dropdown) {
      if (dropdown.classList.contains("dropped")) {
        dropdown.classList.remove("dropped");
      } else {
        document
          .querySelectorAll(".dropdown-menu-secondary")
          .forEach((el) => el.classList.remove("dropped"));
      }
      dropdown.classList.add("dropped");
    }

    if (target.dataset) {
      if (target.dataset.type) {
        refreshCreateState();
        createState.type = target.dataset.type;
        ctx.page.redirect("/create");
      }
      if (target.dataset.type && target.dataset.make) {
        refreshCreateState();
        createState.type = target.dataset.type;
        createState.make = target.dataset.make;
        ctx.page.redirect("/create");
      }
    }
  }

  function searchByIds() {
    searchState.savedMachines = true;

    ctx.page.redirect("/deals");
  }

  function removeAllDroppedElements() {
    document
      .querySelectorAll(".dropped")
      .forEach((el) => el.classList.remove("dropped"));
  }

  //===================================

  //scroll logic

  //=================

  next();
}
