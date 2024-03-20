/* eslint-disable */
// const tourLocations = JSON.parse(
//   document.getElementById('map').dataset.locations,
// );

// mapboxgl.accessToken =
//   'pk.eyJ1IjoiYWJoaXNoZWstZGV2bGl5YSIsImEiOiJjbHN2cnV5bHcwb21iMmtvMWczenBiZ3Z6In0.UIE7DrMASX_LMmt4QIztyg';
// var map = new mapboxgl.Map({
//   container: 'map',
//   style: 'mapbox://styles/mapbox/streets-v11',
//   scrollZoom: false,
//   // center: [-118.113491, 34.111745],
//   // zoom: 10,
// });
// const bounds = new mapboxgl.LngLatBounds();
// tourLocations.forEach((loc) => {
//   const ele = document.createElement('div');
//   ele.className = 'marker';

//   new mapboxgl.Marker({
//     element: ele,
//     anchor: 'bottom',
//   })
//     .setLngLat(loc.coordinates)
//     .addTo(map);

//   new mapboxgl.Popup({
//     offset: 30,
//   })
//     .setLngLat(loc.coordinates)
//     .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
//     .addTo(map);

//   bounds.extend(loc.coordinates);
// });
// map.fitBounds(bounds, {
//   padding: {
//     top: 200,
//     bottom: 150,
//     left: 100,
//     right: 100,
//   },
// });

export const displayMap = (locations) => {
  var map = L.map('map', { zoomControl: false, scrollWheelZoom: false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const points = [];
  locations.forEach((loc) => {
    points.push([loc.coordinates[1], loc.coordinates[0]]);
    L.marker([loc.coordinates[1], loc.coordinates[0]])
      .addTo(map)
      .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, {
        autoClose: false,
      })
      .openPopup();
  });

  const bounds = L.latLngBounds(points).pad(0.4);
  map.fitBounds(bounds);
};

// map.scrollWheelZoom.disable();
