const myMap = L.map('map').setView([0, 0], 1);
        const issIcon = L.icon({
            iconUrl: '/img/char.png',
            iconSize: [50, 50],
            iconAnchor: [25, 25],
            popupAnchor: [-3, -76]
        });
        
        const marker = L.marker([0, 0], {icon: issIcon}).addTo(myMap);
        const attribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';
        const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
        const tiles = L.tileLayer(tileUrl, {
            attribution
        });
        tiles.addTo(myMap)

        const api_url = 'get-waypoint';
        let firstTime = true;
        async function getISS() {
            const response = await fetch(api_url);
            const json = await response.json();
            const waypoint = json.waypoint;
            const {latitude,longitude} = waypoint[0];
            console.log(latitude);
            if(response.status == 200) {
                if(firstTime) {
                    myMap.setView([latitude,longitude],20);
                    // firstTime = false;
                }
                marker.setLatLng([latitude, longitude]);
                marker.bindPopup(`alfin`);
            }
        }
        getISS();
        setInterval(getISS, 1000);