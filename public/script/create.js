
if ('geolocation' in navigator) {

    navigator.geolocation.getCurrentPosition(async position => {
        const {latitude,longitude} = position.coords;
        console.log(position.coords);
        const timestamp = position.timestamp;

        document.getElementById('latitude').textContent = latitude;
        document.getElementById('longitude').textContent = longitude;
   


        const submitBtn = document.querySelector('#submit-btn');
        submitBtn.addEventListener('click', async ()=>{
            const data = {latitude,longitude,timestamp};
            const keterangan = document.getElementById('keterangan');
            const greetings = document.getElementById('greetings');
         
            
            const options = {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'latitude' : latitude,
                    'longitude' : longitude,
                    'keterangan' : keterangan.value
                })
            };  
            const response = await fetch('/set-location', options);
            const json = await response.json();
            console.log(json.message);
            
            if(response.status == 201) {
                renderMap(json.data);
                greetings.classList.remove('hidden');
                keterangan.value = '';
                alert('terimakasih atas partisipasnya ..')
                setTimeout(() => {
                    greetings.classList.add('hidden');
                }, 1000); // 2000 milliseconds = 2 seconds
            }
          
        })
        
    });


} else {
    console.log('not supported');
}


function renderMap(data) {
    var map = L.map('map').setView([data.latitude, data.longitude],13);
    L.tileLayer('https://ti	le.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);

    var marker = L.marker([data.latitude, data.longitude]).addTo(map);
    marker.bindPopup('Lokasi ke-1');
    
    var circle = L.circle([data.latitude, data.longitude],{
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 500
    }).addTo(map);
}