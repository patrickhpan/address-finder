require('dotenv').config();

const fs = require('fs-promise');
const request = require('request-promise');

const source_file = 'data/test.txt';
const api_key = process.env.GMAPS_API_KEY;

function getPlaces() {
    return fs.readFile(source_file, 'utf8')
        .then(data => {
            console.log("Successfully read data.")
            places = data.split('\n')
            return places;
        })
        .catch(err => {
            console.error(`Error: ${err}`)
        })
}

function getMapsQueryURL(query, postfix = '') {
    return `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query} ${postfix}&key=${api_key}&types=address`;
}

function getMapsPlaceIDURL(placeID) {
    return `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeID}&key=`;
}

function getPlaceID(place) {
    let url = getMapsQueryURL(place);
    return request(url)
        .then(data => {
            return (typeof data === 'string') ? JSON.parse(data) : data;
        })
        .then(data => {
            if(data.status === "ZERO_RESULTS") {
                throw `No results for ${place}.`
            }

            return data.predictions[0]
        })
        .catch(err => {
            console.error(`Error: ${err}`);
        })
}

function getInfoFromID(placeid) {
}

getPlaces()
    .then(places => {
        place = places[0];
        getPlaceID(place)
            .then(result => {
                console.log(result);
            })
    })
