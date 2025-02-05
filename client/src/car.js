import { html } from "../node_modules/lit-html/lit-html.js";
import { request } from "./request.js";
import api from "./api.js";
import { formatDate, yearDifferenceCheck } from "./dateUtils.js";
import renderSpinner from "./renderSpinner.js";

let page = 1;
export async function renderCar(ctx, next) {
  const search = document.getElementById("search").value;
  document.getElementById("search").value = "";
  const carId = localStorage.getItem("_id");
  const car = JSON.parse(localStorage.getItem("car"));

  const res1 = await request(
    `${api}/car-service/service/car/${carId}?fields=-parts,-info,-car,-__v,&page=${page}&limit=10&${
      search ? `type=${search}` : ""
    }`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }
  );

  const res2 = await request(
    `${api}/car-service/service/car/${carId}?fields=km,createdAt,type,`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }
  );

  const services = res1.data.services;
  const allServices = res2.data.services;
  const serviceTemplete = (service) => html`<a
    @click=${onServiceClick}
    id=${service._id}
    class="service"
  >
    <img
      class="service-icon"
      src="./img/icons/${service.type}-icon.png"
      alt="${service.type}-icon"
    />
    <div class="service-text">
      <p>date: <span class="strong">${formatDate(service.createdAt)}</span></p>
      <p>
        ${service.km ? html`km: <span class="strong">${service.km}</span>` : ""}
      </p>
    </div>
    <ion-icon class="icon-service" name="arrow-down-outline"></ion-icon>
    <ion-icon class="icon-service" name="close-outline"></ion-icon>
    <div class="parts hidden-box">
      <ul></ul>
      <div class="flex-start">
        <button
          @click=${addPartClick}
          id=${service._id}
          class="service-btn service-add-part"
        >
          <ion-icon name="add-outline"></ion-icon>
        </button>
        <input
          class="part-input"
          type="text"
          placeholder="add mechanical part"
        />
      </div>
      <div class="flex-end">
        <button
          @click=${onDeleteServiceButton}
          id=${service._id}
          class="service-btn service-delete"
        >
          <ion-icon name="trash-outline"></ion-icon>
        </button>
      </div>
    </div>
  </a>`;

  const templete = html`
    <main>
      <a @click=${onAddServiceClick} class="add-service-btn">
      <ion-icon name="construct-outline"></ion-icon>
        <span class="unclick sub-heading">Add service</span>
        <ion-icon class="unclick  icon-service"  name="arrow-down-outline"></ion-icon>
        <ion-icon class="unclick  icon-service" name="close-outline"></ion-icon>
        <div class="hidden-box">
          <form @submit=${onCreate} class="add-service-form">
            <div class="service-form-element">
            <ion-icon name="archive-outline"></ion-icon>
              <label for="type">type</label>
              <select id="type" name="type">
                <option>repairs</option>
                <option value="oil">oil change</option>
                <option>battery</option>
                <option value="brakes">brakes/pads</option>
                <option>cambelts</option>
                <option>clutches</option>
                <option>engine</option>
                <option value="tyres">tyres/alignment</option>
                <option>chassie</option>
                <option>diagnostics</option>
                <option value="cooling">cooling system</option>
                <option>exhaust</option>
                <option>gearbox</option>
                <option>steering</option>
                <option>suspension</option>
                <option>MOT</option>
                <option>roadtax</option>
                <option>tax</option>
                <option value="insurance">autocasco/insurance</option>
              </select>
            </div>
            <div class="service-form-element">
            <ion-icon name="speedometer-outline"></ion-icon>
              <label for="km">km</label>
              <input type="number" id="km" name="km"></input>
            </div>
            <div class="service-form-element">
            <ion-icon name="calendar-outline"></ion-icon>
              <label for="date">date</label>
              <input type="date" id="date" name="date"></input>
            </div>

            <div class="service-form-element">
                <textarea placeholder="service info" name="info"
                id="info"
                cols="50"
                rows="10"></textarea>
            </div>

            <div class="service-form-element">
            <input type="submit" value="Add"></input>
            </form>
        </div>
        </div>
      </a>

 
</div>
       
        ${Object.keys(car.intervals).map((el) => {
          let lastService;
          let condition;
          if (
            el === "MOT" ||
            el === "tax" ||
            el === "roadtax" ||
            el === "insurance"
          ) {
            lastService = getLastDateService(el, allServices);
            condition = yearDifferenceCheck(
              new Date(lastService.createdAt),
              car.intervals[el]
            );
          } else {
            lastService = getLastService(el, allServices);
            condition = car.km - lastService.km >= car.intervals[el];
          }

          if (lastService && car.intervals[el]) {
            if (condition) {
              return html`<div class="notification">
                <ion-icon
                  class="warning-icon"
                  name="warning-outline"
                ></ion-icon>
                <div class="service-text">
                  <img
                    class="service-icon"
                    src="./img/icons/${el}-icon.png"
                    alt="${el}-icon"
                  />
                  <p>
                    last service:
                    <span class="strong"
                      >${formatDate(lastService.createdAt)}</span
                    >
                  </p>
                </div>
                <button
                  @click=${onDeleteNotification}
                  class="notification-delete"
                >
                  <ion-icon class="unclick" name="close-outline"></ion-icon>
                </button>
              </div>`;
            }
          }
        })}
        
        
        
        
        ${services ? services.map((service) => serviceTemplete(service)) : ""}
        <div class="page-buttons">
        <button class=${
          page <= 1 ? "hidden" : ""
        } @click=${prevPage}><ion-icon class="unclick" name="arrow-back-outline"></ion-icon></button>
        <button class=${
          services.length < 10 ? "hidden" : ""
        } @click=${nextPage}><ion-icon class="unclick" name="arrow-forward-outline"></ion-icon></button>
        
        </div>
    </main>
    <aside>
      <p class="aside-text"></p>
    </aside>`;

  ctx.renderBody(templete);

  async function onCreate(e) {
    e.preventDefault();
    closeAllServices();
    document.querySelector(".add-service-btn").classList.remove("open");
    const carId = localStorage.getItem("_id");

    const formData = new FormData(e.target);
    const type = formData.get("type");
    const km = formData.get("km");
    const createdAt = formData.get("date");
    const info = document.getElementById("info").value;

    try {
      if (type) {
        const inputBody = createdAt
          ? { type, km, createdAt, info }
          : {
              type,
              km,
              info,
            };

        const res = await request(`${api}/car-service/service/${carId}`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(inputBody),
        });
        if (res.status === "success") {
          ctx.page.redirect(`/car`);
        } else {
          throw new Error(res.message);
        }
        e.target.reset();
      } else {
        throw new Error("Missing fields!");
      }
    } catch (err) {
      swal(err.message, {
        buttons: false,
        timer: 3000,
        className: "error-box",
      });
    }
  }

  function nextPage() {
    page += 1;
    ctx.page.redirect("/car");
  }
  function prevPage() {
    if (page > 1) {
      page -= 1;
      ctx.page.redirect("/car");
    }
  }

  async function onDeleteServiceButton(e) {
    closeAllServices();
    const serviceId = e.target.id;
    renderSpinner();
    await fetch(`${api}/car-service/service/${serviceId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
      .then((data) => data.json())
      .then((res) => {
        renderSpinner();
        if (res.status === "success") {
          ctx.page.redirect("/car");
        }
      })
      .catch((err) => {
        renderSpinner();
        swal(err.message, {
          buttons: false,
          timer: 3000,
          className: "error-box",
        });
      });
  }
}

function onAddServiceClick(e) {
  if (e.target.classList.contains("add-service-btn")) {
    closeAllServices();
    if (e.target.classList.contains("open")) {
      e.target.classList.remove("open");
    } else {
      e.target.classList.add("open");
    }
  }
}

async function onServiceClick(e) {
  const serviceId = e.target.id;
  const asideText = document.querySelector(".aside-text");
  const hiddenBoxList = e.target.querySelector(".hidden-box ul");

  closeServiceForm();

  if (e.target.tagName === "A") {
    if (e.target.classList.contains("open")) {
      e.target.classList.remove("open");
      asideText.textContent = "";
    } else {
      hiddenBoxList.replaceChildren();
      closeAllServices();
      e.target.classList.add("open");
      try {
        const res = await request(`${api}/car-service/service/${serviceId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        if (res.status === "success") {
          asideText.textContent = res.data.service.info;
          if (res.data.service.parts.length > 0) {
            const listArray = Array.from(hiddenBoxList.children);
            for (let i = 0; i < listArray.length - 1; i++) {
              hiddenBoxList.removeChild(listArray[i]);
            }
            res.data.service.parts.map((el) => {
              const li = document.createElement("li");
              li.innerHTML = `<ion-icon name="build-outline"></ion-icon>mechanical part:
            <span class="strong">${el}</span>`;

              hiddenBoxList.insertAdjacentElement("afterbegin", li);
            });
          }
        }
      } catch (err) {
        swal(err.message, {
          buttons: false,
          timer: 3000,
          className: "error-box",
        });
      }
    }
  }
}

async function addPartClick(e) {
  const hiddenBoxList =
    e.target.parentElement.parentElement.querySelector("ul");
  const serviceId = e.target.id;
  const partInput = e.target.parentElement.querySelector(".part-input");
  if (partInput.value) {
    try {
      const res = await request(`${api}/car-service/service/${serviceId}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          part: partInput.value,
        }),
      });
      if (res.status === "success") {
        const li = document.createElement("li");
        li.style.visibility = "hidden";
        li.classList.add("service-part");
        li.classList.add("slider");
        li.innerHTML = `<ion-icon name="build-outline"></ion-icon>mechanical part:
        <span class="strong">${partInput.value}</span>`;
        partInput.value = "";

        hiddenBoxList.appendChild(li);

        setTimeout(() => {
          li.classList.remove("slider");
        }, 100);
        setTimeout(() => {
          li.style.visibility = "visible";
        }, 200);
      }
    } catch (err) {
      swal(err.message, {
        buttons: false,
        timer: 3000,
        className: "error-box",
      });
    }
  }
}

function closeServiceForm() {
  document.querySelector(".add-service-btn").classList.remove("open");
}

function closeAllServices() {
  document
    .querySelectorAll(".service")
    .forEach((el) => el.classList.remove("open"));
}

function getLastService(type, services) {
  if (services.some((el) => el.type === type)) {
    const lastService = services
      .filter((service) => service.type === type)
      .sort((a, b) => b.km - a.km)[0];

    return lastService;
  } else {
    return false;
  }
}

function getLastDateService(type, services) {
  if (services.some((el) => el.type === type)) {
    const lastDateService = services
      .filter((service) => service.type === type)
      .sort((a, b) => b.createdAt > a.createdAt)[0];

    return lastDateService;
  } else {
    return false;
  }
}

function onDeleteNotification(e) {
  const notificationDiv = e.target.parentElement;
  document.querySelector("main").removeChild(notificationDiv);
}
