import { html } from "../node_modules/lit-html/lit-html.js";
import api from "./api.js";
import renderSpinner from "./renderSpinner.js";

export function renderAdminLogin(ctx, next) {
  const templete = html` <main>
      <form @submit=${onAdmingLogin} class="add-service-form">
        <div class="service-form-element">
          <label for="username">username</label>
          <input type="text" name="username" id="username" />
        </div>
        <div class="service-form-element">
          <label for="password">password</label>
          <input type="password" name="password" id="password" />
        </div>
        <div class="service-form-element">
          <input type="submit" value="login" />
        </div>
      </form>
    </main>
    <aside></aside>`;

  async function onAdmingLogin(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const username = formData.get("username");
    const password = formData.get("password");

    if (username && password) {
      renderSpinner();
      await fetch(api + "/car-service/admin/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })
        .then((data) => data.json())
        .then((res) => {
          if (res.status === "success") {
            localStorage.clear();

            localStorage.setItem("accessToken", res.token);
            localStorage.setItem("admin", JSON.stringify(res.data.user));

            ctx.page.redirect(`/garage`);
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
