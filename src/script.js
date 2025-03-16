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
    }catch(error){
        console.log(error);

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

//Event Listeners 
searchBtn.addEventListener("click", ()=> fetchWeather(cityInput.value.trim()));