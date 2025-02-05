import { html } from "../node_modules/lit-html/lit-html.js";
import { request } from "./request.js";
import api from "./api.js";

export function renderRegister(ctx, next) {
  const templete = html`<div class="section-register">
  <form @submit=${onRegister} class="register-form">
    <div class="register-form-element">
      <label for="email">Е-поща</label>
      <input type="text" name="email" id="email" />
    </div>
    <div class="register-form-element">
      <label for="password">Парола</label>
      <input type="password" name="password" id="password" />
    </div>
    <div class="register-form-element">
      <label for="confirmPassword">Потвърди парола</label>
      <input type="password" name="confirmPassword" id="confirmPassword" />
    </div>
    <div class="register-form-element btn-register">
      <input type="submit" value="регистрация"></input>
      <a href="/login">Вход</a>
    </div>
  </form>
</div>
`;

  async function onRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const email = formData.get("email");
    const password = formData.get("password");
    const rePass = formData.get("confirmPassword");

    try {
      if (email && password && password === rePass) {
        const res = await request(
          api.server + "/api/agro-2000/users/register",
          {
            method: "post",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              email,
              password,
              confirmPassword: rePass,
            }),
          }
        );
        if (res.status === "success") {
          localStorage.clear();
          localStorage.setItem("accessToken", res.token);
          localStorage.setItem("user", res.data.user.email);
          localStorage.setItem("userId", res.data.user._id);

          ctx.page.redirect("/deals");
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
