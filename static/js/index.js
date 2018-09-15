// Initialise gMap street view
function init_street_view() {
    panorama = new google.maps.StreetViewPanorama(
        document.getElementById('street-view'), {
          position: {lat: 37.869260, lng: -122.254811},
          pov: {heading: 165, pitch: 0},
          zoom: 1
        }
    );

    // Add listener for neighbours changing
    panorama.addListener('links_changed', function() {
      const links = panorama.getLinks();
      for (const link of links) {
        console.log(link);
      }
    });
};

// Set up
google.maps.event.addDomListener(window, 'load', function() {
    init_street_view();
});
