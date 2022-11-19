// Store USGS URL
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Create the createMap function
function createMap(earthquakes) {
    // Create the base layers
    let streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    let topographicMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Create a baseMaps object
    let baseMaps = {
        "Street Map" : streetMap,
        "Topographic Map" : topographicMap
    };

    // Create an overlayMaps object 
    let overlayMaps = {
        "Earthquakes" : earthquakes
    };

    // Create the myMap object
    let myMap = L.map("map", {
        center: [-5, 105],
        zoom: 3,
        layers: [streetMap, earthquakes]
    });

    // Add the base and overlay layers
    L.control.layers(baseMaps, overlayMaps, {collapsed: false}).addTo(myMap);

    // Create the legend
    let legend = L.control({position: "bottomright"});
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        // Adding colours
        let depths = ["-10 to 10", "10 to 30", "30 to 50", "50 to 70", "70 to 90", "90+"];
        let depthColours = ["#feb56b","#e06c5d","#ca495c","#ac255e","#5b1061","#1f005c"];
        div.innerHTML = "<h3>Depth (km)</h3>";
        for (let i = 0; i < depths.length; i++) {
            div.innerHTML += '<i style="background:' + depthColours[i] + '"></i> ' + depths[i] + '<br>';
        };
        return div;
    };
    legend.addTo(myMap);
};

// Create chooseColour function
function chooseColour(depth) {
    switch(true) {
        case(depth <= 10):
            return "#feb56b";
        case(depth > 10 && depth <= 30):
            return "#e06c5d";
        case(depth > 30 && depth <= 50):
            return "#ca495c";
        case(depth > 50 && depth <= 70):
            return "#ac255e";
        case(depth > 70 && depth <= 90):
            return "#5b1061";
        case(depth > 90):
            return "#1f005c";
        default:
            return "#E2FFAE";
    }
};

// Create the createFeatures function
function createFeatures(response) {
    let earthquakeData = response.features;
    let earthquakeObjects = [];

    // Create a marker for each earthquake
    for (i = 0; i < earthquakeData.length; i++) {
        let earthquake = earthquakeData[i];
        let location = L.circle([earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]],{
            color: "black",
            weight: 1,
            fillOpacity: 1,
            fillColor: chooseColour(earthquake.geometry.coordinates[2]),
            radius: Math.sqrt(Math.abs(earthquake.properties.mag)) * 100000
        })
        .bindPopup(`<h3>Location: ${earthquake.properties.place}</h3><hr><p>Time: ${new Date(earthquake.properties.time)}</p><hr><p>Magnitude: ${earthquake.properties.mag}</p><hr><p>Number of "Felt" Reports: ${earthquake.properties.felt}`);
        earthquakeObjects.push(location);
    };
    // Send earthquakeObjects layer group to the createMap function
    createMap(L.layerGroup(earthquakeObjects));
};

// Perform a request to the query URL
d3.json(url).then(function(data) {
    // Send the response to the createFeatures function
    createFeatures(data);
});