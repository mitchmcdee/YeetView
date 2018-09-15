// Initialise gMap street view
function init_street_view() {
    street_view = new google.maps.StreetViewPanorama(
        document.getElementById('street-view'), {
          position: {lat: 37.869260, lng: -122.254811},
          pov: {heading: 165, pitch: 0},
          zoom: 1
        }
    );
    console.log("loaded!");
};

// Set up
google.maps.event.addDomListener(window, 'load', function() {
    init_street_view();
});
