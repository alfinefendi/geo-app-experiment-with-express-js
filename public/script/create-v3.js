
if ('geolocation' in navigator) {

    navigator.geolocation.getCurrentPosition(async position => {
        const {latitude,longitude} = position.coords;
        console.log(position.coords);
        const timestamp = position.timestamp;

        document.getElementById('latitude').textContent = latitude;
        document.getElementById('longitude').textContent = longitude;
        const data = {latitude,longitude,timestamp}
        renderMap(data);

        const submitBtn = document.querySelector('#send-btn');
        submitBtn.addEventListener('click', async ()=>{
            const fileInput = document.getElementById('images');
            const file = fileInput.files[0]; // Get the file from the input
            console.log(file);
            
        
            // Create a FormData object to handle file uploads
            const formData = new FormData();
            formData.append('latitude', latitude);
            formData.append('longitude', longitude);
            formData.append('image', file);
            formData.append('keterangan', '');
        
            const options = {
                method: "POST",
                body: formData
            }

            try {
                const response = await fetch('/set-location', options);
                const json = await response.json();
                if (response.ok) {
                    alert('Terimakasih atas partisipasnya ..');
                } else {
                    alert('Error: ' + json.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred.');
            } 
        });
        
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