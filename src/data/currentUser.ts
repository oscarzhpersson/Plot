export const currentUser = {
  name: "Oscar Persson",
  initials: "OP",
};

export function isCurrentUser(author: typeof currentUser) {
  return author.name === currentUser.name && author.initials === currentUser.initials;
}
