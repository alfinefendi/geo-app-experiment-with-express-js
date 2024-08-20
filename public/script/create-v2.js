if ('geolocation' in navigator) {

    let latitudeEl = document.getElementById('latitude');
    let longitudeEl = document.getElementById('longitude');
    let statusEl = document.getElementById('status');
    let mesinEl = document.getElementById('mesin');
    let detikEl = document.getElementById('detik');
    let i = 1;
    let changeTimes = 1;


    async function saveLocation(data) {
        const options = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'latitude' : data.latitude,
                'longitude' : data.longitude,
            })
        };  
        const response = await fetch('/set-waypoint', options);
        const json = await response.json();
    }

    /**
     * Function to get the current geolocation of the user.
     * @returns {Promise<Object>} A promise that resolves to an object containing latitude and longitude.
     */
    function getLocation() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                position => {
                    console.log(position.coords);
                    const { latitude, longitude } = position.coords;
                    const data = { latitude, longitude };
                    resolve(data);
                    console.log("try to get position : " + changeTimes++);
                },
                error => {
                    reject(error);
                }
            );
        });
    }

    let lastLocation = null;
    async function showLocation() {
        try {
            if (navigator.onLine) {
                const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
                const effectiveType = connection ? connection.effectiveType : 'unknown';
                console.log('Effective connection type:', effectiveType);
                    
                if (effectiveType === 'slow-2g' || effectiveType === '2g') {
                    document.getElementById('status').textContent = 'Online (slow connection, skip tracking)';
                    document.getElementById('connection-type').textContent = effectiveType;
                    console.log('Skipping location update due to slow connection.');
                    return;
                }
                detikEl.textContent = i++;
                const data = await getLocation();
                const newLocation = {
                    latitude: data.latitude,
                    longitude: data.longitude
                };
                // if (lastLocation && lastLocation.latitude === newLocation.latitude && lastLocation.longitude === newLocation.longitude) {
                //     console.log('Location unchanged, not saving.');
                //     document.getElementById('status').textContent = 'Location unchanged';
                //     return;
                // }
                saveLocation(data);
                lastLocation = newLocation;
                latitudeEl.textContent = data.latitude;
                longitudeEl.textContent = data.longitude;
                statusEl.textContent = 'online';
                mesinEl.textContent = 'on';
                document.getElementById('connection-type').textContent = effectiveType;
            } else {
                console.log('Cannot get location. Offline.');
                latitudeEl.textContent = 'offline';
                longitudeEl.textContent = 'offline';
                statusEl.textContent = 'offline';
                mesinEl.textContent = 'off';
                document.getElementById('connection-type').textContent = 'N/A';
            }
        } catch (error) {
            console.error('Error getting location:', error);
        }
    }



    function handleOnline() {
        console.log('Network status changed: Online');
        statusEl.textContent = 'online';
        mesinEl.textContent = 'on';
        showLocation();
    }

    function handleOffline() {
        console.log('Network status changed: Offline');
        statusEl.textContent = 'offline';
        mesinEl.textContent = 'off';
        document.getElementById('connection-type').textContent = 'N/A';
        stop();
    }

    let submitButton = document.getElementById('submit-btn');

    let intervalId = null; // To keep track of the interval ID
    let isRunning = false; // To track whether the interval is running
    submitButton.addEventListener('click', async () => {
        if (isRunning) {
            stop();
            submitButton.textContent = 'Start'; // Change button text to 'Start'
        } else {
            try {
                // Wait for geolocation permission and get the location
                const locationData = await getLocation();
                
                // If location data is successfully retrieved, start the process
                start();
                submitButton.textContent = 'Stop'; // Change button text to 'Stop'
            } catch (error) {
                console.error('Error getting location:', error);
                alert('Failed to get location. Cannot start.');
            }
        }
    });

    function start() {
        if (navigator.onLine) {
            showLocation();
        } else {
            statusEl.textContent = 'offline';
            mesinEl.textContent = 'off';
            document.getElementById('connection-type').textContent = 'N/A';
        }

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        intervalId = setInterval(() => {
            console.log('getting a data.');
            showLocation();
        }, 1000);     
        isRunning = true; 
    }

    function stop() {
        if (intervalId) {
            clearInterval(intervalId); // Clear the interval
            intervalId = null; // Reset the interval ID
        }
        isRunning = false; 
        mesinEl.textContent = 'off';
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        location.reload(); // Refresh the page
    }


} else {
    console.log('not supported');
}
