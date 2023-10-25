const api = `http://localhost:3000`;

export async function register(name, email, password) {
  const res = await fetch(`${api}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) return false;

  const user = await res.json();
  return user;
}

export async function login(email, password) {
  const res = await fetch(`${api}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return false;
  const token = await res.text();
  localStorage.setItem("token", token);

  return token;
}

export async function getToken() {
  return localStorage.getItem("token");
}

export async function createTopic(userId, topicName) {
  const res = await fetch(`${api}/create/topic`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, topicName }),
  });
  if (!res.ok) return false;
  const topic = await res.json();
  return topic;
}

export async function getTopics() {
  const res = await fetch(`${api}/get/topics`, {
    method: "get",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) return false;

  const topics = await res.json();
  return topics;
}

export async function updateTopic(topicId, userId, topicName) {
  const res = await fetch(`${api}/update/topic`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topicId, userId, topicName }),
  });
  if (!res.ok) return false;

  const updatedTopic = res.json();
  return updatedTopic;
}

export async function deleteTopic(topicId) {
  const res = await fetch(`${api}/delete/topic`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topicId }),
  });
  if (!res.ok) return false;

  return res.json();
}

export async function createPost(caption, userId, topicId, postImages) {
  const formData = new FormData();
  formData.append("caption", caption);
  formData.append("userId", userId);
  formData.append("topicId", topicId);

  // Append image files to the form data
  postImages.forEach((image) => {
    formData.append("post_images", image);
  });

  const res = await fetch(`${api}/create/post`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) return false;
  const post = await res.json();

  return post;
}

export async function getPosts() {
  const res = await fetch(`${api}/get/posts`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) return false;
  const posts = await res.json();
  return posts;
}

export async function getUserPosts(userId) {
  const res = await fetch(`${api}/get/posts/${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) return false;
  const posts = await res.json();
  return posts;
}

export async function updateProfile(
  userId,
  newName,
  newPosition,
  occupationVal
) {
  const res = await fetch(`${api}/update/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, newName, newPosition, occupationVal }),
  });
  if (!res.ok) return false;
  const updatedProfile = await res.json();
  return updatedProfile;
}

export async function updatePassword(userId, oldPassword, newPassword) {
  const res = await fetch(`${api}/update/password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, oldPassword, newPassword }),
  });
  if (!res.ok) return false;
  const passwordUpdated = await res.json();
  return passwordUpdated;
}
