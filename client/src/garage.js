import { html } from "../node_modules/lit-html/lit-html.js";
import { request } from "./request.js";
import api from "./api.js";
import renderSpinner from "./renderSpinner.js";

export async function renderGarage(ctx, next) {
  const accessToken = localStorage.getItem("accessToken");

  const res = await request(`${api}/car-service/calls`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const calls = res.data.calls;
  const active = calls.filter((call) => call.status === "active");

  const templete = html`<main>
    ${active.map(
      (call) => html`
        <a id=${call.car._id} @click=${onCarClick} class="service">
          <div class="call-car-stats unclick">
            <span>${call.car.number}</span>
            <ion-icon name="car-outline"></ion-icon>
          </div>
          <div class="service-text">
            <p>started: <span class="strong">${call.time}</span></p>
          </div>
          <img
            class="service-icon"
            src="./img/icons/${call.service}-icon.png"
            alt="${call.service}-icon"
          />
          <button
            @click=${onEndServiceBtn}
            id=${call._id}
            class="call-remove-btn"
          >
            end service
          </button>
        </a>
      `
    )}
  </main>`;

  ctx.renderBody(templete);

  async function onCarClick(e) {
    if (e.target.nodeName === "A") {
      const res = await request(`${api}/car-service/cars/${e.target.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.status === "success") {
        localStorage.setItem("_id", res.data.car._id);
        localStorage.setItem("car", JSON.stringify(res.data.car));
        ctx.page.redirect("/car");
      }
    }
  }

  async function onEndServiceBtn(e) {
    if (e.target.nodeName === "BUTTON") {
      renderSpinner();
      await fetch(`${api}/car-service/calls/${e.target.id}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: "finished" }),
      })
        .then((data) => data.json())
        .then((res) => {
          renderSpinner();
          if (res.status === "success") {
            ctx.page.redirect("/garage");
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
}
