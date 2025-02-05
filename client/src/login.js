import { html } from "../node_modules/lit-html/lit-html.js";
import api from "./api.js";
import renderSpinner from "./renderSpinner.js";

export function renderLogin(ctx, next) {
  const templete = html`<main>
      <form @submit=${onLogin} class="add-service-form">
        <span class="service-heading sub-heading"
          ><ion-icon name="car-outline"></ion-icon>select</span
        >
        <div class="service-form-element">
          <label for="number">car number</label>
          <input type="text" name="number" id="number" />
        </div>
        <div class="service-form-element">
          <label for="pin">pin code</label>
          <input type="password" name="pin" id="pin" />
        </div>
        <div class="service-form-element">
          <input type="submit" value="Select" />
        </div>
        <a href="/register" class="select-link"
          >Register Car <ion-icon name="arrow-forward-outline"></ion-icon
        ></a>
      </form>
    </main>
    <aside>
      <p class="aside-text"></p>
    </aside>`;

  async function onLogin(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const number = formData.get("number");
    const pin = formData.get("pin");

    if (number && pin) {
      renderSpinner();
      await fetch(api + "/car-service/cars/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          number,
          pin,
        }),
      })
        .then((data) => data.json())
        .then((res) => {
          if (res.status === "success") {
            localStorage.clear();
            const user = res.data.user;

            localStorage.setItem("accessToken", res.token);
            localStorage.setItem("_id", res.data.user._id);
            localStorage.setItem("car", JSON.stringify(user));

            ctx.page.redirect(`/car`);
          } else {
            throw new Error(res.message);
          }
        })
        .catch((err) => {
          swal(err.message, {
            buttons: false,
            timer: 3000,
            className: "error-box",
          });
        });
      renderSpinner();
    }
  }

  ctx.renderBody(templete);
}
