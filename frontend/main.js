const DEFAULT_CITY = {
    coords: {
        latitude: 59.89,
        longitude: 30.26
    }
}
const API_URL = "http://localhost:3000"

const FAILED_FETCH_MESSAGE = "Что-то пошло не так. Повторите попытку позже."

class RequestError extends Error {
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(setMainWeather, () => setMainWeather(DEFAULT_CITY));
    } else {
        setMainWeather(DEFAULT_CITY)
    }
}

function setMainWeather(position) {
    getWeatherForCor(position.coords.latitude, position.coords.longitude).then(
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

async function getWeatherForCity(name) {
    const response = await fetch(`${API_URL}/weather/city?q=${name}`);
    let json = await response.json()
    if (response.status === 400) {
        throw new RequestError(json["message"])
    }
    return json;
}

async function getWeatherForCor(lat, lon) {
    const response = await fetch(`${API_URL}/weather/coordinates?lat=${lat}&lon=${lon}`);
    let json = await response.json()
    if (response.status === 400) {
        throw new RequestError(json["message"])
    }
    return json;
}

function setMainCity(weather) {

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

async function addSelectedCityInStorage(cityName) {
    let response = await fetch(`${API_URL}/favourites`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json;charset=utf-8'},
        body: JSON.stringify({"name": cityName})
    });
    let json = await response.json()
    if (response.status !== 200) {
        throw new RequestError(json["message"])
    }
    return json;
}

async function getAllSelectedCityFromStorage() {
    const response = await fetch(`${API_URL}/favourites`);
    let json = await response.json()
    if (response.status !== 200) {
        throw new RequestError(json["message"])
    }
    return json;
}

async function deleteSelectedCityFromStorage(id) {
    let response = await fetch(`${API_URL}/favourites?id=${id}`, {method: 'DELETE'});
    let json = await response.json()
    if (response.status !== 200) {
        throw new RequestError(json["message"])
    }
    return json;
}

async function addCity(name, id = null) {
    let selectedCities = document.querySelector(".selected-cities");
    let loaderTemplate = document.getElementById("selected-city-loader-template");
    let loader = loaderTemplate.content.cloneNode(true);
    const loader_id = `f${(~~(Math.random() * 1e8)).toString(16)}`;
    loader.querySelector(".loader").id = loader_id

    selectedCities.appendChild(loader)
    try {
        const weather = await getWeatherForCity(name);

        let selectedCityTemplate = document.getElementById("selected-city-template");

        let selectedCity = selectedCityTemplate.content.cloneNode(true);
        selectedCity = fillCityNode(selectedCity, weather)

        if (id == null) {
            cityObj = await addSelectedCityInStorage(weather.placeName, id);
            id = cityObj._id;
        }
        selectedCity.querySelector(".selected-city").id = id;

        selectedCities.appendChild(selectedCity);

        document.getElementById(id).querySelector(".close-button").addEventListener("click", async () => {
            document.getElementById(id).remove()
            await deleteSelectedCityFromStorage(id)
        })
    } catch (e) {
        if (e instanceof RequestError) {
            alert(e.message)
        } else if (e instanceof TypeError) {
            alert(FAILED_FETCH_MESSAGE)
        } else {
            throw e;
        }
    }
    document.getElementById(loader_id).remove();

}

async function restoreSelectedCities() {
    const cities = await getAllSelectedCityFromStorage();
    let prom = new Promise(resolve => resolve());
    for (let obj of cities) {
        prom = prom.then(() => addCity(obj.name, obj._id));
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
    .catch(err => {
        if (err instanceof RequestError) {
            alert(err.message)
        }
    })

module.exports = {
    getWeatherForCity,
    getWeatherForCor,
    addSelectedCityInStorage,
    getAllSelectedCityFromStorage,
    deleteSelectedCityFromStorage,
};