export default function renderSpinner() {
  const spinner = document.querySelector(".spinner");
  const body = document.querySelector("body");
  if (spinner.classList.contains("hidden")) {
    body.classList.add("unclick");
    spinner.classList.remove("hidden");
  } else {
    body.classList.remove("unclick");
    spinner.classList.add("hidden");
  }
}
