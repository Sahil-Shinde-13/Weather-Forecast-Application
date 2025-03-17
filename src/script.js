//DOM elements
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");
const currentWeatherDiv = document.getElementById("current-weather");
const extendedForecastDiv = document.getElementById("extended-forecast");

//API configuration
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather"; // Base URL for current weather data
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"; // URL for extended forecast
const API_Key = API_KEY;

// DropDown list for recent searches 
const recentSearchesDropdown = document.createElement("select");
recentSearchesDropdown.className = "mt-2 p-2 border";
document.querySelector('#weather-app').prepend(recentSearchesDropdown);
recentSearchesDropdown.style.display = "none";

//save recent city searches to local storage
function saveRecentSearch(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (!cities.includes(city)) {
    cities.unshift(city);
    if (cities.length > 5) cities.pop(); // Keep only the last 5 searches
    localStorage.setItem("recentCities", JSON.stringify(cities));
  }
  updateRecentSearches();
}

// Update the dropdown with recent searches
function updateRecentSearches() {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  recentSearchesDropdown.innerHTML = "<option>Select Recent City</option>";
  cities.forEach(city => {
    let option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    recentSearchesDropdown.appendChild(option);
  });
  recentSearchesDropdown.style.display = cities.length ? "block" : "none";
}


//Fetching weather data for a given city
async function fetchWeather(city){
    try{
        if(!city) throw new Error("Please enter city name");

        //Loading
        currentWeatherDiv.innerHTML = `<p class='text-blue-500'>Loading...</p>`;
        searchBtn.disabled = true;

        const response = await fetch(`${BASE_URL}?q=${city}&appid=${API_Key}&units=metric`);
        if (!response.ok) throw new Error("City not found");
        const data = await response.json();
        displayCurrentWeather(data);
        fetchExtendedForecast(city);
        saveRecentSearch(city);
    }catch(error){
        currentWeatherDiv.innerHTML = `<p class='text-red-500'>${error.message}</p>`;

    }finally {
        // Re-enable button after fetching data
        searchBtn.disabled = false;
      }
}


//Display current weather details 
function displayCurrentWeather(data){
  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    currentWeatherDiv.innerHTML = `
    <div class="flex flex-col items-center text-center p-4 bg-blue-500 text-white">
    <h2 class="text-xl font-bold">${data.name}</h2>
    <img src="${iconUrl}" alt="${data.weather[0].description}" class="w-20 h-20">
    <p>Temperature: ${data.main.temp} °C</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind Speed: ${data.wind.speed} m/s</p>
    <p>Description: ${data.weather[0].description}</p>
    </div>
    `;
}

//Fetch extended weather forecast
async function fetchExtendedForecast(city) {
    try {
      const response = await fetch(`${FORECAST_URL}?q=${city}&appid=${API_Key}&units=metric`);
      if (!response.ok) throw new Error("Failed to fetch forecast");
      const data = await response.json();
      displayExtendedForecast(data);
    } catch (error) {
      extendedForecastDiv.innerHTML = `<p class='text-red-500'>${error.message}</p>`;
    }
  }

//Display extended forecast
function displayExtendedForecast(data){
    const dailyData = data.list.filter((_, index) => index % 8 === 0); // Get daily data from 3-hour interval forecast
    extendedForecastDiv.innerHTML = dailyData.map(day => {
      const iconCode = day.weather[0].icon;
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    return `
      <div class="flex flex-col items-center text-center p-4 border rounded shadow bg-green-500 text-white">
        <h3>${new Date(day.dt_txt).toLocaleDateString()}</h3>
        <img src="${iconUrl}" alt="${day.weather[0].description}" class="w-16 h-16">
        <p>Temp: ${day.main.temp} °C</p>
        <p>Wind: ${day.wind.speed} m/s</p>
        <p>Humidity: ${day.main.humidity}%</p>
      </div>
    `;
    }).join("");
}


//Fetch weather by current location
function fetchWeatherLocation(lat,lon){
  fetch(`${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_Key}&units=metric`)
  .then(response => response.json())
  .then(data =>{
    displayCurrentWeather(data);
    fetchExtendedForecast(data.name);
  })
  .catch(error =>{
    currentWeatherDiv.innerHTML = `<p class='text-red-500'>Error: ${error.message}</p>`
  })
};

//Event Listeners 
searchBtn.addEventListener("click", ()=> fetchWeather(cityInput.value.trim()));
recentSearchesDropdown.addEventListener("change", () => fetchWeather(recentSearchesDropdown.value));
locationBtn.addEventListener("click", () =>{
  navigator.geolocation.getCurrentPosition(
    position => fetchWeatherLocation(position.coords.latitude, position.coords.longitude),
    error =>{
      let messages = ["Location access denied.", "Location unavailable.", "Location request time out."];
      currentWeatherDiv.innerHTML = `<p class='text-red-500'>${messages[error.code - 1] || "Unable to retrieve location."}</p>`;
    }
  );
});

updateRecentSearches();