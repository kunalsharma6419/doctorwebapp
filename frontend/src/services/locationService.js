const LOCATION_API_BASE_URL = "https://countriesnow.space/api/v0.1";

let cachedCountries = null;
const cachedStatesByCountry = new Map();
const cachedCitiesByCountryState = new Map();

async function fetchLocation(path, options = {}) {
  const response = await fetch(`${LOCATION_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.msg || "Unable to load location suggestions");
  }

  return data.data || [];
}

export const locationService = {
  async getCountries() {
    if (cachedCountries) {
      return cachedCountries;
    }

    const countries = await fetchLocation("/countries/states");
    cachedCountries = countries.map((country) => country.name).sort();
    countries.forEach((country) => {
      cachedStatesByCountry.set(
        country.name,
        (country.states || []).map((state) => state.name).sort(),
      );
    });

    return cachedCountries;
  },

  async getStates(country) {
    if (!country) {
      return [];
    }

    if (!cachedStatesByCountry.has(country)) {
      await this.getCountries();
    }

    return cachedStatesByCountry.get(country) || [];
  },

  async getCities(country, state) {
    if (!country || !state) {
      return [];
    }

    const cacheKey = `${country}::${state}`;

    if (cachedCitiesByCountryState.has(cacheKey)) {
      return cachedCitiesByCountryState.get(cacheKey);
    }

    const cities = await fetchLocation("/countries/state/cities", {
      method: "POST",
      body: JSON.stringify({ country, state }),
    });

    const sortedCities = [...cities].sort();
    cachedCitiesByCountryState.set(cacheKey, sortedCities);
    return sortedCities;
  },
};
