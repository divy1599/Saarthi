const form = document.getElementById("searchForm");
const locationInput = document.getElementById("locationInput");
const categoryInput = document.getElementById("categoryInput");
const resultsContainer = document.getElementById("results");
const statusText = document.getElementById("statusText");
const template = document.getElementById("placeCardTemplate");
const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");
const logoutButton = document.getElementById("logoutButton");
const userChip = document.getElementById("userChip");
const authModal = document.getElementById("authModal");
const closeModalButton = document.getElementById("closeModalButton");
const authForm = document.getElementById("authForm");
const locationForm = document.getElementById("locationForm");
const placeNameInput = document.getElementById("placeNameInput");
const cityInput = document.getElementById("cityInput");
const stateInput = document.getElementById("stateInput");
const regionInput = document.getElementById("regionInput");
const submitCategoryInput = document.getElementById("submitCategoryInput");
const bestSeasonInput = document.getElementById("bestSeasonInput");
const imageUrlInput = document.getElementById("imageUrlInput");
const mapsUrlInput = document.getElementById("mapsUrlInput");
const latitudeInput = document.getElementById("latitudeInput");
const longitudeInput = document.getElementById("longitudeInput");
const descriptionInput = document.getElementById("descriptionInput");
const locationFormFeedback = document.getElementById("locationFormFeedback");
const nameField = document.getElementById("nameField");
const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const authFeedback = document.getElementById("authFeedback");
const authModalEyebrow = document.getElementById("authModalEyebrow");
const authModalTitle = document.getElementById("authModalTitle");
const authModalCopy = document.getElementById("authModalCopy");
const authSubmitButton = document.getElementById("authSubmitButton");
const mapCanvas = document.getElementById("mapCanvas");
const mapStatus = document.getElementById("mapStatus");
const locateButton = document.getElementById("locateButton");
const trackButton = document.getElementById("trackButton");
const stopTrackingButton = document.getElementById("stopTrackingButton");
const userLocationLabel = document.getElementById("userLocationLabel");
const userLocationWeather = document.getElementById("userLocationWeather");
const weatherCache = new Map();
const MAX_VISIBLE_PLACES = 5;

let authMode = "login";
let selectedPlace = null;
let currentPosition = null;
let mapScriptPromise = null;
let mapInstance = null;
let placeMarker = null;
let userMarker = null;
let directionsService = null;
let directionsRenderer = null;
let trackingWatchId = null;
let mapReady = false;
let sessionState = { authenticated: false };
let userWeatherLoaded = false;

const placeCoordinates = {
    "Amber Fort": { latitude: 26.9855, longitude: 75.8513 },
    "Hawa Mahal": { latitude: 26.9239, longitude: 75.8267 },
    "Udaipur City Palace": { latitude: 24.5767, longitude: 73.6835 },
    "Dal Lake": { latitude: 34.1183, longitude: 74.8684 },
    "Gateway of India": { latitude: 18.922, longitude: 72.8347 },
    "Ajanta Caves": { latitude: 20.5522, longitude: 75.7033 },
    "Tarkarli Beach": { latitude: 16.0374, longitude: 73.4905 },
    "Meenakshi Temple": { latitude: 9.9195, longitude: 78.1193 },
    "Marina Beach": { latitude: 13.05, longitude: 80.2824 },
    "Mysore Palace": { latitude: 12.3052, longitude: 76.6552 },
    "Bandipur National Park": { latitude: 11.6586, longitude: 76.6296 },
    "Marine Drive": { latitude: 9.9816, longitude: 76.2756 },
    "Munnar Tea Gardens": { latitude: 10.0889, longitude: 77.0595 },
    "Varkala Cliff Beach": { latitude: 8.7346, longitude: 76.7066 },
    "Kaziranga National Park": { latitude: 26.5775, longitude: 93.1711 },
    "Nohkalikai Falls": { latitude: 25.2753, longitude: 91.6924 },
    "Taj Mahal": { latitude: 27.1751, longitude: 78.0421 },
    "Radhanagar Beach": { latitude: 11.9849, longitude: 92.9473 }
};

const weatherCodeLabels = {
    0: "Clear sky",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Foggy",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Strong showers",
    82: "Intense showers",
    95: "Thunderstorm",
    96: "Thunderstorm",
    99: "Severe thunderstorm"
};

function apiUrl(location = "", category = "") {
    const params = new URLSearchParams();

    if (location.trim()) {
        params.set("location", location.trim());
    }

    if (category.trim()) {
        params.set("category", category.trim());
    }

    const query = params.toString();
    return query ? `api/places?${query}` : "api/places";
}

function weatherUrl(latitude, longitude) {
    const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        current: "temperature_2m,weather_code,wind_speed_10m,is_day",
        timezone: "auto"
    });

    return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

function fallbackImageUrl(place) {
    const seed = encodeURIComponent(`${place.name}-${place.state}-${place.category}`);
    return `https://picsum.photos/seed/${seed}/900/600`;
}

function getMapsApiKey() {
    return window.SAARTHI_CONFIG?.googleMapsApiKey || "";
}

function getPlaceCoordinates(place) {
    if (placeCoordinates[place.name]) {
        return placeCoordinates[place.name];
    }

    if (typeof place.latitude === "number" && typeof place.longitude === "number") {
        return { latitude: place.latitude, longitude: place.longitude };
    }

    return null;
}

function updateMapStatus(message) {
    mapStatus.textContent = message;
}

function openExternalMap(place) {
    if (place?.mapsUrl) {
        window.open(place.mapsUrl, "_blank", "noopener,noreferrer");
    }
}

function canUseGeolocation() {
    return "geolocation" in navigator;
}

function normalizePosition(position) {
    return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: Math.round(position.coords.accuracy || 0)
    };
}

function ensureMapConfigured() {
    const apiKey = getMapsApiKey();
    if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY") {
        updateMapStatus("Google Maps key is not added yet. Saarthi will still open the destination in Google Maps.");
        return false;
    }

    return true;
}

function loadMapsScript() {
    if (window.google?.maps) {
        return Promise.resolve();
    }

    if (mapScriptPromise) {
        return mapScriptPromise;
    }

    const apiKey = getMapsApiKey();
    mapScriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.async = true;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async&libraries=routes`;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Google Maps could not be loaded."));
        document.head.appendChild(script);
    });

    return mapScriptPromise;
}

async function ensureMapReady() {
    if (!ensureMapConfigured()) {
        return false;
    }

    if (mapReady) {
        return true;
    }

    await loadMapsScript();

    mapInstance = new google.maps.Map(mapCanvas, {
        center: { lat: 22.9734, lng: 78.6569 },
        zoom: 5,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: mapInstance,
        suppressMarkers: true
    });

    mapReady = true;
    return true;
}

function ensureUserMarker() {
    if (!userMarker) {
        userMarker = new google.maps.Marker({
            map: mapInstance,
            title: "Your location",
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#1e6f5c",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2
            }
        });
    }
}

function ensurePlaceMarker() {
    if (!placeMarker) {
        placeMarker = new google.maps.Marker({
            map: mapInstance,
            title: "Destination"
        });
    }
}

function updateMapMarkers() {
    if (!mapReady) {
        return;
    }

    const placeCoords = selectedPlace ? getPlaceCoordinates(selectedPlace) : null;

    if (placeCoords) {
        ensurePlaceMarker();
        placeMarker.setPosition(placeCoords);
        placeMarker.setTitle(selectedPlace.name);
    }

    if (currentPosition) {
        ensureUserMarker();
        userMarker.setPosition(currentPosition);
    }
}

async function drawRouteIfPossible() {
    if (!mapReady || !selectedPlace || !currentPosition) {
        return;
    }

    const placeCoords = getPlaceCoordinates(selectedPlace);
    if (!placeCoords) {
        updateMapStatus(`Map coordinates are not configured yet for ${selectedPlace.name}.`);
        return;
    }

    directionsRenderer.set("directions", null);
    updateMapMarkers();

    directionsService.route({
        origin: currentPosition,
        destination: placeCoords,
        travelMode: google.maps.TravelMode.DRIVING
    }, (result, status) => {
        if (status === "OK") {
            directionsRenderer.setDirections(result);
            const leg = result.routes?.[0]?.legs?.[0];
            const distance = leg?.distance?.text ? ` | ${leg.distance.text}` : "";
            const duration = leg?.duration?.text ? ` | ${leg.duration.text}` : "";
            updateMapStatus(`Tracking route to ${selectedPlace.name}${distance}${duration}`);
            return;
        }

        mapInstance.panTo(placeCoords);
        mapInstance.setZoom(11);
        updateMapStatus(`Loaded ${selectedPlace.name} on the map, but turn-by-turn directions are unavailable right now.`);
    });
}

async function focusPlaceOnMap(place) {
    selectedPlace = place;

    const placeCoords = getPlaceCoordinates(place);
    if (!placeCoords) {
        updateMapStatus(`Coordinates are not available yet for ${place.name}.`);
        return;
    }

    try {
        const ready = await ensureMapReady();
        if (!ready) {
            openExternalMap(place);
            return;
        }

        updateMapMarkers();
        mapInstance.panTo(placeCoords);
        mapInstance.setZoom(11);
        ensurePlaceMarker();
        placeMarker.setPosition(placeCoords);
        placeMarker.setTitle(place.name);

        if (currentPosition) {
            await drawRouteIfPossible();
        } else {
            updateMapStatus(`Loaded ${place.name}. Use My GPS or Start Live Tracking to route yourself there.`);
        }
    } catch (error) {
        updateMapStatus(error.message);
    }
}

function getCurrentPositionPromise() {
    return new Promise((resolve, reject) => {
        if (!canUseGeolocation()) {
            reject(new Error("Geolocation is not supported in this browser."));
            return;
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    });
}

async function locateUser() {
    if (!selectedPlace) {
        updateMapStatus("Choose a place first, then Saarthi can route your current GPS position.");
        return;
    }

    try {
        const ready = await ensureMapReady();
        if (!ready) {
            openExternalMap(selectedPlace);
            return;
        }

        const position = await getCurrentPositionPromise();
        currentPosition = normalizePosition(position);
        await drawRouteIfPossible();
    } catch (error) {
        updateMapStatus(`Could not read your GPS location: ${error.message || "permission denied."}`);
    }
}

async function startTracking() {
    if (!selectedPlace) {
        updateMapStatus("Choose a place first, then start live tracking.");
        return;
    }

    const ready = await ensureMapReady();
    if (!ready) {
        openExternalMap(selectedPlace);
        return;
    }

    if (!canUseGeolocation()) {
        updateMapStatus("Geolocation is not supported in this browser.");
        return;
    }

    if (trackingWatchId !== null) {
        return;
    }

    trackingWatchId = navigator.geolocation.watchPosition(async (position) => {
        currentPosition = normalizePosition(position);
        stopTrackingButton.classList.remove("hidden");
        trackButton.classList.add("hidden");
        await drawRouteIfPossible();
    }, (error) => {
        updateMapStatus(`Live tracking stopped: ${error.message}`);
        stopTracking();
    }, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    });

    updateMapStatus(`Live GPS tracking started for ${selectedPlace.name}. Move with your device to keep the route updated.`);
}

function stopTracking() {
    if (trackingWatchId !== null && canUseGeolocation()) {
        navigator.geolocation.clearWatch(trackingWatchId);
    }

    trackingWatchId = null;
    stopTrackingButton.classList.add("hidden");
    trackButton.classList.remove("hidden");

    if (selectedPlace) {
        updateMapStatus(`Live tracking stopped. ${selectedPlace.name} remains selected on the map.`);
    }
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(payload.error || "Request failed.");
    }

    return payload;
}

async function fetchPlaces(location = "", category = "") {
    return fetchJson(apiUrl(location, category), { headers: {} });
}

function distanceInKm(first, second) {
    const toRadians = (value) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const latDelta = toRadians(second.latitude - first.lat);
    const lngDelta = toRadians(second.longitude - first.lng);
    const startLat = toRadians(first.lat);
    const endLat = toRadians(second.latitude);
    const a = Math.sin(latDelta / 2) ** 2
        + Math.cos(startLat) * Math.cos(endLat) * Math.sin(lngDelta / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
}

function sortPlacesForDisplay(places) {
    if (!currentPosition) {
        return [...places].sort((left, right) =>
            (left.state || "").localeCompare(right.state || "", undefined, { sensitivity: "base" })
            || (left.name || "").localeCompare(right.name || "", undefined, { sensitivity: "base" })
        );
    }

    return [...places]
        .map((place) => {
            const coordinates = getPlaceCoordinates(place);
            return {
                place,
                distance: coordinates ? distanceInKm(currentPosition, coordinates) : Number.POSITIVE_INFINITY
            };
        })
        .sort((left, right) => left.distance - right.distance)
        .map((item) => item.place);
}

async function fetchWeather(place) {
    if (weatherCache.has(place.name)) {
        return weatherCache.get(place.name);
    }

    const coordinates = getPlaceCoordinates(place);
    if (!coordinates) {
        return null;
    }

    const response = await fetch(weatherUrl(coordinates.latitude, coordinates.longitude));
    if (!response.ok) {
        throw new Error("Weather unavailable");
    }

    const payload = await response.json();
    const current = payload.current;
    if (!current) {
        return null;
    }

    const weather = {
        temperature: Math.round(current.temperature_2m),
        condition: weatherCodeLabels[current.weather_code] || "Current weather",
        windSpeed: Math.round(current.wind_speed_10m),
        isDay: current.is_day === 1
    };

    weatherCache.set(place.name, weather);
    return weather;
}

async function attachWeather(place, weatherNode) {
    try {
        const weather = await fetchWeather(place);
        if (!weather) {
            weatherNode.textContent = "Weather unavailable";
            weatherNode.classList.remove("weather-loading");
            return;
        }

        weatherNode.textContent = `${weather.temperature}°C | ${weather.condition} | Wind ${weather.windSpeed} km/h`;
        weatherNode.classList.remove("weather-loading");
        weatherNode.classList.toggle("weather-night", !weather.isDay);
    } catch (error) {
        weatherNode.textContent = "Weather unavailable";
        weatherNode.classList.remove("weather-loading");
    }
}

async function loadUserLocationWeather() {
    if (userWeatherLoaded) {
        return;
    }

    if (!canUseGeolocation()) {
        userLocationLabel.textContent = "GPS unavailable in this browser";
        userLocationWeather.textContent = "Destination weather still updates live in the tabs below.";
        return;
    }

    try {
        const position = await getCurrentPositionPromise();
        currentPosition = normalizePosition(position);
        userWeatherLoaded = true;
        userLocationLabel.textContent = `Lat ${currentPosition.lat.toFixed(2)} | Lon ${currentPosition.lng.toFixed(2)}`;

        const response = await fetch(weatherUrl(currentPosition.lat, currentPosition.lng));
        const payload = await response.json();
        const current = payload.current;

        if (!current) {
            userLocationWeather.textContent = "Could not load your local weather just now.";
            return;
        }

        const condition = weatherCodeLabels[current.weather_code] || "Current weather";
        userLocationWeather.textContent = `${Math.round(current.temperature_2m)}°C | ${condition} | Wind ${Math.round(current.wind_speed_10m)} km/h`;
    } catch (error) {
        userLocationLabel.textContent = "Location permission not granted";
        userLocationWeather.textContent = "Enable GPS to sort the closest places first.";
    }
}

function buildPlaceCard(place) {
    const card = template.content.cloneNode(true);
    const imageNode = card.querySelector(".place-image");
    imageNode.src = place.imageUrl || fallbackImageUrl(place);
    imageNode.alt = place.name;
    imageNode.addEventListener("error", () => {
        if (imageNode.dataset.fallbackApplied === "true") {
            return;
        }

        imageNode.dataset.fallbackApplied = "true";
        imageNode.src = fallbackImageUrl(place);
    }, { once: true });

    card.querySelector(".category-pill").textContent = place.category;
    card.querySelector(".state-pill").textContent = place.state;
    card.querySelector(".season-pill").textContent = `Best: ${place.bestSeason}`;
    card.querySelector(".place-name").textContent = place.name;
    card.querySelector(".place-location").textContent = `${place.location} | ${place.region}`;
    card.querySelector(".place-description").textContent = place.description;

    const link = card.querySelector(".place-link");
    link.href = place.mapsUrl;
    link.textContent = "Open in Maps";

    const weatherNode = card.querySelector(".weather-pill");
    attachWeather(place, weatherNode);

    const trackButtonNode = card.querySelector(".track-place-button");
    trackButtonNode.addEventListener("click", () => {
        focusPlaceOnMap(place);
    });

    return card;
}

function renderPlaces(places) {
    resultsContainer.innerHTML = "";
    resultsContainer.classList.add("places-strip");

    if (!places.length) {
        const emptyState = document.createElement("div");
        emptyState.className = "empty-state";
        emptyState.textContent = "No places matched this search yet. Try another city, state, or category.";
        resultsContainer.appendChild(emptyState);
        return;
    }

    const sortedPlaces = sortPlacesForDisplay(places).slice(0, MAX_VISIBLE_PLACES);
    sortedPlaces.forEach((place) => {
        resultsContainer.appendChild(buildPlaceCard(place));
    });
}

function openAuthModal(mode) {
    authMode = mode;
    authFeedback.textContent = "";
    authForm.reset();

    const isRegister = mode === "register";
    nameField.classList.toggle("hidden", !isRegister);
    authModalEyebrow.textContent = isRegister ? "Create your account" : "Welcome back";
    authModalTitle.textContent = isRegister ? "Register with Saarthi" : "Login to Saarthi";
    authModalCopy.textContent = isRegister
        ? "Register once to keep your access ready while you browse destinations by state."
        : "Login and continue exploring curated destinations across India.";
    authSubmitButton.textContent = isRegister ? "Create account" : "Login";
    authModal.classList.remove("hidden");
    authModal.setAttribute("aria-hidden", "false");
}

function closeAuthModal() {
    authModal.classList.add("hidden");
    authModal.setAttribute("aria-hidden", "true");
}

function updateAuthUi(sessionPayload) {
    sessionState = sessionPayload || { authenticated: false };
    const authenticated = Boolean(sessionPayload?.authenticated);
    userChip.classList.toggle("hidden", !authenticated);
    logoutButton.classList.toggle("hidden", !authenticated);
    loginButton.classList.toggle("hidden", authenticated);
    registerButton.classList.toggle("hidden", authenticated);

    if (authenticated) {
        userChip.textContent = `Hi, ${sessionPayload.user.name}`;
        locationFormFeedback.textContent = "You can now submit new location details to Saarthi.";
    } else {
        userChip.textContent = "";
        locationFormFeedback.textContent = "Login first to save a new destination into the database.";
    }
}

async function loadSession() {
    try {
        const sessionPayload = await fetchJson("api/auth/session", { headers: {} });
        updateAuthUi(sessionPayload);
    } catch (error) {
        updateAuthUi({ authenticated: false });
    }
}

async function submitAuth(event) {
    event.preventDefault();
    authFeedback.textContent = "";

    const payload = {
        name: nameInput.value,
        email: emailInput.value,
        password: passwordInput.value
    };

    try {
        const response = await fetchJson(`api/auth/${authMode}`, {
            method: "POST",
            body: JSON.stringify(payload)
        });
        updateAuthUi(response);
        closeAuthModal();
        statusText.textContent = `Welcome ${response.user.name}. Your account is ready and destinations are grouped by state.`;
    } catch (error) {
        authFeedback.textContent = error.message;
    }
}

async function logout() {
    try {
        await fetchJson("api/auth/logout", {
            method: "POST",
            body: JSON.stringify({})
        });
    } finally {
        updateAuthUi({ authenticated: false });
    }
}

function parseNumberValue(value) {
    const normalized = value.trim();
    if (!normalized) {
        return null;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
}

async function submitLocation(event) {
    event.preventDefault();

    if (!sessionState.authenticated) {
        locationFormFeedback.textContent = "Please login first, then submit your destination details.";
        openAuthModal("login");
        return;
    }

    const payload = {
        placeName: placeNameInput.value,
        city: cityInput.value,
        state: stateInput.value,
        region: regionInput.value,
        category: submitCategoryInput.value,
        bestSeason: bestSeasonInput.value,
        imageUrl: imageUrlInput.value,
        mapsUrl: mapsUrlInput.value,
        latitude: parseNumberValue(latitudeInput.value),
        longitude: parseNumberValue(longitudeInput.value),
        description: descriptionInput.value
    };

    try {
        await fetchJson("api/location-submissions", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        locationFormFeedback.textContent = "Location details saved successfully. Saarthi has added your place to the live catalog.";
        locationForm.reset();
        await loadPlaces(locationInput.value, categoryInput.value);
    } catch (error) {
        locationFormFeedback.textContent = error.message;
    }
}

async function loadPlaces(location = "", category = "") {
    statusText.textContent = "Loading destinations...";

    try {
        await loadUserLocationWeather();
        const places = await fetchPlaces(location, category);
        renderPlaces(places);
        const visibleCount = Math.min(places.length, MAX_VISIBLE_PLACES);

        if (location || category) {
            const label = [location || "all locations", category || "all categories"].join(" | ");
            statusText.textContent = `Showing ${visibleCount} of ${places.length} result(s) for ${label} in compact row tabs.`;
        } else {
            statusText.textContent = currentPosition
                ? "Showing the 5 nearest destination picks with live weather."
                : "Showing five featured destinations with live weather.";
        }
    } catch (error) {
        resultsContainer.innerHTML = '<div class="empty-state">The app could not reach the Node.js backend right now. Start the server and refresh.</div>';
        statusText.textContent = "Backend connection required.";
    }
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    loadPlaces(locationInput.value, categoryInput.value);
});

authForm.addEventListener("submit", submitAuth);
loginButton.addEventListener("click", () => openAuthModal("login"));
registerButton.addEventListener("click", () => openAuthModal("register"));
logoutButton.addEventListener("click", logout);
closeModalButton.addEventListener("click", closeAuthModal);
authModal.addEventListener("click", (event) => {
    if (event.target.dataset.closeModal === "true") {
        closeAuthModal();
    }
});
locateButton.addEventListener("click", locateUser);
trackButton.addEventListener("click", startTracking);
stopTrackingButton.addEventListener("click", stopTracking);
locationForm.addEventListener("submit", submitLocation);

loadSession();
loadPlaces();
