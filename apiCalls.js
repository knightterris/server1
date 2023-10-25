const api = `http://localhost:3000`;

export async function register(name, email, password) {
  const res = await fetch(`${api}/register`, {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) return false;

  const user = await res.json();
  return user;
}

export async function getToken() {
  return localStorage.getItem("token");
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
