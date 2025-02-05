import { html } from "../node_modules/lit-html/lit-html.js";

export function renderSelect(ctx, next) {
  const templete = html`<main>
    <div class="select-screen">
      <a href="/login" class="select-link"
        ><ion-icon name="person-outline"></ion-icon>user</a
      >
      <a href="/admin_login" class="select-link"
        ><ion-icon name="settings-outline"></ion-icon></ion-icon>admin</a
      >
    </div>
  </main>
  <aside>
   
  </aside>`;

  ctx.renderBody(templete);
}
