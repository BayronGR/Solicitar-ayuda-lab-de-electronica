async function getGroups() {
  try {
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbwvYx83H9cqgXqSQ7bvmxrvpy0qZUfxA5N2Dxcqik9uUGe-3b7uv7hzuQd2hugFaJgawA/exec';
    const response = await fetch(scriptUrl);

    if (!response.ok) {
      throw new Error("Error en la solicitud");
    }

    const data = await response.json();

    // Crear la constante messages
    const messages = data.map(row => ({
      id: row[0],
      title: row[1], // Columna B
      body: row[2],   // Columna C
      comments: row[3]
      
    }));

    // Filtrar y ordenar messages
    const filteredMessages = messages.filter(mgs => mgs.body.trim() !== "");
    filteredMessages.sort((a, b) => a.id - b.id);

    return filteredMessages; // Retornar la constante messages

  } catch (error) {
    console.error("Error al obtener los datos:", error);
    return []; // Retornar un arreglo vacío en caso de error
  }
}

async function getCounts() {
  try {
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbxjza6Fx-ikp-aiqEasUg7KjC6i71eywGG0r0xQhods55cVOlqIhh4QKB6Ah-v5-x2KoQ/exec';
    const response = await fetch(scriptUrl);

    if (!response.ok) {
      throw new Error("Error en la solicitud");
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Error al obtener los datos:", error);
    return []; // Retornar un arreglo vacío en caso de error
  }
}

// Función para hacer la solicitud POST para actualizar la fecha en Google Sheets
async function updateDateById(id) {
  try {
    console.log("Update group: ", id);
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbydBUiRGssta6wkN0VyJLazAaz0xVCufp0tMp0yYolwmKNZ_f0E2FZWVbMdBfrhVibjJw/exec';
    const formDataString = `id=${encodeURIComponent(id)}`;
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: formDataString
    });

    if (!response.ok) {
      throw new Error("Error en la solicitud de actualización");
    }

    const result = await response.json();
    console.log(result); // Verifica la respuesta del servidor
  } catch (error) {
    console.error("Error al actualizar la fecha:", error);
  }
}


function createGroupStats(registered, pending, attended) {
  const nav = document.createElement('nav');
  nav.className = "level";

  const stats = [
    { heading: 'Grupos Registrados', title: registered },
    { heading: 'Grupos Pendientes', title: pending },
    { heading: 'Grupos Atendidos', title: attended },
  ];

  stats.forEach(stat => {
    const levelItem = document.createElement('div');
    levelItem.className = "level-item has-text-centered";

    const innerDiv = document.createElement('div');

    const headingElement = document.createElement('p');
    headingElement.className = "heading";
    headingElement.textContent = stat.heading;

    const titleElement = document.createElement('p');
    titleElement.className = "title";
    titleElement.textContent = stat.title;

    innerDiv.appendChild(headingElement);
    innerDiv.appendChild(titleElement);
    levelItem.appendChild(innerDiv);
    nav.appendChild(levelItem);
  });

  const container = document.getElementById('stats-container'); // Cambia a tu contenedor
  if (container) {
    container.prepend(nav);
  } else {
    console.error('No se encontró el contenedor especificado.');
  }
}


function createMessage(id, title, body, comments) {
  const article = document.createElement('article');
  article.className = "message is-info"; // Cambiar a "is-dark" si prefieres

  const header = document.createElement('div');
  header.className = "message-header";
  header.innerHTML = `<p>${title}</p>`; // Solo muestra el título
  

  const bodyDiv = document.createElement('div');
  bodyDiv.className = "message-body";
  bodyDiv.innerHTML = `${body}:<br>${comments}`;

  // Crear un párrafo oculto que contiene el ID
  const hiddenParagraph = document.createElement('p');
  hiddenParagraph.style.display = 'none'; // Ocultar el párrafo
  hiddenParagraph.textContent = id; // Almacena el ID en el párrafo oculto
  hiddenParagraph.id = 'message-id'

  article.appendChild(header);
  article.appendChild(bodyDiv);
  article.appendChild(hiddenParagraph); // Agregar el párrafo oculto al artículo

  document.getElementById('messages-container').appendChild(article);
}


// Función para eliminar el primer mensaje y actualizar la fecha
async function deleteFirstMessage() {
  const messageContainer = document.getElementById('messages-container');
  const firstMessage = messageContainer.querySelector('article'); // Seleccionar el primer mensaje

  if (firstMessage) {
    // Obtener el ID del primer mensaje (está en un párrafo oculto)
    const messageId = firstMessage.querySelector('#message-id').textContent;

    // Enviar la solicitud de actualización a Google Apps Script
    await updateDateById(messageId); // Llamar a la función para actualizar la fecha en Google Sheets

    // Eliminar el primer mensaje
    messageContainer.removeChild(firstMessage);

    console.log("Primer mensaje eliminado y fecha actualizada.");
    window.location.reload();
  } else {
    console.log("No hay mensajes para eliminar.");
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  const loadingElement = document.getElementById('loading');

  loadingElement.style.display = 'block';

  const bodyChildren = document.body.children;
  for (let i = 0; i < bodyChildren.length; i++) {
    const child = bodyChildren[i];
    if (child !== loadingElement) {
      child.style.display = 'none'; // Ocultar otros elementos
    }
  }

  const data = await getCounts();
  const messages = await getGroups(); // Esperar a que se obtengan los mensajes
  createGroupStats(data.TotalRecords, data.PendingRecords, data.AttempRecords); // Puedes cambiar estos números según los datos reales

  console.log(messages); // Para verificar que se obtienen los mensajes

  messages.forEach(msg => createMessage(msg.id, msg.title, msg.body, msg.comments));

  loadingElement.style.display = 'none';

  for (let i = 0; i < bodyChildren.length; i++) {
    const child = bodyChildren[i];
    if (child !== loadingElement) {
      child.style.display = ''; // Restablecer el estilo para mostrar el elemento
    }
  }
  // Agregar evento al botón de eliminar
  const deleteButton = document.getElementById('delete-group-button');
  deleteButton.addEventListener('click', deleteFirstMessage);
});
