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

function stop_speech() {
    recognition.stop();
    setTimeout(stop_speech, 10000);
}

// Initialise speech detection
function init_speech() {
    // Add speech recognition
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-AU';

    // Add listener for result
    recognition.onresult = function(event) {
        if (typeof(event.results) == 'undefined') {
            recognition.stop();
        }
        for (const result of event.results) {
            console.log("here");
            for (const word of result[0].transcript.split(" ")) {
                console.log("trying ", word);
                // If successful, don't process any more commands
                if (move(word)) {
                    return;
                }
            }
        }
    };

    // Add listener for end
    recognition.onend = function(event) {
        console.log('restarting!');
        recognition.start();
    }

    recognition.start();
    stop_speech();
    // recognition.start();

    // // Add listener for result
    // recognition.onend = function(event) {
    //     for (const result of event.results) {
    //         for (const alternative of result) {
    //             if (typeof alternative.transcript == 'undefined') {
    //                 continue;
    //             }
    //             for (const word of alternative.transcript.split(" ")) {
    //                 if (move(word)) {
    //                     console.log('moving ' + word + '!');
    //                     return;
    //                 }
    //             }
    //         }
    //     }
    // }

    // // Add listener for error
    // recognition.onerror = function(event) {
    //     console.log('problem!');
    // }
};

// Handle links changing
function handle_links_change() {
    links = panorama.getLinks();
}

// Handle POV changing
function handle_pov_change() {
    pov = panorama.getPov();
}

// Check if panorama is
function is_initialised() {
    return typeof links != 'undefined' && typeof pov != 'undefined'
}

// Returns the smallest angle between angles a and b
function get_smallest_angle(a, b) {
    Math.min((2 * Math.PI) - Math.abs(a - b), Math.abs(a - b))
}

// Returns the POV from the link heading + current pitch
function get_pov_from_link(link) {
    if (!is_initialised()) {
        return false;
    }
    return google.maps.StreetViewPov(link.heading, pov.pitch);
}

// Returns the closest link to the given heading in the range
// heading - 60 to heading + 60
function get_closest_link(heading) {
    if (!is_initialised()) {
        return false;
    }
    var closest_link;
    var closest_angle = Infinity;
    for (const link of links) {
        if (!(heading - 60 <= link.heading && link.heading <= heading + 60)) {
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
    return closest_link;
}

// Returns the link in the given direction relative to the given heading
function get_link(direction, heading) {
    switch(direction) {
        case 'left': var link = get_left_link(heading); break;
        case 'right': var link = get_right_link(heading); break;
        case 'forward': var link = get_forward_link(heading); break;
        case 'back':  var link = get_back_link(heading); break;
    }
    if (!link) {
        return false;
    }
    return link;
}

// Moves the user in the given direction
function move(direction) {
    link = get_link(direction, pov.heading);
    if (!link) {
        return false;
    }
    panorama.setPov({heading: link.heading, pitch: pov.pitch});
    panorama.setPano(link.pano);
    return true;
}

// Gets the panorama link to the left of the given heading
function get_left_link(heading) {
    if (!is_initialised()) {
        return false;
    }
    return get_closest_link((heading - 90) % 360);
}

// Gets the panorama link to the right of the given heading
function get_right_link(heading) {
    if (!is_initialised()) {
        return false;
    }
    return get_closest_link((heading + 90) % 360);
}

// Gets the panorama link forward of the given heading
function get_forward_link(heading) {
    if (!is_initialised()) {
        return false;
    }
    return get_closest_link((heading) % 360);
}

// Gets the panorama link back of the given heading
function get_back_link(heading) {
    if (!is_initialised()) {
        return false;
    }
    return get_closest_link((heading + 180) % 360);
}

// Returns a list of panaroma images surrounding the given panorama,
// relative to the given heading (pitch set to be parallel to ground)
function get_surrounding_images(panorama, heading) {
    image_urls = []
    for (const delta of [0, 90, 180, 270]) {
        pov = {'heading': (heading + delta) % 360, pitch: 0}
        image_urls.push(get_image_url(panorama, pov));
    }
    return image_urls;
}

// Returns the image url for the given
function get_image_url(panorama, pov) {
    base = "https://maps.googleapis.com/maps/api/streetview?size=640x640&pano="
    return base + panorama + "&heading=" + pov.heading + "&pitch=" + pov.pitch;
}

// Initialisation
google.maps.event.addDomListener(window, 'load', function() {
    init_street_view();
    init_speech();
});
