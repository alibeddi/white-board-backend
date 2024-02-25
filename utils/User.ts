interface User {
    id: string;
    username: string;
    room: string;
    host: boolean;
    presenter: boolean;
  }
  
  const users: User[] = [];
  
  // Join user to chat
  const userJoin = (id: string, username: string, room: string, host: boolean, presenter: boolean): User => {
    const user: User = { id, username, room, host, presenter };
  
    users.push(user);
    return user;
  };
  
  // User leaves chat
  const userLeave = (id: string): User | undefined => {
    const index = users.findIndex((user) => user.id === id);
  
    if (index !== -1) {
      return users.splice(index, 1)[0];
    }
  };
  
  // Get users
  const getUsers = (room: string): User[] => {
    const roomUsers: User[] = [];
    users.forEach((user) => {
      if (user.room === room) {
        roomUsers.push(user);
      }
    });
  
    return roomUsers;
  };
  
  export {
    userJoin,
    userLeave,
    getUsers,
  };
  