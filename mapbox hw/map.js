// tile layers:

var background = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoibGlsbGlhbmJvbGZlciIsImEiOiJjanZmdmdrcWcwMTdmNGFzMmVhMWs1aWtlIn0.lpSpvlMJubVFskiYwoge0w");

var satellite_tile = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoibGlsbGlhbmJvbGZlciIsImEiOiJjanZmdmdrcWcwMTdmNGFzMmVhMWs1aWtlIn0.lpSpvlMJubVFskiYwoge0w");


// initial map object
var map = L.map("mapid", {
  center: [37.09, -95.71],
  zoom: 5,
  layers: [background, satellite_tile]
});

// add tiles to map
background.addTo(map);
satellite_tile.addTo(map)

// data layers
var tectonic_plates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();
var earthquake_data = {
  "Tectonic Plates": tectonic_plates,
  "Earthquakes": earthquakes
};


var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

d3.json(url, function(data) {


  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // Define the color of the marker based on the magnitude of the earthquake.
  function getColor(magnitude) {
    switch (true) {
      case magnitude > 5:
        return "#ea2c2c";
      case magnitude > 4:
        return "#ea822c";
      case magnitude > 3:
        return "#ee9c00";
      case magnitude > 2:
        return "#eecc00";
      case magnitude > 1:
        return "#d4ee00";
      default:
        return "#98ee00";
    }
  }

  // radius of marker based on size.

  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 3;
  }

  // GeoJSON 
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }

  }).addTo(earthquakes);

  earthquakes.addTo(map);


  var legend = L.control({
    position: "bottomright"
  });


  legend.onAdd = function() {
    var div = L
      .DomUtil
      .create("div", "info legend");

    var categories = [0, 1, 2, 3, 4, 5];
    var colors = [
      "#98ee00",
      "#d4ee00",
      "#eecc00",
      "#ee9c00",
      "#ea822c",
      "#ea2c2c"
    ];


    for (var i = 0; i < categories.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
        categories[i] + (categories[i + 1] ? "&ndash;" + categories[i + 1] + "<br>" : "+");
    }
    return div;
  };


  legend.addTo(map);

  // retrive Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
    function(platedata) {
 
      L.geoJson(platedata, {
        color: "orange",
        weight: 2
      })
      .addTo(tectonic_plates);
      tectonic_plates.addTo(map);
    });
});