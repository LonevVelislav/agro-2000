import { html } from "../node_modules/lit-html/lit-html.js";
import { request } from "./request.js";
import renderSpinner from "./spinner.js";
import api from "./api.js";

export function renderLogin(ctx, next) {
  const templete = html`<div class="section-register">
  <form @submit=${onLogin} class="register-form">
    <div class="register-form-element">
      <label for="email">Е-поща</label>
      <input type="text" name="email" id="email" />
    </div>
    <div class="register-form-element">
      <label for="password">Парола</label>
      <input type="password" name="password" id="password" />
    </div>
    <div class="register-form-element btn-register">
      <input type="submit" value="вход"></input>
       <a href="/register">Регистрация</a>
    </div>
  </form>
</div>
`;

  async function onLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const email = formData.get("email");
    const password = formData.get("password");

    try {
      if (email && password) {
        renderSpinner();
        const res = await request(api.server + "/api/agro-2000/users/login", {
          method: "post",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            email,
            password,
          }),
        });
        if (res.status === "success") {
          localStorage.clear();
          localStorage.setItem("accessToken", res.token);
          localStorage.setItem("user", res.data.user.email);
          localStorage.setItem("userId", res.data.user._id);

          ctx.page.redirect("/deals");
          renderSpinner();
        }
        if (res.status === "fail") {
          renderSpinner();
          e.target.reset();
          throw new Error(res.message);
        }
      } else {
        throw new Error("invalid inputs !");
      }
    } catch (err) {
      alert(err.message);
    }
  }

  ctx.renderMain(templete);
}
