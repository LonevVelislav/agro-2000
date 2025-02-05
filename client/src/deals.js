import { html } from "../node_modules/lit-html/lit-html.js";
import { request } from "./request.js";
import { searchState, refreshSearchState } from "./searchState.js";
import renderSpinner from "./spinner.js";
import api from "./api.js";

let page = 1;
export async function renderDeals(ctx, next) {
  let machines;
  renderSpinner();
  if (searchState.savedMachines === true) {
    try {
      const data = await request(api.server + searchState.query);
      if (data.status === "success") {
        renderSpinner();
        const saved = JSON.parse(localStorage.getItem("saved"));
        machines = data.data.machines.filter((el) => saved.includes(el._id));
      }
      if (data.status === "fail") {
        renderSpinner();
        throw new Error(data.message);
      }
    } catch (err) {
      alert(err.message);
    }
  } else {
    try {
      const data = await request(api.server + searchState.query);
      if (data.status === "success") {
        renderSpinner();
        machines = data.data.machines;
      }
      if (data.status === "fail") {
        renderSpinner();
        throw new Error(data.message);
      }
    } catch (err) {
      alert(err.message);
    }
  }
  const templete = html`
    <div class="price-filter">
      <ion-icon name="search-outline"></ion-icon>
      <select @change="${onFilter}" name="filter" id="filter">
        <option value="normal" selected>по подразбиране</option>
        <option value="bottom-top">ниска към висока цена</option>
        <option value="top-bottom">висока към ниска цена</option>
      </select>
    </div>

    <div class="section-deals">
      ${machines.length > 0
        ? html`
            ${machines.map(machineTemplete)}
          `
        : html`
            <div class="empty-request">
              <span>Няма намерени!</span>
            </div>
          `}
    </div>
    <div class="deals-arrows" @click=${arrowEvents}>
      ${page > 1
        ? html`
            <button data-points="left">
              <ion-icon name="chevron-back-outline"></ion-icon>
            </button>
          `
        : html``}
      ${machines.length >= 12 && machines.length / 12 >= page
        ? html`
            <button data-points="right">
              <ion-icon name="chevron-forward-outline"></ion-icon>
            </button>
          `
        : html``}
    </div>
  `;

  ctx.renderMain(templete);

  async function onFilter(e) {
    const value = e.target.value;
    searchState.query = searchState.query.replace(/&sort.*$/, "");
    if (value === "bottom-top")
      searchState.query = searchState.query + "&sort=priceEU";
    if (value === "top-bottom")
      searchState.query = searchState.query + "&sort=-priceEU";

    ctx.page.redirect("/deals");
  }

  function arrowEvents(e) {
    const target = e.target;
    if (target.dataset.points === "right") {
      page++;
    }
    if (target.dataset.points === "left" && page >= 2) {
      page--;
    }

    const url = new URL(searchState.query, api);
    url.searchParams.set("page", page);
    searchState.query = url.pathname + url.search;
    ctx.page.redirect("/deals");
  }
}

const machineTemplete = (machine) => html`
  <a class="card-link" href="/machine/${machine._id}">
    <div class="card">
      <div class="card-picture">
        <img
          src="${api.server}/${machine._id}/photos/${machine.images[0]}"
          alt="${machine.images[0]}"
        />
      </div>

      <div class="card-info">
        <span>${machine.make}</span>
        <span>${machine.model}</span>
      </div>
      <div class="card-price">
        ${machine.price
          ? html`
              <span>${machine.price.toLocaleString("en-US")}</span>
              <span>${machine.currency}</span>
            `
          : html`
              <span>по договаряне</span>
            `}
      </div>
      <div class="cover"></div>
    </div>
  </a>
`;
