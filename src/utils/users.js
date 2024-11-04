const users = [];

export const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  if (!username || !room)
    return {
      error: "Username and room are required",
    };

  const existingUser = users.find(
    (user) => user.room === room && user.username === username
  );
  if (existingUser) return { error: "User already exists" };

  const user = { id, username, room };
  users.push(user);
  return { user };
};

export const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) return users.splice(index, 1)[0];
  return null;
};

export const getUser = (id) => {
  return users.find((user) => user.id === id);
};

export const getUserInRoom = (room) => {
  return users.filter((user) => user.room === room);
};