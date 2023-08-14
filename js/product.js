var token = false;
var savedAuth = window.localStorage.getItem('auth');
productsearched = null;
if (savedAuth) {
    token = JSON.parse(savedAuth).token;
}
const API = "https://cubapyme.mooo.com/api";
// const API = "http://127.0.0.1:8069/api";

$('#modalAgregar').on('show.bs.modal', function (event) {
    // Aquí puedes realizar la acción que desees al abrir el modal.
    // Por ejemplo, podrías hacer una llamada AJAX para cargar contenido dinámicamente.
    $('#imagen').val('');
});

function cargarProductos() {
    $('#spinner').show();

    $.ajax({
        url: API + '/productManager',
        type: 'GET',
        data: {
            token: token
        },
        dataType: 'json',
        success: function (data) {
            $('#spinner').hide();
            // Limpiar la tabla antes de agregar los productos
            $('#productosTabla').empty();

            // Agregar los productos a la tabla
            $.each(data, function (index, producto) {
                const estado = producto.status ? 'checked' : '';
                if (producto.desc == false) {
                    producto_desc = '';
                } else {
                    producto_desc = producto.desc;
                }


                const switchHTML = `
            <label class="switch">
              <input type="checkbox" class="toggleHabilitado" data-id="${producto.id}" ${estado}>
              <span class="slider round"></span>
            </label>
          `;

                $('#productosTabla').append(`
            <tr>
              <td><img src="data:image/png;base64,${producto.image}" height="50" alt="N/A"> ${producto.name}</td>
              <td>${producto.price}</td>
              <td>${switchHTML}</td>
              <td>
                <button type="button" class="btnEditar" data-id="${producto.id}" data-nombre="${producto.name}" data-precio="${producto.price}" data-desc="${producto_desc}"><img src="./img/edit.png" alt="Imagen de ejemplo" width="30" height="30"></button>
                <button type="button" class="btnEliminar" data-id="${producto.id}"><img src="./img/delete.png" alt="Imagen de ejemplo" width="30" height="30"></button>
              </td>
            </tr>
          `);
            });

            $('.toggleHabilitado').change(function () {
                const id = $(this).data('id');
                const estado = $(this).prop('checked');
                const formData = new FormData();
                formData.append('id', id);
                formData.append('estado', estado);
                guardarProducto(id, formData);
            });

            $('.btnEliminar').click(function () {
                const id = $(this).data('id');
                eliminarProducto(id);
            });
        },
        error: function (xhr, textStatus, errorThrown) {
            // Error: Something went wrong with the API call
            $('#spinner').hide();
        }
    });
}

// ... Código anterior para manejar la vista previa de la imagen y las funciones CRUD ...
var spinnerOverlay = document.getElementById('spinner-overlay');

function guardarProducto(id, formData) {
    formData.append('token', token);

    // Si se proporciona un ID, es una actualización; de lo contrario, es una creación
    const url = id ? `${(API)}/update_product` : API + '/create_product';
    spinnerOverlay.style.display = 'block';
    $.ajax({
        url: url,
        type: id ? 'POST' : 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            spinnerOverlay.style.display = 'none';
            var modalp = new bootstrap.Modal(document.getElementById('modalAgregar'));
            // Limpiar el formulario y actualizar la tabla de productos
            $('#productForm')[0].reset();
            $('#imagenPreview').html('');
            $('#btnActualizar').hide();
            $('#btnEliminar').hide();
            $('#btnAgregar').show();
            cargarProductos();
            modalp.hide();
        },
        error: function (error) {
            spinnerOverlay.style.display = 'none';
            alert('Error al guardar el producto:', error);
        },
        complete: function () {
            // Ocultar el spinner después de que la solicitud se haya completado (éxito o error)
            $('#spinner').hide();
        }
    });
}


//Eliminar Productyos
function eliminarProducto(id) {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('token', token);

    navigator.notification.confirm(
        'Est\u00E1s seguro que desea eliminar el producto', // message
        onConfirmDelete,            // callback to invoke with index of button pressed
        'Informaci\u00F3n',           // title
        ['Aceptar', 'Volver']     // buttonLabels
    );

    function onConfirmDelete(buttonIndex) {
        if (buttonIndex == 1) {
            spinnerOverlay.style.display = 'block';
            const url = `${(API)}/delete_product`;
            $('#spinner').show();
            $.ajax({
                url: url,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    spinnerOverlay.style.display = 'none';
                    cargarProductos();
                },
                error: function (error) {
                    navigator.notification.alert(
                        'Error al guardar el producto: ' + error,  // message
                        null,         // callback
                        'CubaPyme',            // title
                        'Aceptar'                  // buttonName
                    );

                },
                complete: function () {
                    // Ocultar el spinner después de que la solicitud se haya completado (éxito o error)
                    $('#spinner').hide();
                }
            });

        }
    }

}

// Asignar evento para abrir el modal de edición al hacer clic en el botón "Editar"
$(document).on('click', '.btnEditar', function () {
    const id = $(this).data('id');
    const nombre = $(this).data('nombre');
    const precio = $(this).data('precio');
    const desc = $(this).data('desc');

    var editor = tinymce.get('editdescripcion'); // Accede a la instancia del editor
    if (editor) {
        editor.setContent(desc); // Cambia el contenido del editor
    } else {
        console.error('Editor instance not found.');
    }


    $('#idproduct').val(id);
    $('#editNombre').val(nombre);
    $('#editPrecio').val(precio);
    $('#editdescripcion').text(desc);
    $('#editImagen').val('');
    $('#modalEditar').modal('show');

    $('#editProductForm').submit(function (event) {
        event.preventDefault();
        const id = $('#idproduct').val()
        const nombre = $('#editNombre').val();
        const precio = $('#editPrecio').val();
        const desc = $('#editdescripcion').val();
        const formData = new FormData();

        formData.append('id', id);
        formData.append('nombre', nombre);
        formData.append('precio', precio);
        formData.append('desc', desc);

        // Check if a new image is selected and append it to the formData
        const newImageFile = $('#editImagen')[0].files[0];

        if (newImageFile) {
            const reader = new FileReader();
            reader.onloadend = function () {
                // After reading the image, convert it to Base64 and append it to the formData
                const base64Image = reader.result.split(',')[1];

                formData.append('imagen', base64Image);

                // Now, call the guardarProducto function with the updated formData
                guardarProducto(id, formData);

                // Hide the modal after successfully saving the product data
                $('#modalEditar').modal('hide');
            };
            reader.readAsDataURL(newImageFile);
        } else {
            // If no new image is selected, call the guardarProducto function with the original formData
            guardarProducto(id, formData);

            // Hide the modal after successfully saving the product data
            $('#modalEditar').modal('hide');
        }
    });
});
const registerProduct = document.getElementById('productForm');

registerProduct.addEventListener('submit', event => {
    event.preventDefault(); // Evita que el formulario se envíe automáticamente
    const formData = new FormData();
    const nombre = $('#nombre').val();
    const precio = $('#precio').val();
    const desc = tinymce.get('descripcionproduct').getContent();


    formData.append('nombre', nombre);
    formData.append('precio', precio);
    formData.append('desc', desc);

    spinnerOverlay.style.display = 'block';

    const newImageFile = $('#imagen')[0].files[0];

    if (newImageFile) {
        const reader = new FileReader();
        reader.onloadend = function () {
            // After reading the image, convert it to Base64 and append it to the formData
            const base64Image = reader.result.split(',')[1];

            formData.append('imagen', base64Image);
            // Now, call the guardarProducto function with the updated formData
            guardarProducto(null, formData);
            // Hide the modal after successfully saving the product data
        };
        reader.readAsDataURL(newImageFile);
    } else {
        // If no new image is selected, call the guardarProducto function with the original formData
        guardarProducto(null, formData);



    }
    spinnerOverlay.style.display = 'none';

});

cargarProductos();
