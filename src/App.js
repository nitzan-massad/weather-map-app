import React, {useState, useEffect} from "react";
import "./App.css";
import Draggable from 'react-draggable';
import {MapContainer, Marker, Popup, TileLayer} from "react-leaflet";

const apiKey = process.env.REACT_APP_API_KEY;
const cities = ["London", "Paris", "Berlin", "Madrid", "Rome", "Tokyo", "Tel Aviv", "Dallol", "Cape Town", "Mumbai", "Moskva"];

function App() {
    const [selectedCity, setSelectedCity] = useState("");
    const [temperature, setTemperature] = useState(0);
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        if (!selectedCity) return;

        fetch(`http://api.openweathermap.org/data/2.5/weather?q=${selectedCity}&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                setTemperature(data.main.temp);
            });
    }, [selectedCity]);

    const handleCityChange = event => {
        setSelectedCity(event.target.value);
    };

    const handleAddToFavorites = () => {
        if (favorites.find(e => e.city === selectedCity)) {
            return
        }
        const URL = `https://nominatim.openstreetmap.org/search?q=${selectedCity}&format=json`;
        fetch(URL)
            .then((response) => response.json())
            .then((data) => {
                setFavorites([...favorites, {
                    city: selectedCity,
                    temperature,
                    lanLat: {"lan": data[0].lat, "lat": data[0].lon}
                }]);
            });
    };

    const handleRemoveFromFavorites = city => {
        console.log(city)
        setFavorites(favorites.filter(favorite => favorite.city !== city));
    };

    const handleStop = (e, data, favorite) => {
        const newFavorites = [...favorites];
        const index = newFavorites.indexOf(favorite);
        const draggedFavorite = newFavorites.splice(index, 1);
        newFavorites.splice(Math.round(data.y / 50), 0, ...draggedFavorite);
        setFavorites(newFavorites);
    };


    const temperatureColor = temperature
        ? `rgb(${(temperature - 273.15) / 40 * 255}, 100, 100)`
        : "white";


    return (
        <div style={{backgroundColor: temperatureColor}}>
            < div className="logoDiv">
                <img
                    src="cynetLogo.png"
                    alt="Logo"
                    style={{height: "50pt", marginLeft: "3%",}}
                />
            </div>
            <div className="App">
                <h1>Weather App</h1>
                <div>
                    <select onChange={handleCityChange}>
                        <option value="">Select a city</option>
                        {cities.map(city => (
                            <option key={city} value={city}>
                                {city}
                            </option>
                        ))}
                    </select>
                    {selectedCity && (
                        <div>
                            <p>
                                City: {selectedCity}
                            </p>
                            <p>
                                Temperature: {(temperature - 273.15).toFixed(1)}°C
                            </p>
                            <button className="favButton" onClick={handleAddToFavorites}>Add to favorites</button>
                        </div>
                    )}
                </div>

                <div className="favorites-container">
                    <h2>My Favorites Cities</h2>
                    <ul>
                        {favorites
                            //.sort((a, b) => a.temperature - b.temperature)
                            .map(favorite => (
                                <Draggable key={favorite.name} axis="y" position={{x: 0, y: 0}}
                                           onStop={(e, data) => handleStop(e, data, favorite)}>
                                    <div>
                                        <li className="ilStyle" key={favorite.city}>
                                            {favorite.city}: {(favorite.temperature - 273.15).toFixed(1)}°C
                                            <button className="removeButton" onMouseDown={(e) => {
                                                e.stopPropagation()
                                            }}
                                                    onClick={() => handleRemoveFromFavorites(favorite.city)}>Remove
                                            </button>
                                        </li>
                                    </div>
                                </Draggable>
                            ))}
                    </ul>
                </div>
                <div className="map-container">
                    <MapContainer center={[20.505, 50.09]} zoom={2} scrollWheelZoom={false}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {favorites.map((favorite) => (
                            <Marker position={[favorite.lanLat.lan, favorite.lanLat.lat]}>
                                <Popup>
                                    {favorite.city}. <br/> {(favorite.temperature - 273.15).toFixed(1)}°C.
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </div>
    )
        ;
}

export default App;
