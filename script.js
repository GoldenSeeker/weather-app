const inputEl   = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const statusEl  = document.getElementById("status");
const cardEl    = document.getElementById("weather-card");
const cityNameEl = document.getElementById("city-name");
const iconEl    = document.getElementById("weather-icon");
const tempEl    = document.getElementById("temp");
const conditionEl = document.getElementById("condition");
const feelsLikeEl = document.getElementById("feels-like");
const humidityEl  = document.getElementById("humidity");
const windEl      = document.getElementById("wind");

const WEATHER_CODES = {
  0:  { icon: "☀️",  label: "Clear sky" },
  1:  { icon: "🌤️", label: "Mainly clear" },
  2:  { icon: "⛅",  label: "Partly cloudy" },
  3:  { icon: "☁️",  label: "Overcast" },
  45: { icon: "🌫️", label: "Fog" },
  48: { icon: "🌫️", label: "Rime fog" },
  51: { icon: "🌦️", label: "Light drizzle" },
  53: { icon: "🌦️", label: "Drizzle" },
  55: { icon: "🌧️", label: "Heavy drizzle" },
  61: { icon: "🌧️", label: "Light rain" },
  63: { icon: "🌧️", label: "Rain" },
  65: { icon: "🌧️", label: "Heavy rain" },
  71: { icon: "🌨️", label: "Light snow" },
  73: { icon: "🌨️", label: "Snow" },
  75: { icon: "❄️",  label: "Heavy snow" },
  80: { icon: "🌦️", label: "Rain showers" },
  81: { icon: "🌧️", label: "Heavy showers" },
  82: { icon: "⛈️",  label: "Violent showers" },
  95: { icon: "⛈️",  label: "Thunderstorm" },
  96: { icon: "⛈️",  label: "Thunderstorm + hail" },
  99: { icon: "⛈️",  label: "Severe thunderstorm" }
};


function showStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.remove("hidden");
  statusEl.classList.toggle("error", isError);
  cardEl.classList.add("hidden");
}

function hideStatus() {
  statusEl.classList.add("hidden");
  statusEl.classList.remove("error");
}

function setLoading(isLoading) {
  searchBtn.disabled = isLoading;
  searchBtn.textContent = isLoading ? "..." : "Search";
}


async function getWeather(city) {
  if (!city.trim()) {
    inputEl.focus();
    return;
  }

  setLoading(true);
  showStatus("Loading...");
  hideStatus();


  // I have to learn this but this is just an example
  try {
    // ── STEP A: Geocoding API (city name → coordinates)
    const geoUrl =
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const geoResponse = await fetch(geoUrl);
    if (!geoResponse.ok) throw new Error("Geocoding failed");

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      showStatus(`City "${city}" not found. Try a different spelling.`, true);
      setLoading(false);
      return;
    }

    const place = geoData.results[0];
    const { latitude, longitude, name, country_code } = place;

    // ── STEP B: Weather API (coordinates → current weather)
    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
      `&timezone=auto`;

    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) throw new Error("Weather fetch failed");

    const weatherData = await weatherResponse.json();
    const current = weatherData.current;

    // ── STEP C: Update the page
    renderWeather({
      cityLabel: `${name}, ${country_code}`,
      temp: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      humidity: current.relative_humidity_2m,
      wind: Math.round(current.wind_speed_10m),
      code: current.weather_code
    });

    hideStatus();
  } catch (err) {
    console.error(err);
    showStatus("Something went wrong. Check your internet and try again.", true);
  } finally {
    setLoading(false);
  }
}

function renderWeather(data) {
  const meta = WEATHER_CODES[data.code] || { icon: "🌡️", label: "Unknown" };

  cityNameEl.textContent = data.cityLabel;
  iconEl.textContent = meta.icon;
  tempEl.textContent = `${data.temp}°C`;
  conditionEl.textContent = meta.label;
  feelsLikeEl.textContent = `${data.feelsLike}°C`;
  humidityEl.textContent = `${data.humidity}%`;
  windEl.textContent = `${data.wind} km/h`;

  cardEl.classList.remove("hidden");
}

searchBtn.addEventListener("click", () => getWeather(inputEl.value));

inputEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter") getWeather(inputEl.value);
});

inputEl.value = "Lagos";
getWeather("Lagos");