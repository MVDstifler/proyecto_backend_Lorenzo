// public/js/messages.js

// Función para mostrar un mensaje en pantalla
function showMessage(type, text) {
    const messageContainer = document.createElement('div');
    messageContainer.className = `message ${type}`; // Clases: message success, message error
    messageContainer.textContent = text;

    // Agregar el mensaje al cuerpo del documento
    document.body.appendChild(messageContainer);

    // Eliminar el mensaje después de 3 segundos
    setTimeout(() => {
        messageContainer.remove();
    }, 3000);
}

// Función para mostrar un mensaje de éxito
function showSuccessMessage(text) {
    showMessage('success', text);
}

// Función para mostrar un mensaje de error
function showErrorMessage(text) {
    showMessage('error', text);
}

// Ejemplo de uso
// showSuccessMessage("Producto agregado con éxito.");
// showErrorMessage("Hubo un error al agregar el producto.");

// Exportar funciones si estás utilizando un sistema de módulos
if (typeof module !== 'undefined') {
    module.exports = {
        showSuccessMessage,
        showErrorMessage,
    };
}
