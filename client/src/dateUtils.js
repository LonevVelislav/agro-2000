export function formatDate(date) {
  const input = new Date(date);
  const year = input.getFullYear();
  const month = input.getMonth() + 1;
  const day = input.getDate();

  const formatted = `${day.toString().padStart(2, "0")}-${month
    .toString()
    .padStart(2, "0")}-${year}`;

  return formatted;
}

export function yearDifferenceCheck(date, months) {
  const currentDate = new Date();

  const monthDiff =
    (currentDate.getFullYear() - date.getFullYear()) * 12 +
    currentDate.getMonth() -
    date.getMonth();

  return monthDiff >= months;
}
