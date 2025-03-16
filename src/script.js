//DOM elements
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");
const currentWeatherDiv = document.getElementById("current-weather");
const extendedForecastDiv = document.getElementById("extended-forecast");

//API configuration
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather"; // Base URL for current weather data
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"; // URL for extended forecast
const API_KEY = API_Key;


//Fetching weather data for a given city
async function fetchWeather(city){
    try{
        if(!city) throw new Error("Please enter city name");

        //Loading
        currentWeatherDiv.innerHTML = `<p class='text-blue-500'>Loading...</p>`;
        searchBtn.disabled = true;

        const response = await fetch(`${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        if (!response.ok) throw new Error("City not found");
        const data = await response.json();
        console.log(data);
        displayCurrentWeather(data);
        fetchExtendedForecast(city);
    }catch(error){
        currentWeatherDiv.innerHTML = `<p class='text-red-500'>${error.message}</p>`;

    }finally {
        // Re-enable button after fetching data
        searchBtn.disabled = false;
      }
}


//Display current weather details 
function displayCurrentWeather(data){
    currentWeatherDiv.innerHTML = `
    <h2 class="text-xl font-bold">${data.name}</h2>
    <p>Temperature: ${data.main.temp} °C</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind Speed: ${data.wind.speed} m/s</p>
    <p>Description: ${data.weather[0].description}</p>
    `;
}

//Fetch extended weather forecast
async function fetchExtendedForecast(city) {
    try {
      const response = await fetch(`${FORECAST_URL}?q=${city}&appid=${API_KEY}&units=metric`);
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
    extendedForecastDiv.innerHTML = dailyData.map(day => `
      <div class="p-4 border rounded shadow bg-green-500">
        <h3>${new Date(day.dt_txt).toLocaleDateString()}</h3>
        <p>Temp: ${day.main.temp} °C</p>
        <p>Wind: ${day.wind.speed} m/s</p>
        <p>Humidity: ${day.main.humidity}%</p>
      </div>
    `).join("");
}

//Event Listeners 
searchBtn.addEventListener("click", ()=> fetchWeather(cityInput.value.trim()));