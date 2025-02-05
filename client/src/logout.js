export function onLogout(ctx, next) {
  localStorage.removeItem("accressToken");
  localStorage.removeItem("user");
  localStorage.clear();

  ctx.page.redirect("/login");
}
