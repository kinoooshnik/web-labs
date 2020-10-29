const DEFAULT_CITY = {
    coords: {
        latitude: 59.89,
        longitude: 30.26
    }
}
const WEATHER_API_URL = "https://api.weatherapi.com/v1/current.json"
const WEATHER_API_KEY = "621a48e10fad43b3849183044202810"

const BAD_REQUEST = "Bad request"
const BAD_REQUEST_MESSAGE = "По такому запросу городов не найдено."

const FAILED_FETCH_MESSAGE = "Что-то пошло не так. Повторите попытку позже."

const SELECTED_CITIES_STORAGE_NAME = "selectedCities"

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(setMainWeather, () => setMainWeather(DEFAULT_CITY));
    } else {
        setMainWeather(DEFAULT_CITY)
    }
}

function setMainWeather(position) {
    getWeatherFor(`${position.coords.latitude},${position.coords.longitude}`).then(
        setMainCity,
        err => {
            if (err instanceof TypeError) {
                alert(FAILED_FETCH_MESSAGE)
            } else {
                throw err
            }
        }
    );
}

async function getWeatherFor(q) {
    const response = await fetch(`${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=${q}`);
    if (response.status === 400) {
        throw new Error(BAD_REQUEST)
    }
    return await response.json();
}

function responseToObj(jsonResponse) {
    return {
        placeName: jsonResponse.location.name,
        coords: {
            lat: jsonResponse.location.lat,
            lon: jsonResponse.location.lon,
            str: `[${jsonResponse.location.lat}, ${jsonResponse.location.lon}]`
        },
        temp: jsonResponse.current.temp_c + "°C",
        wind: jsonResponse.current.wind_kph + " kp/h",
        cloud: jsonResponse.current.cloud + "%",
        pressure: jsonResponse.current.pressure_mb + " hpa",
        humidity: jsonResponse.current.humidity + "%",
        img: {
            alt: jsonResponse.current.condition.text,
            url: jsonResponse.current.condition.icon.replace(/64x64/, "128x128"),
        }
    }
}

function setMainCity(jsonResponse) {
    const weather = responseToObj(jsonResponse)

    let mainCityLoader = document.getElementById("main-city-loader");
    let mainCityTemplate = document.getElementById("main-city-template");
    let mainCity = mainCityTemplate.content.cloneNode(true);
    mainCity = fillCityNode(mainCity, weather)

    mainCityLoader.parentElement.insertBefore(mainCity, mainCityLoader.nextSibling);
    mainCityLoader.style.display = "none";
}

function fillCityNode(node, weather) {
    node.querySelector('.city-name').innerHTML = weather.placeName
    node.querySelector('.temperature').innerHTML = weather.temp
    node.querySelector('.wind').innerHTML = weather.wind
    node.querySelector('.cloud').innerHTML = weather.cloud
    node.querySelector('.pressure').innerHTML = weather.pressure
    node.querySelector('.humidity').innerHTML = weather.humidity
    node.querySelector('.coords').innerHTML = weather.coords.str
    node.querySelector('.weather-icon').src = weather.img.url
    node.querySelector('.weather-icon').alt = weather.img.alt
    return node
}

function refreshGeo() {
    let mainCity = document.querySelector(".main-city")
    if (mainCity != null) {
        mainCity.remove()
    }
    let mainCityLoader = document.getElementById("main-city-loader");
    mainCityLoader.style.display = "flex";
    getLocation()
}

function addSelectedCityInStorage(cityName, id) {
    let cities = localStorage.getItem(SELECTED_CITIES_STORAGE_NAME)
    if (cities == null) {
        cities = {}
    } else {
        cities = JSON.parse(cities)
    }
    cities[id] = cityName
    localStorage.setItem(SELECTED_CITIES_STORAGE_NAME, JSON.stringify(cities))
}

function getAllSelectedCityFromStorage() {
    let cities = localStorage.getItem(SELECTED_CITIES_STORAGE_NAME)
    if (cities == null) {
        cities = {}
    } else {
        cities = JSON.parse(cities)
    }
    return cities
}

function deleteSelectedCityFromStorage(id) {
    let cities = localStorage.getItem(SELECTED_CITIES_STORAGE_NAME);
    if (cities == null) {
        cities = {}
    } else {
        cities = JSON.parse(cities)
    }
    if (id in cities) {
        delete cities[id];
    }
    localStorage.setItem(SELECTED_CITIES_STORAGE_NAME, JSON.stringify(cities))
}

async function addCity(name, id = null) {
    let selectedCities = document.querySelector(".selected-cities");
    let loaderTemplate = document.getElementById("selected-city-loader-template");
    let loader = loaderTemplate.content.cloneNode(true);
    const loader_id = `f${(~~(Math.random() * 1e8)).toString(16)}`;
    loader.querySelector(".loader").id = loader_id

    selectedCities.appendChild(loader)
    try {
        const jsonResponse = await getWeatherFor(name);

        const weather = responseToObj(jsonResponse);
        let selectedCityTemplate = document.getElementById("selected-city-template");

        let selectedCity = selectedCityTemplate.content.cloneNode(true);
        selectedCity = fillCityNode(selectedCity, weather)

        if (id == null) {
            id = `f${(~~(Math.random() * 1e8)).toString(16)}`;
            addSelectedCityInStorage(weather.placeName, id);
        }
        selectedCity.querySelector(".selected-city").id = id;

        selectedCities.appendChild(selectedCity);

        document.getElementById(id).querySelector(".close-button").addEventListener("click", function () {
            document.getElementById(id).remove()
            deleteSelectedCityFromStorage(id)
        })
    } catch (e) {
        if (e.message === BAD_REQUEST) {
            alert(BAD_REQUEST_MESSAGE)
        } else if (e instanceof TypeError) {
            alert(FAILED_FETCH_MESSAGE)
        } else {
            throw e;
        }
    }
    document.getElementById(loader_id).remove();

}

function restoreSelectedCities() {
    const cities = getAllSelectedCityFromStorage();
    let prom = new Promise(resolve => resolve());
    for (let [id, cityName] of Object.entries(cities)) {
        prom = prom.then(() => addCity(cityName, id));
    }
}

function addButtonListener() {
    let newCityInput = document.querySelector('.new-city-input');
    const value = newCityInput.value;
    newCityInput.value = "";
    addCity(value);
}

document.querySelector(".header-refresh-button").onclick = refreshGeo;
document.querySelector(".circle-button.plus-button").onclick = addButtonListener;

getLocation();
restoreSelectedCities()

