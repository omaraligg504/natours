//console.log('hello from the client side')

export const displayMap= locations=>{var map = L.map('map');
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  interactive:false,
  scrollZoom:false,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const bounds=new L.LatLngBounds();
locations.forEach(loc=>{
  const el =document.createElement('div');
  el.className='marker';
  const marker=new L.Marker({
    element:el,
    anchor:'bottom'
  })
  marker.setLatLng([loc.coordinates[1],loc.coordinates[0]])
  .addTo(map).bindPopup(`Day ${loc.day} : ${loc.description}`)

  bounds.extend([loc.coordinates[1],loc.coordinates[0]])

})
map.fitBounds(bounds);}
//console.log(map);