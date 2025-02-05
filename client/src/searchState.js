const globalQuery = `/api/agro-2000/machines?page=1&limit=12&fields=-owner,-spec,-details,-files,-email,-phone,-priceEU,-description`;
export const searchState = {
  query: globalQuery,
  savedMachines: false,
};

export function refreshSearchState() {
  searchState.query = globalQuery;
  searchState.savedMachines = false;
}
