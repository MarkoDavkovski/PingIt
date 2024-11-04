const socket = io();

//Elements
const $messageContainer = document.getElementById("messages");
const $chatForm = document.getElementById("chat-form");
const $messageInput = $chatForm.querySelector("#message");
const $usernameInput = $chatForm.querySelector("#username");
const $chatFormButton = $chatForm.querySelector("button");

const $locationButton = document.getElementById("send-location");

const $roomName = document.getElementById("room-name").querySelector("span");
const $usersList = document.getElementById("users");

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  const $newMessage = $messageContainer.lastElementChild;

  if (!$newMessage) return;

  requestAnimationFrame(() => {
    const newMessageHeight = $newMessage.offsetHeight;
    const visibleHeight = $messageContainer.offsetHeight;
    const containerHeight = $messageContainer.scrollHeight;

    const scrollOffset = $messageContainer.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset + 10) {
      $messageContainer.scrollTop = containerHeight;
    }
  });
};
socket.on("roomData", ({ room, users }) => {
  $roomName.textContent = room;
  $usersList.innerHTML = "";

  users.forEach((user) => {
    const li = document.createElement("li");
    li.textContent = user.username;
    $usersList.appendChild(li);
  });
});

socket.on("newMessage", (data) => {
  const { username, message, createdAt } = data;
  const formattedTime = moment(createdAt).format("h:mm a");

  const msgElement = document.createElement("div");
  msgElement.innerHTML = `
  <div class="message"> 
    <div class="message-header">
      <strong>${username}</strong> <span>${formattedTime}</span>
    </div>
    <div class="message-body">${message}</div>
  </div>
  `;

  $messageContainer.appendChild(msgElement);
  autoScroll();
});

socket.on("locationReceived", (data) => {
  const { username, locationURL, createdAt } = data;
  const formattedTime = moment(createdAt).format("h:mm a");

  const locationElement = document.createElement("div");

  locationElement.innerHTML = `
  <div class="message"> 
    <div class="message-header">
      <strong>${username}</strong> <span>${formattedTime}</span>
    </div>
    <div class="message-body"><a href="${locationURL}" target="_blank">My current location</a></div>
  </div>`;
  $messageContainer.appendChild(locationElement);

  autoScroll();
});

$chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $chatFormButton.setAttribute("disabled", "disabled");

  const message = $messageInput.value;
  const createdAt = new Date().getTime();

  const data = {
    username,
    message,
    createdAt,
  };

  socket.emit("sendMessage", data, (error) => {
    if (error) return console.error(error);
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
      const createdAt = new Date().getTime();
      const data = { longitude, latitude, createdAt, username };

      socket.emit("sendLocation", data, () => {
        $locationButton.removeAttribute("disabled");
        $locationButton.textContent = "Send location";
      });
    },
    () => {
      $locationButton.removeAttribute("disabled");
      $locationButton.textContent = "Send location";
      alert("Unable to retrieve location.");
    }
  );
});

socket.emit("userJoin", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
