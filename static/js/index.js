// Initialise gMap street view
function init_street_view() {
    // Add initial street view panorama
    // TODO(mitch): remove these defaults
    panorama = new google.maps.StreetViewPanorama(
        document.getElementById('street-view'), {
          position: {lat: 37.869260, lng: -122.254811},
          pov: {heading: 165, pitch: 0},
          zoom: 1
        }
    );

    // Add listener for neighbours changing
    panorama.addListener('links_changed', function() {
        handle_links_change();
    });

    // Add listener for point of view changing
    panorama.addListener('pov_changed', function() {
        handle_pov_change();
    });
};

// Handle links changing
function handle_links_change() {
    links = panorama.getLinks();
    console.log(links);
}

// Handle POV changing
function handle_pov_change() {
    pov = panorama.getPov();
    console.log(pov);
}

// Check if panorama is
function is_initialised() {
    return typeof links != 'undefined' && typeof pov != 'undefined'
}

// Returns the smallest angle between angles a and b
function get_smallest_angle(a, b) {
    Math.min((2 * Math.PI) - Math.abs(a - b), Math.abs(a - b))
}

// Returns the closest link to the given heading in the range
// heading - 90 to heading + 90
function get_closest_pano(heading) {
    if (!is_initialised()) {
        return false;
    }
    var closest_link;
    var closest_angle = Infinity;
    for (const link of links) {
        if (!(heading - 90 <= link.heading && link.heading <= heading + 90)) {
            continue;
        }
        smallest_angle = get_smallest_angle();
        if (smallest_angle >= closest_angle) {
            continue;
        }
        closest_angle = smallest_angle;
        closest_link = link;
    }
    if (typeof closest_link == 'undefined') {
        return false;
    }
    return closest_link.pano;
}

// Move panorama view left
function go_left() {
    if (!is_initialised()) {
        return false;
    }
    console.log('moving left!');
    panorama.setPano(get_closest_pano((pov.heading - 90) % 360));
}

// Move panorama view right
function go_right() {
    if (!is_initialised()) {
        return false;
    }
    console.log('moving right!');
    panorama.setPano(get_closest_pano((pov.heading + 90) % 360));
}

// Move panorama view forward
function go_forward() {
    if (!is_initialised()) {
        return false;
    }
    console.log('moving forward!');
    panorama.setPano(get_closest_pano((pov.heading) % 360));
}

// Move panorama view backward
function go_backward() {
    if (!is_initialised()) {
        return false;
    }
    console.log('moving backward!');
    panorama.setPano(get_closest_pano((pov.heading + 180) % 360));
}

// Set up
google.maps.event.addDomListener(window, 'load', function() {
    init_street_view();
});
