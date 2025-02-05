import { html } from "../node_modules/lit-html/lit-html.js";
import renderSpinner from "./spinner.js";
import api from "./api.js";
import { createState } from "./createState.js";

export async function renderCreate(ctx, next) {
  const templete = html`<div class="create-section">
  <form @submit=${onCreate} class="create-form">
    <div class="create-form-element">
      <label for="type">type</label>
      <select name="type" id="type" .value=${createState.type}>
        <option value="tractor">трактор</option>
        <option value="harvester">комбайн</option>
      </select>
    </div>
     <div class="create-form-element">
    <label for="make">make</label>
      <select name="make" id="make" .value=${createState.make}>
        <option value="Jhon Deere">Jhon Deere</option>
        <option value="Claas">Claas</option>
      </select>
    </div>
    <div class="create-form-element">
    <label for="photo">photo</label>
      <input id="image" type="file" name="image" accept="image/*" required>
    </div>
    <div class="create-form-element">
      <label for="model">model</label>
      <input type="text" name="model" id="model" />
    </div>
    <div class="create-form-element">
      <label for="price">price</label>
      <input type="number" name="price" id="price" />
    </div>
    <div class="create-form-element">
        <input type="submit" value="add deal"></input>
    </div>
  </form>
</div>`;

  ctx.renderMain(templete);

  async function onCreate(e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    try {
      renderSpinner();
      const data = await fetch(api.server + "/api/agro-2000/machines", {
        method: "post",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData,
      });
      const res = await data.json();

      if (res.status === "success") {
        ctx.page.redirect("/deals");
        renderSpinner();
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
