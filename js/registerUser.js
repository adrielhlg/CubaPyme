// const API = "http://192.168.0.226:8069/api";
const API = "https://cubapyme.mooo.com/api";

var spinnerOverlay = document.getElementById('spinner-overlay');

const registerForm = document.getElementById('registerUser');
// Manejador de eventos para el envío del formulario

function UserSuccess(user,password){
    const parametros = {
        username: user,
        password: password,
    };
    fetch(API + "/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(parametros)
    })
        .then(response => response.json())
        .then(data => {
            // La respuesta de la API será un objeto JSON
            if (data.token) {
                window.localStorage.setItem('auth', JSON.stringify(data));
                window.location.href='index.html'

            }
        })


}

registerForm.addEventListener('submit', event => {
    event.preventDefault(); // Evita que el formulario se envíe automáticamente
    spinnerOverlay.style.display = 'block';

    // Obtiene los valores de los campos del formulario
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const repeatPassword = document.getElementById('repeat-password').value;

    // Verifica que las contraseñas coincidan
    if (password !== repeatPassword) {
        navigator.notification.alert(
            '\u00A1Las contrase\u00F1a no coinciden!',  // message
            null,         // callback
            'Registro de Usuario',            // title
            'Aceptar'                  // buttonName
        );
        spinnerOverlay.style.display = 'none';
        return;
    }

    // Envia los datos del formulario a la API
    fetch(`${(API)}/registerUser`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fullname,
            email,
            password
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) { // Aquí se usa 'data' en lugar de 'response'
                navigator.notification.alert(
                    'Usted se ha registrado correctamente!',  // message
                    UserSuccess(email,password),         // callback
                    'Registro de Usuario',            // title
                    'Aceptar'                  // buttonName
                );

            } else {
                spinnerOverlay.style.display = 'none';
                navigator.notification.alert(
                    data.msg,  // message
                    null,         // callback
                    'Error en el registro',            // title
                    'Aceptar'                  // buttonName
                );

            }
        })
        .catch(error => {
            spinnerOverlay.style.display = 'none';
            navigator.notification.alert(
                'Por favor compruebe su conexi\u00F3n a Internet',  // message
                null,         // callback
                'Error en el registro',            // title
                'Aceptar'                  // buttonName
            );
        });

});