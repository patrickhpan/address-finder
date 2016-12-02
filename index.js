require('dotenv').config();

const Promise = require('bluebird');
const fs = require('fs-promise');
const request = require('request-promise');

const source_file = 'data/data.txt';
const out_file = 'data/results.json';
const api_key = process.env.GMAPS_API_KEY;

function getPlaces() {
    return fs.readFile(source_file, 'utf8')
        .then(data => {
            console.log("Successfully read data.")
            places = data.split('\n')
            return places;
        })
        .then(data => {
            return data.filter(item => !item.match(/^\s*$/))
        })
        .catch(err => {
            console.error(`Error: ${err}`)
        })
}

function getMapsQueryURL(query, postfix = '') {
    query = encodeURIComponent(query)
    return `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query} ${postfix}&key=${api_key}`;
}

function getMapsPlaceIDURL(placeID) {
    placeID = encodeURIComponent(placeID)
    return `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeID}&key=${api_key}`;
}

function getPlaceID(place) {
    let url = getMapsQueryURL(place);
    return request(url)
        .then(data => {
            return (typeof data === 'string') ? JSON.parse(data) : data;
        })
        .then(data => {
            if(data.status !== "OK") {
                throw `Place ${place}: Error ${data.status}`
            }
            return data;
        })
        .then(data => {
            return data.predictions[0].place_id
        })
        .catch(err => {
            console.error(`${err}`);
        })
}

function getInfoFromID(placeID) {
    if (placeID === undefined) {
        return null;
    }
    let url = getMapsPlaceIDURL(placeID);
    return request(url)
        .then(data => {
            return (typeof data === 'string') ? JSON.parse(data) : data;
        })
        .then(data => {
            if(data.status !== "OK") {
                throw `Place ID ${placeID}: Error ${data.status}`
            }
            return data.result;
        })
        .then(data => {
            return {
                name: data.name,
                address: data.formatted_address,
                coordinates: data.geometry.location
            }
        })
}

Promise.map(getPlaces(), getPlaceID).map(getInfoFromID)
    .then(results => {
        fs.writeFile(out_file, JSON.stringify(results, null, 4));
    })