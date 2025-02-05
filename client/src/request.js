import renderSpinner from "./renderSpinner.js";
export async function request(url, settings) {
  renderSpinner();
  try {
    const res = await fetch(url, settings);
    const data = await res.json();
    renderSpinner();
    return data;
  } catch (err) {
    renderSpinner();
    swal(err.message, {
      buttons: false,
      timer: 3000,
      className: "error-box",
    });
  }
}
