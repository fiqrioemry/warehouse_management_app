function getRandomUserAvatar(fullname: string) {
  const encodedName = encodeURIComponent(fullname);
  return `https://api.dicebear.com/6.x/initials/svg?seed=${encodedName}`;
}
export default getRandomUserAvatar;
