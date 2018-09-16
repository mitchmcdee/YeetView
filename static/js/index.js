// Initialise gMap street view
function init_street_view() {
    // Add initial street view panorama
    // TODO(mitch): remove these defaults
    panorama = new google.maps.StreetViewPanorama(
        document.getElementById('street-view'), {
          position: {lat: 42.3579011, lng:-71.0912069},
          pov: {heading: 165, pitch: 0},
          zoom: 1
        }
    );
    pov = {'heading': 0, 'pitch': 0};
    start_pov = pov;

    // Add listener for point of view changing
    panorama.addListener('pov_changed', function() {
        handle_pov_change();
    });

    // Add listener for neighbours changing
    panorama.addListener('links_changed', function() {
        handle_links_change();
    });
};

// Stop speech recognition
function stop_speech() {
    recognition.stop();
    speaking = false;
    setTimeout(stop_speech, 5000);
}

// Initialise speech detection
function init_speech() {
    // Add speech recognition
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-AU';
    speaking = false;
    loading = false;
    start_time = new Date().getTime();

    // Add listener for result
    recognition.onresult = function(event) {
        if (typeof(event.results) == 'undefined') {
            recognition.stop();
        }
        for (const result of event.results) {
            for (const word of result[0].transcript.split(" ")) {
                console.log("heard", word);
                // If successful, don't process any more commands
                if (move(word)) {
                    return;
                }
            }
        }
    };

    // Add listener for end
    recognition.onend = function(event) {
        recognition.start();
    }

    // Start recognition
    recognition.start();
    stop_speech();
};

// Handle links changing
function handle_links_change() {
    links = panorama.getLinks();
    if (loading) {
        return;
    }
    upload_images();
}

// Handle POV changing
function handle_pov_change() {
    pov = panorama.getPov();
    var end_time = new Date().getTime();
    if (end_time - start_time < 3000) {
        return;
    }
    var end_pov = pov;
    var delta_heading = Math.abs(end_pov.heading - start_pov.heading);
    if (delta_heading < 30) {
        return;
    }
    start_time = end_time;
    start_pov = end_pov;
    get_description();
}

// Returns the photo description to the current heading
function get_description() {
    heading = (Math.round(pov.heading / 90) * 90).toFixed();
    url = "/get_result?pano=" + panorama.getPano() + "&heading=" + heading + "&pitch=0";
    $.ajax({
        url: url,
        type: "GET",
        dataType: 'json',
        success: function(data, status) {
            if (status != "success") {
                return;
            }
            speak_description(data["result"]);
        }
    });
}

// Speak out the description result
function speak_description(description) {
    if (speaking) {
        return;
    }
    console.log("speaking", description);
    speaking = true;
    var msg = new SpeechSynthesisUtterance(description);
    msg.onend = function() {
        speaking = false;
    }
    window.speechSynthesis.speak(msg);
}

// Uploads the latest list of images
function upload_images() {
    loading = true;
    images = get_surrounding_images();
    if (!is_initialised() || images.length == 0) {
        return false;
    }
    $.ajax({
        url: "/upload_image_list",
        data: JSON.stringify({'images': images}),
        dataType: "json",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        success: function() {
            loading = false;
        }
    });
    return true;
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

// Returns a list of panaroma images surrounding the current panorama,
// relative to the current heading (pitch set to be parallel to ground)
function get_surrounding_images() {
    panos = [{'pano': panorama.getPano()}, ...panorama.getLinks()];
    image_urls = []
    for (const pano of panos) {
        for (const heading of [0, 90, 180, 270]) {
            image_urls.push(get_image_url(pano.pano, {'heading': heading, pitch: 0}));
        }
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
