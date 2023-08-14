// const API = "http://127.0.0.1:8069/api";
const API = "https://cubapyme.mooo.com/api";

var storedPymes = JSON.parse(localStorage.getItem('pymes')) || [];
var spinnerOverlay = document.getElementById('spinner-overlay');
var token = false;
var savedAuth = window.localStorage.getItem('auth');
var myModalEl = document.getElementById('miModal')
var locatepye = false;
var latitude = 0;
var longitude =0;
pyme_id = 0;
productsearched = null;

if (savedAuth) {
    token = JSON.parse(savedAuth).token;
    fetch(`${API}/resource?token=${token}`, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.status == 401){
                cerrarSesion();
            }
        })

}

async function CountProducts() {
    const countUrl = `${(API)}/products/count?c_id=${(pyme_id)}`;

    try {
        const response = await fetch(countUrl);
        const totalProducts = await response.json();
        return totalProducts;
    } catch (error) {
        throw error; // O manejar el error de alguna otra forma
    }
}

async function CountViews() {
    const viewsUrl = `${(API)}/get_view?c_id=${(pyme_id)}`;

    try {
        const response = await fetch(viewsUrl);
        const totalView = await response.json();
        return totalView;
    } catch (error) {
        throw error; // O manejar el error de alguna otra forma
    }
}


function checkConnection() {
    return false;
    // Comprueba la conexión a Internet
    if (navigator.connection.type == Connection.NONE) {
        return true;
    }
}

document.getElementById('make_route').addEventListener('click', function () {
    const pyme_sel = storedPymes.find(objeto => objeto.id === pyme_id);
    cerrarOffcanvas('offcanvasDerecho');
    make_route(pyme_sel.lat, pyme_sel.log)
});


document.addEventListener('DOMContentLoaded', function () {
    var myOffcanvas = new bootstrap.Offcanvas(document.getElementById('offcanvasWithBothOptions'));
    myOffcanvas._element.addEventListener('shown.bs.offcanvas', function () {

        cargarDatosPyme();

        // Aquí puedes realizar las acciones que desees cuando el Offcanvas se muestra
    });
});


function cerrarOffcanvas(id) {
    var offcanvasElement = document.getElementById(id);
    var offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
    offcanvas.hide();
}

function fetchProducts(pageNumber, productsPerPage) {
    // checkConnection();
    document.getElementById('loading-image').style.display = 'flex';
    document.getElementById('products-container').innerHTML = '';
    // URL de la API para obtener el n?mero total de productos
    const countUrl = `${(API)}/products/count?c_id=${(pyme_id)}`;

    const pyme_sel = storedPymes.find(objeto => objeto.id === pyme_id);


    // Hacer una solicitud a la API para obtener el total de productos
    fetch(countUrl)
        .then(response => response.json()) // Parsear la respuesta JSON
        .then(totalProducts => {
            // Calcular el n?mero total de p?ginas en funci?n del total de productos
            const totalPages = Math.ceil(totalProducts / productsPerPage);

            // URL de la API con los par?metros de paginaci?n
            const apiUrl = `${(API)}/products?c_id=${(pyme_id)}&start=${(pageNumber - 1) * productsPerPage}&end=${pageNumber * productsPerPage}`;

            // Hacer una solicitud a la API utilizando Fetch para obtener los productos
            fetch(apiUrl)
                .then(response => response.json()) // Parsear la respuesta JSON
                .then(data => {
                    // Obtener el contenedor donde se mostrar?n los productos
                    const productsContainer = document.getElementById('products-container');
                    productsContainer.innerHTML = '';

                    // Iterar sobre los productos y mostrarlos en el contenedor
                    data.forEach(product => {
                        const productName = product.name;
                        const productPrice = product.price;
                        var productImageBase64 = product.image;
                        if (product.desc == false){
                            product.desc = '';
                        }
                        // Crear elementos HTML para mostrar los datos del producto
                        const productElement = document.createElement('div');


                        // Utilizar componentes de Bootstrap para mejorar el aspecto del producto

                        if (!productImageBase64) {
                            productImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAMYAAAD+CAMAAABWbIqvAAAAVFBMVEXy8vKZmZn29vaWlpb39/eTk5PCwsKRkZGsrKzHx8fw8PDr6+u4uLjl5eXU1NSenp7MzMzd3d2zs7OkpKTX19e2tra9vb3e3t6jo6Pm5uaLi4v9/f09fqssAAAG90lEQVR4nO2bi3LjKgyGjYQMBhviSxxn+/7veSSctEnTnnbPzEnsGX0zdXzJZvktEEhAVSmKoiiKoiiKoiiKoiiKoiiKoiiKoiiKoiiKoiiKoiiKoiiKoiiKoiiKoijPBewd8Ory/Deg93iD73epAw4OzQ3oDnvUEcl8guKry/T3QIOfZWCzJ3NAwebPKozJdn326hL+ArCng/BoDDFHeXTavtOCLtPqmR5VsI4C5W7jOuD00LC/gk7b1gFftIivyJuWAdOvjMHmmLas49HLIhUebm/a90KNn0QMifu8mIZPQrDekQzy59W3gj172qsMmm219ob8YWfapwxsWQVUU9NM/FHZFncpQ5yqTci9IWGy9854PzLEp9rarReutnfeeD8yDHDg5K4XjoMm2KE1sGVj+I9Lz+b4aB37kSGx3o1zorvOcT8yElTnWxnnCtIOZbA1buNYjmDhsEMZM7eNGxebuW3M+5NhFi734d0cxMaxy/48laGOr6+uCj0Xu9tjvyEutqoGJ2Gr83x64353JMNQktFI345je5KxSLpp8DuSYaiX0oO1UPTsdITLOpprKgdss9t4g3XkFCSZHlK+D9L3JYOF0OL9Qp8zDRuXkb7IjHyVeSvNf7uE3yZ4wqtL+q/Awf2sgaOPrU912Mbhj7jGvrqcPwHn2v9Afd64LQrwI68uoaIoiqIov+qVN99rx7Ywp+pfChra9ttZ122ssep4MCuzrGTO338pOvpu1jXmvIUBe0dmmdt2QVy+L02kbyePI32r8Jl0hMMbgPVInbQACJIohNjFtTkAdGcIRcb1RjlWXRck9SOP1knOcxdfV79EBkjEhzRVhOlAf4KdMjnKsiAPkiGXeylrg7IkbDUM1OgcDdEOEqPTAezB8I3xZctIRIZla7RIJ5bhif5UyaHxBl0C6Lnp+EzmXoYdJFmCaGAejcljkngx8w33Kh3cNvyUkkyFcQUx6HtRM4IFbi5gFzTR8ju/k2FPDmdrJ8eBrFSqN4iOX4YNGfOLIluWUTwVuklkZG4fE5HMVcoHF1qSUef7SmVnxEoqYuqhWEeqZAelZnYvk2FyzkvLsTW/2XktTCxPKMmfVJNPMvzq1sQlrDJmJLnu6VWreoqnuqwTDuXdi4zzRQab4fCljPe1VKuMGiVpdbHjq2Rc/+eLjBPJ1KUtNUQcgLxlLnupOOsplzryF4nmUqkspGIGrmyvWt/6KKOyGU1f9YijhSNSE7osnmpiP3Y+LbKM6uzQx9iKY2IZfurAYO6qVES/Rga7/3cZjkp2+cyN3hEZfrOBHYBzi5GuWhZKOu4mpUk78QtObGfYOxwsW1D+SX5VPjQe2/fBRDgeS4OGUI95rENpL3PObWjlwXnIuYbjkasPdMecfWnOcfZ8AnFesm9eJKK6H4O/n8PH5gCZaLo8uDmtLvNP1ftaK9jvfgJFURTlN3ykdb7M3mw+p7MC0zy0TZn6SukxSoCU0vML9dfEsayep9pW4Y97nKi3PGjavjk4OkVfH1GmhcMyPqaarDG4fRmdw/YNLI9vOY57e7OlKcimrGvRVxmXu3ywl0c3qdJy7/Z8fX73M/8vEv3Mb5KomWsI3h+g9z7UxozX6K3IgMbP0RtT2340WUbCcBoMmjK2tWkxOSU/yNfrbHItr8f72GSzPGkdRnQG/SGWMauEGZZDHu8ksxBvZbSUjSNDg4QfHIzATe6n4ZgD3YhGohJpZpRZpSs/Y56U6YGyEIHyvGYSRIbJXZjxmuW8yEAc4skYauWYAYxbwAa+aznsG2Ml6yll5R7HfiekmcMng31oUHITT9HRe0nryHu9yOAAHNbcyK0MCmCPlyM3llMXrY0ig8Pv07r0G6Kj6c2+1Xx6kt+SkNA/xxpcnaq+5qib4kWGlAoeZHCVeT+yDNvXQ+YKOUiiJKyLr8ouAtkkyDVyzQjB8hwZcGjq4nUGpFT9XgYMHJi3Ka8y4ocMP3jPf8+WMVBphPaSgf6tDPbTDbtWscZEeGB/m40BLvtkS1TLleqpMiZnch9Cnw2Fv6hUkha0kgYZbCU75pJs2qog4xgsDH8W+1wZlT1S2c0n+9iD+1IG3sjAiwxWbNqWXYMviTdyhgcCJUGHoyHXXa2RnySDh36LyJDuLqBpbDJ4qmSvzFWG1BZoTeabszGXI/RcWDwMhvt+G5q5qRqUHTcduz03duzJ0IiM0TxJBg8fQncOZdRQ8ja25Ps+kjRWbqx3b45gY4Ti5mJddxbeBhzlIV9//NZW5jV/BZKZuhppCzOY/x04cf1intRd/28ATE2d4s5VVO9pT0VRFEVRFEVRFEVRFEVRFEVRFEVRFEVRFEVRFEVRFEVRFEVRFEVRFEVRFEVRFEVRFEVRFGWP/AOOl0lPo1yV9wAAAABJRU5ErkJggg==";
                        }
                        productElement.innerHTML = `
                            <div class="col-12 col-md-4 mb-4">
                                <div class="card position-relative">                                    
                                    <img src="data:image/png;base64,${productImageBase64}" height="75" class="position-absolute top-0 end-0" alt="${productName}">
                                    <div class="card-body">
                                        <h5 class="card-title" style="position: relative;" >${productName}</h5>
                                        <p class="card-text">Precio: $${productPrice}</p>
                                         Descripci&oacute;n del producto 
                                        <p class="card-text me-auto">${product.desc}</p>
                                        <a href="whatsapp://send?phone=+53${encodeURIComponent(pyme_sel.movil)}&text=Hola! Estoy interesado en el producto ${encodeURIComponent(productName)} con el precio ${encodeURIComponent(productPrice)}." class="position-absolute end-0" style="top: 80%;padding-right: 10px;" data-action="share/whatsapp/share"><img
                                                src="images/whatsapp.png" alt=""></a>
                                        
                                    </div>
                                </div>
                            </div>                               
                                `;

                        // Agregar el elemento del producto al contenedor
                        productsContainer.appendChild(productElement);
                    });
                    document.getElementById('loading-image').style.display = 'none';

                    // Actualizar la paginación con el número total de páginas
                    updatePagination(pageNumber, totalPages);
                })
                .catch(error => {
                    // document.getElementById('products-container').innerHTML = 'Error al obtener los productos.';
                    document.getElementById('loading-image').style.display = 'none';
                });
        })
        .catch(error => {
            //document.getElementById('products-container').innerHTML = 'Error al obtener el n?mero total de productos.';
        });
}

// Funci?n para actualizar la paginaci?n
function updatePagination(currentPage, totalPages, search = false) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item${i === currentPage ? ' active' : ''}`;
        const link = document.createElement('a');
        link.className = 'page-link';
        link.href = '#';
        link.textContent = i;
        if (search == false) {
            link.addEventListener('click', () => fetchProducts(i, 6));
        } else {
            link.addEventListener('click', () => fetchProductsBySearch(i, 6, search));
        }
        li.appendChild(link);
        paginationContainer.appendChild(li);
    }
}


// Llamar a la funci?n para obtener y mostrar los productos al cargar la p?gina


myModalEl.addEventListener('hidden.bs.modal', function (event) {
    document.getElementById('search-input').value = '';
    productsearched = null;
})


document.getElementById('openModal').addEventListener('click', function () {
    if (checkConnection()) {
        alert("No hay conexión a Internet");
        return;
    }
    cerrarOffcanvas('offcanvasDerecho');


    var miModal = new bootstrap.Modal(document.getElementById('miModal'));

    if (productsearched) {
        document.getElementById('search-input').value = productsearched;
        fetchProductsBySearch(1, 6, productsearched);
    } else {
        fetchProducts(1, 6);

    }
    miModal.show();

});


// Evento de escucha para el campo de búsqueda
document.getElementById('search-input').addEventListener('input', function () {
    const searchTerm = this.value.trim(); // Obtener el término de búsqueda y eliminar espacios en blanco al inicio y al final
    if (searchTerm === '') {
        // Si el campo de búsqueda está vacío, mostrar todos los productos
        fetchProducts(1, 6);
    } else {
        // Si hay un término de búsqueda, llamar a la API con el término de búsqueda
        fetchProductsBySearch(1, 6, searchTerm);
    }
});

// Función para obtener y mostrar productos por término de búsqueda
function fetchProductsBySearch(pageNumber, productsPerPage, searchTerm) {
    // checkConnection();
    document.getElementById('loading-image').style.display = 'flex';
    document.getElementById('products-container').innerHTML = '';
    // URL de la API para obtener el número total de productos con el término de búsqueda
    const countUrl = `${(API)}/products/count?c_id=${(pyme_id)}&search=${encodeURIComponent(searchTerm)}`;
    const productsContainer = document.getElementById('products-container');
    // Hacer una solicitud a la API para obtener el total de productos con el término de búsqueda
    fetch(countUrl)
        .then(response => response.json()) // Parsear la respuesta JSON
        .then(totalProducts => {
            if (totalProducts == 0) {
                productsContainer.innerHTML = "No Hay Productos"
                return;
            }
            // Calcular el número total de páginas en función del total de productos
            const totalPages = Math.ceil(totalProducts / productsPerPage);
            const pyme_sel = storedPymes.find(objeto => objeto.id === pyme_id);
            // URL de la API con los parámetros de paginación y el término de búsqueda
            const apiUrl = `${(API)}/products?c_id=${(pyme_id)}&start=${(pageNumber - 1) * productsPerPage}&end=${pageNumber * productsPerPage}&search=${encodeURIComponent(searchTerm)}`;

            // Hacer una solicitud a la API utilizando Fetch para obtener los productos con el término de búsqueda
            fetch(apiUrl)
                .then(response => response.json()) // Parsear la respuesta JSON
                .then(data => {
                    // Obtener el contenedor donde se mostrarán los productos

                    productsContainer.innerHTML = '';

                    // Iterar sobre los productos y mostrarlos en el contenedor
                    data.forEach(product => {
                        const productName = product.name;
                        const productPrice = product.price;
                        var productImageBase64 = product.image;
                        if (product.desc == false){
                            product.desc = '';
                        }
                        // Crear elementos HTML para mostrar los datos del producto
                        const productElement = document.createElement('div');
                        productElement.className = 'col-md-4 mb-4';

                        if (!productImageBase64) {
                            productImageBase64 = "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";
                        }
                        // Utilizar componentes de Bootstrap para mejorar el aspecto del producto
                        productElement.innerHTML = `
                            <div class="col-12 col-md-4 mb-4">
                                <div class="card position-relative">                                    
                                    <img src="data:image/png;base64,${productImageBase64}" height="75" class="position-absolute top-0 end-0" alt="${productName}">
                                    <div class="card-body">
                                        <h5 class="card-title" style="position: relative;" >${productName}</h5>
                                        <p class="card-text">Precio: $${productPrice}</p>
                                         Descripci&oacute;n del producto 
                                        <p class="card-text me-auto">${product.desc}</p>
                                        <a href="whatsapp://send?phone=+53${encodeURIComponent(pyme_sel.movil)}&text=Hola! Estoy interesado en el producto ${encodeURIComponent(productName)} con el precio ${encodeURIComponent(productPrice)}." class="position-absolute end-0" style="top: 80%;padding-right: 10px;" data-action="share/whatsapp/share"><img
                                                src="images/whatsapp.png" alt=""></a>
                                        
                                    </div>
                                </div>
                            </div>                               
                                `;

                        // Agregar el elemento del producto al contenedor
                        productsContainer.appendChild(productElement);
                    });
                    document.getElementById('loading-image').style.display = 'none';

                    // Actualizar la paginación con el número total de páginas
                    updatePagination(pageNumber, totalPages, searchTerm);
                })
                .catch(error => {
                    document.getElementById('products-container').innerHTML = 'Error al obtener los productos.';
                    document.getElementById('loading-image').style.display = 'none';
                });
        })
        .catch(error => {
            document.getElementById('products-container').innerHTML = 'Error al obtener el número total de productos.';
        });
}

//// BUSCADOR PYMES POR PRODUCTOS
const apiEndpoint = API + '/product_search';

// Configurar Typeahead
$('#demo-input').typeahead({
        filter: false,
        hint: $('.Typeahead-hint'),
        menu: $('.Typeahead-menu'),
        classNames: {
            open: 'is-open',
            empty: 'is-empty',
            cursor: 'is-active',
            suggestion: 'Typeahead-suggestion',
            selectable: 'Typeahead-selectable'
        },
        minLength: 3,
        highlight: true
    }, {
        name: 'productos',
        display: 'name', // Campo que se mostrará en la lista de sugerencias
        source: function (query, syncResults, asyncResults) {
            $.ajax({
                url: apiEndpoint,
                data: {p: query,lat:latitude, long: longitude}, // Envía el nombre del producto a la API
                dataType: 'json',
                success: function (data) {
                    productsearched = query;
                    $('.Typeahead-spinner').hide();
                    var suggestions=null;
                    if (latitude != 0){
                        // Crear manualmente las sugerencias con ID y nombre
                        suggestions = data.map(pyme => $('<div class="tt-suggestion tt-selectable" data-id="' + pyme.id + '"><strong>' + pyme.name + '</strong> ->' + pyme.distancia +' Km</div>'));
                    }else{
                        suggestions = data.map(pyme => $('<div class="tt-suggestion tt-selectable" data-id="' + pyme.id + '"><strong>' + pyme.name + '</strong></div>'));
                    }

                    // Mostrar las sugerencias en la lista desplegable
                    $('.tt-dataset.tt-dataset-productos').empty().append(suggestions);
                },
                error: function (err) {
                    $('.Typeahead-spinner').hide();
                    alert('Error al obtener los datos:', err);
                }
            });

        }


    }
)
    .on('typeahead:asyncrequest', function () {
        $('.Typeahead-spinner').show();
    })
    .on('typeahead:asynccancel typeahead:asyncreceive', function () {
        $('.Typeahead-spinner').hide();
    });

$(document).on('click', '.tt-suggestion.tt-selectable', function () {
    // Obtener el ID y nombre de la sugerencia clickeada
    const suggestionID = $(this).data('id');
    productsearched = $('#demo-input').val();
    const pyme_sel = storedPymes.find(objeto => objeto.id === suggestionID);
    map.setView([pyme_sel.lat, pyme_sel.log], 16)

    pyme_id = suggestionID;
    openCanvas(suggestionID);


});

// Manejar el evento cuando se seleccione un elemento


var userMarker = null;
var userMarkerPyme = null;

// debug
var greenIcon = L.icon({
    iconUrl: 'images/marker-icon-2x.png',
    shadowUrl: 'images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

function d(s) {
    $("#status").text(s);
}

//funcion para hacer la ruta
function make_route(x, y) {
    var zoom = map.getZoom();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;

            control = L.Routing.control({
                waypoints: [
                    L.latLng(lat, lng), // Ubicación actual como primer waypoint
                    L.latLng(x, y), // Ubicación actual como primer waypoint

                ],
                profile: 'foot',
                language: 'es',
            });
            control.setPosition('bottomright').addTo(map);
            var clearButton = L.DomUtil.create("button", "leaflet-routing-clear-button");
            clearButton.innerHTML = "Borrar ruta";
            clearButton.onclick = function () {
                map.removeControl(control);
                stopGeoWatch();
                // map.setZoom(zoom);
            };
            control.getContainer().appendChild(clearButton);

        }, function (error) {
            console.error('Error al obtener la ubicación: ' + error.message);
        });
    } else {
        console.error('Geolocalización no soportada por el navegador.');
    }


}

// map
function onConfirmMap(buttonIndex) {
    if (buttonIndex == 1) {
        $("#locate").val(userMarkerPyme._latlng.lat + "," + userMarkerPyme._latlng.lng);
        modalPymeRegister.show();
        locatepye = false;
        map.removeLayer(userMarkerPyme);
    } else {
        map.removeLayer(userMarkerPyme);
    }

}

function mapInit() {

    var savedPosition = window.localStorage.getItem('mapPosition');
    var savedZoom = window.localStorage.getItem('mapZoom');

    map = new L.Map('map'); // global
    $("#map").height($(window).height());

    map.on('click', function (e) {
        if (locatepye) {
            var icon = L.icon({
                iconUrl: 'images/locate.png',
                iconSize: [32, 32],
                iconAnchor: [16, 32]
            });
            userMarkerPyme = L.marker([e.latlng.lat, e.latlng.lng], {icon: greenIcon}).addTo(map);
            navigator.notification.confirm(
                'Est\u00E1 es la ubicaci\u00F3n correcta!', // message
                onConfirmMap,            // callback to invoke with index of button pressed
                'Informaci\u00F3n',           // title
                ['Aceptar', 'Volver']     // buttonLabels
            );


        }
    });
    url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    opt = {minZoom: 7, attribution: "OSM"}
    var layer = new L.TileLayer(url, opt);

    map.whenReady(function () {
        map.removeControl(map.zoomControl);
    });
    var myLocationControl = L.control({position: 'topleft'});

    myLocationControl.onAdd = function (map) {
        var container = L.DomUtil.create('div', 'location leaflet-bar leaflet-control');

        var button = L.DomUtil.create('a', 'leaflet-bar-part', container);
        button.title = 'Mi ubicación';
        button.innerHTML = '<i class="fas fa-map-marker-alt"></i>'; // Icon for "Mi ubicación" (using Bootstrap Icons)

        // Associate the event handler to the button
        L.DomEvent.on(button, 'click', function () {
            startGeoWatch()
        });

        return container;
    };

// Add the custom control for "Mi ubicación" to the map
    myLocationControl.addTo(map);

// Add the default zoom controls to the map
    L.control.zoom({position: 'topleft'}).addTo(map);
    map.addLayer(layer);

    if (savedPosition && savedZoom) {
        var position = JSON.parse(savedPosition);
        var zoom = parseInt(savedZoom);
        map.setView(position, zoom);
    } else {
        map.setView(new L.LatLng(21.396819, -79.282837), 7);
    }
    map.on('moveend', function () {
        // Obtener la posición y el nivel de zoom actuales del mapa
        var position = map.getCenter();
        var zoom = map.getZoom();

        // Guardar la posición y el nivel de zoom en el localStorage
        window.localStorage.setItem('mapPosition', JSON.stringify(position));
        window.localStorage.setItem('mapZoom', zoom.toString());

    });
}

function mapPos(lat, lon) {
    // map.panTo(new L.LatLng(lat, lon),12);
    map.setView([lat, lon], 15)
}

// geo

function geoWin(pos) {
    latitude=pos.coords.latitude;
    longitude=pos.coords.longitude;
    mapPos(pos.coords.latitude, pos.coords.longitude);
    d("geoWin(): " + pos);
    if (userMarker) {
        map.removeLayer(userMarker);
    }

    // Create a marker at the user's location
    var icon = L.icon({
        iconUrl: 'images/locate.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    });
    userMarker = L.marker([pos.coords.latitude, pos.coords.longitude], {icon: icon}).addTo(map);
    onPause();
}

function geoFail(error) {
    // d("geoFail(): " + error.code + ": " + error.message);
}

function startGeoWatch() {
    d("startGeoWatch()");
    opt = {timeout: 1000, enableHighAccuracy: true};
    watchGeo = navigator.geolocation.watchPosition(geoWin, geoFail, opt); // global
    // onPause();
}

function stopGeoWatch() {
    navigator.geolocation.clearWatch(watchGeo);
}

// life cycle

function onPause() {
    stopGeoWatch();
}

function onResume() {
    startGeoWatch();
}

// init event listeners
function alertDismissed() {
    // do something
}


function onDeviceReady() {
    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);
    // startGeoWatch();
}

function openCanvas(id) {
    totalView = 0;
    const offcanvasElement = document.getElementById('offcanvasDerecho');
    const offcanvas = new bootstrap.Offcanvas(offcanvasElement);

    const cardPymeInfo = document.getElementById('cardPymeInfo');


    // Obtener los datos almacenados en localStorage


    // Convertir los datos a un array si no lo son
    if (typeof storedPymes === 'string') {
        data = JSON.parse(data);
    }


    var pyme_sel = storedPymes.find(objeto => objeto.id === id);

    async function obtenerTotalProductos() {
        try {
            const totalProducts = await CountProducts();
            pyme_sel.t_prod = totalProducts;
            // Puedes hacer más cosas con el valor aquí...
        } catch (error) {
            console.log('Error al obtener el total de productos: ' + error);
        }
    }


    obtenerTotalProductos();

    cardPymeInfo.innerHTML = `
                <div class="mt-3 mb-4 text-center">
                <img class="rounded-circle img-fluid" src="images/pyme.jpg" style="width: 100px;">
            </div>
            <h4 class="text-center" >${pyme_sel.name}</h4>                                   
            <div class="container mt-4">
                <div class="card border-0">
                    <div class="bi">                        
                        <p class="card-text"><strong>Correo:</strong> ${pyme_sel.email}</p>
                        <p class="card-text"><strong>Tel&eacute;fono:</strong> ${pyme_sel.movil}</p>
                        <p class="card-text"><strong>Direcci&oacute;n:</strong> ${pyme_sel.street}</p>
                        <p class="card-text"><strong>Actividad:</strong> ${pyme_sel.activity}</p>
                    </div>
                </div>
            </div>
            
                
<!--            <div class="mb-4 mt-4 pb-2 text-center">-->
<!--                <button class="btn btn-outline-primary btn-floating" type="button">-->
<!--                    <i class="fab fa-facebook-f fa-lg"></i>-->
<!--                </button>-->
<!--                <button class="btn btn-outline-primary btn-floating" type="button">-->
<!--                    <i class="fab fa-twitter fa-lg"></i>-->
<!--                </button>-->
<!--                <button class="btn btn-outline-primary btn-floating" type="button">-->
<!--                    <i class="fab fa-skype fa-lg"></i>-->
<!--                </button>-->
<!--            </div>-->

            <div class="d-flex justify-content-between text-center mt-5 mb-2">
                <div>
                    <p class="mb-2 h5">${pyme_sel.t_prod}</p>
                    <p class="text-muted mb-0">Total de Productos</p>
                </div>
                <div class="px-3">
                    <p id="totalView" class="mb-2 h5"></p>
                    <p class="text-muted mb-0">Total Views</p>
                </div>
                <div>
<!--                    <p class="mb-2 h5">4752</p>-->
<!--                    <p class="text-muted mb-0">Total Transactions</p>-->
                </div>
            </div>
                    
            `;

    async function obtenerTotalViews() {
        try {
            const totalViews = await CountViews();
            $('#totalView').text(totalViews);
            // Puedes hacer más cosas con el valor aquí...
        } catch (error) {
            console.log('Error al obtener el total de productos: ' + error);
        }
    }

    obtenerTotalViews();
    offcanvas.show();

}

function setPymes() {
    const pymes = JSON.parse(localStorage.getItem('pymes')) || [];
    pymes.forEach(pyme => {
        const pymeName = pyme.name;
        const pymeLat = pyme.lat;
        const pymeLog = pyme.log;


        var marker = L.marker([pymeLat, pymeLog], {icon: greenIcon, title: pymeName}).addTo(map);
        marker.bindTooltip(pymeName, {permanent: true, direction: 'top', offset: [0, -25]});

        marker.on('click', function (e) {
            if (map.getZoom() <= 14) {
                map.setView([pymeLat, pymeLog], 17);
            }

            pyme_id = pyme.id;
            openCanvas(pyme_id);


        });

    });
}


function fetchPymes() {
    const apiUrl = `${(API)}/pymes`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const storedPymes = JSON.parse(localStorage.getItem('pymes')) || [];

            // Comparar los datos obtenidos con los datos almacenados
            const hasChanges = JSON.stringify(data) !== JSON.stringify(storedPymes);

            // Si hay cambios en los datos, actualizar el localStorage y almacenar los nuevos datos
            if (hasChanges) {
                localStorage.setItem('pymes', JSON.stringify(data));

                map.eachLayer(function (layer) {
                    if (layer instanceof L.Marker) {
                        map.removeLayer(layer);
                    }
                });
                setPymes();
                document.location.href = 'index.html';

            }
        })
        .catch(error => {
            console.error('Error al obtener los datos:', error);
        });
}


function onDocumentReady() {
    mapInit()
    setPymes();
    fetchPymes();


}

function main() {
    $(document).ready(onDocumentReady);
    document.addEventListener('deviceready', onDeviceReady, false);
}

// main & globals
var watchGeo = null;
var map = null;
main();


const formulario = document.getElementById('loginForm');

function toggleSidebar() {
    var sidebar = document.getElementById('sidebar');
    if (sidebar.style.width === '250px') {
        sidebar.style.width = '0';
    } else {
        sidebar.style.width = '250px';
    }
}

document.getElementById('signout').addEventListener('click', function () {
    cerrarSesion();
});

function cerrarSesion() {
    // Aquí puedes agregar el código para cerrar la sesión
    // Por ejemplo, puedes redirigir a una página de inicio de sesión o enviar una petición al servidor para cerrar la sesión del usuario.
    localStorage.removeItem('auth');
    location.reload();
}

function updatePageLogged(Auth) {
    var AuthElement = JSON.parse(Auth);
    document.getElementById('loginForm').style.display = "none";
    document.getElementById('infoUser').style.display = "block";
    document.getElementById('displayname').innerHTML = AuthElement.displayname;
    document.getElementById('email').innerHTML = AuthElement.email;
}


if (savedAuth) {
    updatePageLogged(savedAuth);
}

function mostrarSpinner() {
    document.getElementById('spinner_login').classList.remove('d-none');
}

function ocultarSpinner() {
    document.getElementById('spinner_login').classList.add('d-none');
}

$('#SigninBtn').click(function () {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const campos = formulario.querySelectorAll('input');
    var errors = 0;
    campos.forEach(function (campo) {
        if (!campo.value) {
            // Agregar una clase CSS para resaltar los campos de entrada no completados
            campo.classList.add('campo-requerido');
            errors++;
        } else {
            // Eliminar la clase CSS si el campo de entrada ha sido completado
            campo.classList.remove('campo-requerido');
        }
    });

    if (formulario.checkValidity() === false) {
        event.preventDefault();
    }
    if (errors == 0) {
        mostrarSpinner();
        // Datos para la solicitud POST
        const data = {
            username: username,
            password: password
        };

        // Realizar la petición a la API
        fetch(API + "/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                ocultarSpinner();
                // La respuesta de la API será un objeto JSON
                if (data.token) {
                    // Si la respuesta contiene un token, significa que el inicio de sesión fue exitoso
                    window.localStorage.setItem('auth', JSON.stringify(data));
                    var savedAuth = window.localStorage.getItem('auth');
                    token = JSON.parse(savedAuth).token;
                    cargarDatosPyme();
                    updatePageLogged(savedAuth);

                } else {
                    document.getElementById('alertaError').classList.remove('d-none');
                    // Si la respuesta no contiene un token, significa que las credenciales son incorrectas
                    console.log('Credenciales incorrectas. Mensaje:', data.error);
                }
            })
            .catch(error => {

                ocultarSpinner();
                navigator.notification.alert(
                    'No se ha podido conectar con el servidor!',  // message
                    null,         // callback
                    'Error',            // title
                    'Aceptar'                  // buttonName
                );
            });

    }


});


const registerPyme = document.getElementById('createPyme');

var modalPymeRegister = new bootstrap.Modal(document.getElementById('agregarPymeModal'));

document.getElementById('btnAddPyme').addEventListener('click', function () {
    cerrarOffcanvas('offcanvasWithBothOptions');
    document.getElementById('locate').value = '';
    modalPymeRegister.show();
});


document.getElementById('geolocalizacion').addEventListener('click', event => {
    event.preventDefault();
    locatepye = true;
    var toastEl = document.querySelector('.toast');
    var toast = new bootstrap.Toast(toastEl);
    toast.show();
    modalPymeRegister.hide();
    // $('#map').css('cursor', 'url(\'images/marker-icon.png\'), auto');

});


function onConfirm(buttonIndex) {
    if (buttonIndex == 1) {
        const formPyme = document.getElementById('registerPyme');
        const pymename = document.getElementById('pymename').value;
        const numero_exp = document.getElementById('numero_exp').value;
        const telefono = document.getElementById('telefono').value;
        const direccion = document.getElementById('direccion').value;
        const actividad = document.getElementById('actividad').value;
        const geolocation = document.getElementById('locate').value;
        spinnerOverlay.style.display = 'block';

        // Envia los datos del formulario a la API
        fetch(`${(API)}/registerPyme`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                numero_exp,
                pymename,
                telefono,
                direccion,
                actividad,
                geolocation,
                token
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) { // Aquí se usa 'data' en lugar de 'response'
                    navigator.notification.alert(
                        'Su solicitud est\u00E1 pendiente a aprobaci\u00F3n!',  // message
                        null,         // callback
                        'Solicirud de Pyme',            // title
                        'Aceptar'                  // buttonName
                    );


                    formPyme.reset();
                    cargarDatosPyme();
                    spinnerOverlay.style.display = 'none';
                } else {
                    spinnerOverlay.style.display = 'none';
                    navigator.notification.alert(
                        data.msg,  // message
                        null,         // callback
                        'Error',            // title
                        'Aceptar'                  // buttonName
                    );

                }
            })
            .catch(error => {
                spinnerOverlay.style.display = 'none';
                alert('Error en el registro ' + error);
            });
    }
}


registerPyme.addEventListener('click', event => {
    const formPyme = document.getElementById('registerPyme');
    const campos = formPyme.querySelectorAll('input');
    var errors = 0;

    campos.forEach(function (campo) {
        if (!campo.value) {
            // Agregar una clase CSS para resaltar los campos de entrada no completados
            campo.classList.add('campo-requerido');
            if (campo.id == 'locate') {
                document.getElementById('geolocalizacion').classList.add('campo-requerido');
            }
            errors++;
        } else {
            // Eliminar la clase CSS si el campo de entrada ha sido completado
            campo.classList.remove('campo-requerido');
        }
    });

    if (formPyme.checkValidity() === false) {
        event.preventDefault();
    }
    if (errors == 0) {
        navigator.notification.confirm(
            'Est\u00E1 seguro que toda la informaci\u00F3n es correcta!', // message
            onConfirm,            // callback to invoke with index of button pressed
            'Informaci\u00F3n',           // title
            ['Aceptar', 'Volver']     // buttonLabels
        );
    }
});


function cargarDatosPyme() {
    if (token) {
        fetch(`${API}/getPyme?token=${token}`)
            .then(response => response.json())
            .then(data => {
                mostrarDatosEnTabla(data);
                document.getElementById('tabla-solicitudes').style.display = 'block';
            })
            .catch(error => {
                console.error('Error al obtener los datos:', error);
            });
    }

}

// Función para mostrar los datos en la tabla
function mostrarDatosEnTabla(pymeData) {
    const tablaSolicitudes = document.getElementById('tabla-solicitudes').getElementsByTagName('tbody')[0];
    // Limpiamos la tabla antes de mostrar nuevos datos
    tablaSolicitudes.innerHTML = '';

    // Recorremos los datos recibidos y agregamos filas a la tabla
    for (const pyme of pymeData) {
        const fila = tablaSolicitudes.insertRow();

        const celdaNombre = fila.insertCell();
        celdaNombre.textContent = pyme.pymename;

        const celdaTelefono = fila.insertCell();
        celdaTelefono.textContent = pyme.telefono;

        const celdaDireccion = fila.insertCell();
        celdaDireccion.textContent = pyme.direccion;

        const celdaEstado = fila.insertCell();
        celdaEstado.textContent = pyme.estado;

        if (pyme.estado == 'aprobada') {
            const btn_product = document.getElementById('botonProductos')
            btn_product.style.display = 'var(--fa-display,inline-block)';

            btn_product.addEventListener('click', function () {
                document.location.href = './product.html';
            });

        }

    }
}