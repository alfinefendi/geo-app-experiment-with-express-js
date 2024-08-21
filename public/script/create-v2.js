if ('geolocation' in navigator) {

    let latitudeEl = document.getElementById('latitude');
    let longitudeEl = document.getElementById('longitude');
    let mesinEl = document.getElementById('mesin');
    let snapshotEl = document.getElementById('snapshot');
    let consoleLog = document.getElementById('console-log');
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
        console.log(json.data);
        
        
        consoleLog.innerHTML = JSON.stringify(json, null, 2);

    }

    /**
     * Function to get the current geolocation of the user.
     * @returns {Promise<Object>} A promise that resolves to an object containing latitude and longitude.
     */
    async function getLocation() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    const data = { latitude, longitude };
                    latitudeEl.textContent = data.latitude;
                    longitudeEl.textContent = data.longitude;
                    mesinEl.textContent = 'on';
                    resolve(data);
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
                if (effectiveType === 'slow-2g' || effectiveType === '2g') {
                    document.getElementById('status').textContent = 'Online (slow connection, skip tracking)';
                    document.getElementById('connection-type').textContent = effectiveType;
                    console.log('Skipping location update due to slow connection.');
                    return;
                }
                document.getElementById('connection-type').textContent = effectiveType;
                snapshotEl.textContent = i++;
                const data = await getLocation();
                const newLocation = {
                    latitude: data.latitude,
                    longitude: data.longitude
                };
                if (lastLocation && lastLocation.latitude === newLocation.latitude && lastLocation.longitude === newLocation.longitude) {
                    console.log('skipping existing waypoint');
                    return;
                }
                saveLocation(data);
                lastLocation = newLocation;
            } else {
                latitudeEl.textContent = 'offline';
                longitudeEl.textContent = 'offline';
                mesinEl.textContent = 'off';
                document.getElementById('connection-type').textContent = 'N/A';
            }
        } catch (error) {
            console.error('Error getting location:', error);
        }
    }



    function handleOnline() {
        console.log('Network status changed: Online');
        mesinEl.textContent = 'on';
        showLocation();
    }

    function handleOffline() {
        console.log('Network status changed: Offline');
        mesinEl.textContent = 'off';
        document.getElementById('connection-type').textContent = 'N/A';
        stop();
    }

    let submitButton = document.getElementById('submit-btn');

    let intervalId = null; // To keep track of the interval ID
    let isRunning = false; // To track whether the interval is running
    let spinner = document.getElementById('spinner');
    let buttonText = document.getElementById('button-text');
    submitButton.addEventListener('click', async () => {
        if (isRunning) {
            stop();
            submitButton.textContent = 'Start'; // Change button text to 'Start'
            buttonText.textContent = 'Start'; // Change button text to 'Start'
            spinner.classList.add('hidden'); // Hide spinner
        } else {
            try {
                spinner.classList.remove('hidden'); // Show spinner
                buttonText.textContent = ''; // Clear button text
                await getLocation(); // Wait for geolocation permission and get the location
                start();
                buttonText.textContent = 'Stop'; // Change button text to 'Stop'
            } catch (error) {
                alert('Failed to get location data');
            } finally {
                spinner.classList.add('hidden'); // Hide spinner
            }
        }
    });

    function start() {
        if (navigator.onLine) {
            showLocation();
        } else {
            
            mesinEl.textContent = 'off';
            document.getElementById('connection-type').textContent = 'N/A';
        }

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        intervalId = setInterval(() => {
            console.log('getting a data.');
            showLocation();
        }, 500);     
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
