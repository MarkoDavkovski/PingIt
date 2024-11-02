const socket = io();

//Elements
const $messageContainer = document.getElementById("messages");
const $chatForm = document.getElementById("chat-form");
const $messageInput = $chatForm.querySelector("#message");
const $usernameInput = $chatForm.querySelector("#username");
const $chatFormButton = $chatForm.querySelector("button");

const $locationButton = document.getElementById("send-location");

socket.on("userConnected", ({ message }) => {
  console.log(message);
});
socket.on("userDisconnected", ({ message }) => {
  console.log(message);
});

socket.on("newMessage", (data) => {
  const { username, message } = data;
  const msgElement = document.createElement("div");
  msgElement.textContent = `${username}: ${message}`;
  $messageContainer.appendChild(msgElement);
});

socket.on("locationReceived", (data) => {
  const { username, locationURL } = data;

  const locationElement = document.createElement("div");
  locationElement.innerHTML = `<strong>${username}:</strong> <a href="${locationURL}" target="_blank">My location</a>`;
  $messageContainer.appendChild(locationElement);

  $messageContainer.scrollTop = $messageContainer.scrollHeight;
});

$chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $chatFormButton.setAttribute("disabled", "disabled");

  const username = $usernameInput.value;
  const message = $messageInput.value;

  socket.emit("sendMessage", { username, message }, (error) => {
    if (error) return console.error(error);
    console.log("Delivered");
  });

  $chatFormButton.removeAttribute("disabled");
  $messageInput.value = "";
});

$locationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  }

  $locationButton.setAttribute("disabled", "disabled");
  $locationButton.textContent = "Sharing location...";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const username = $usernameInput.value;

      socket.emit("sendLocation", { latitude, longitude, username }, () => {
        $locationButton.removeAttribute("disabled");
        $locationButton.textContent = "Send location";
        console.log("Location shared");
      });
    },
    () => {
      $locationButton.removeAttribute("disabled");
      $locationButton.textContent = "Send location";
      alert("Unable to retrieve location.");
    }
  );
});
