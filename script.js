
// 1. GET HTML ELEMENTS
const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const message = document.getElementById("message");

const weatherCard = document.getElementById("weatherCard");
const cityName = document.getElementById("cityName");
const weatherDescription = document.getElementById("weatherDescription");
const temperature = document.getElementById("temperature");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const feelsLike = document.getElementById("feelsLike");
const weatherTime = document.getElementById("weatherTime");

// 2. CONVERT WEATHER CODE INTO DESCRIPTION
function getWeatherDescription(code) {
    const weatherConditions = {
        0: "Clear Sky ☀️",
        1: "Mainly Clear 🌤️",
        2: "Partly Cloudy ⛅",
        3: "Overcast ☁️",
        45: "Foggy 🌫️",
        48: "Depositing Rime Fog 🌫️",
        51: "Light Drizzle 🌦️",
        53: "Moderate Drizzle 🌦️",
        55: "Dense Drizzle 🌧️",
        61: "Slight Rain 🌧️",
        63: "Moderate Rain 🌧️",
        65: "Heavy Rain 🌧️",
        71: "Slight Snow ❄️",
        73: "Moderate Snow ❄️",
        75: "Heavy Snow ❄️",
        80: "Rain Showers 🌦️",
        81: "Moderate Rain Showers 🌧️",
        82: "Heavy Rain Showers 🌧️",
        95: "Thunderstorm ⛈️",
        96: "Thunderstorm with Hail ⛈️",
        99: "Heavy Thunderstorm ⛈️"
    };

    return weatherConditions[code] || "Weather information unavailable";
}

// 3. GET CITY COORDINATES
async function getCityCoordinates(city) {
    const url =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to find city. Please try again.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found! Please enter a valid city name.");
    }

    return data.results[0];
}

// 4. FETCH WEATHER DATA
async function getWeather(latitude, longitude) {
    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to fetch weather data. Try again later.");
    }

    const data = await response.json();

    if (!data.current) {
        throw new Error("Weather information is currently unavailable.");
    }

    return data;
}

// 5. DISPLAY WEATHER INFORMATION
function displayWeather(city, data) {
    const current = data.current;

    cityName.textContent =
        `${city.name}, ${city.country}`;

    weatherDescription.textContent =
        getWeatherDescription(current.weather_code);

    temperature.textContent =
        Math.round(current.temperature_2m);

    humidity.textContent =
        `${current.relative_humidity_2m}%`;

    windSpeed.textContent =
        `${current.wind_speed_10m} km/h`;

    feelsLike.textContent =
        `${Math.round(current.apparent_temperature)}°C`;

    weatherTime.textContent =
        `Local time: ${current.time.replace("T", " ")}`;

    weatherCard.hidden = false;
}

// 6. HANDLE SEARCH FORM
searchForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (city === "") {
        message.textContent = "Please enter a city name!";
        weatherCard.hidden = true;
        return;
    }

    searchButton.disabled = true;
    searchButton.textContent = "Loading...";
    message.textContent = "Fetching weather information...";
    weatherCard.hidden = true;

    try {
        // First, find the city coordinates
        const cityData = await getCityCoordinates(city);

        // Next, fetch weather using those coordinates
        const weatherData = await getWeather(
            cityData.latitude,
            cityData.longitude
        );

        // Finally, display the weather
        displayWeather(cityData, weatherData);

        message.textContent = "Weather information loaded successfully!";

    } catch (error) {
        message.textContent = error.message;
        weatherCard.hidden = true;

        console.error("Weather Error:", error);

    } finally {
        searchButton.disabled = false;
        searchButton.textContent = "Search";
    }
});

// 7. INITIAL MESSAGE
message.textContent = "Search for a city to see its current weather.";
