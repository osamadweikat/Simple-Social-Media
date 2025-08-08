const baseUrl = "https://tarmeezAcademy.com/api/v1";

function setupUI() {
  const token = localStorage.getItem("token");
  const loginDiv = document.getElementById("logged-in-div");
  const logoutDiv = document.getElementById("logout-div");
  const addBtn = document.getElementById("add-btn");

  if (!token) {
    toggleDisplay(addBtn, "none");
    toggleDisplay(loginDiv, "flex");
    toggleDisplay(logoutDiv, "none");
  } else {
    toggleDisplay(addBtn, "block");
    toggleDisplay(loginDiv, "none");
    toggleDisplay(logoutDiv, "flex");

    const user = getCurrentUser();
    setUserNavInfo(user);
  }
}

function toggleDisplay(element, display) {
  if (element) element.style.setProperty("display", display, "important");
}

function setUserNavInfo(user) {
  const navUser = document.getElementById("nav-username");
  const navImg = document.getElementById("nav-user-image");
  if (navUser) navUser.innerHTML = user.username;
  if (navImg) navImg.src = user.profile_image;
}

function login() {
  const params = {
    username: document.getElementById("username-input").value,
    password: document.getElementById("password-input").value,
  };

  toggleLoader(true);
  axios
    .post(`${baseUrl}/login`, params)
    .then((res) => {
      saveAuthData(res.data);
      closeModal("login-modal");
      setupUI();
      showAlert("Logged in successfully", "success");
    })
    .catch((err) => handleError(err, "Login failed"))
    .finally(() => toggleLoader(false));
}

function register() {
  let formData = new FormData();
  formData.append("name", document.getElementById("register-name-input").value);
  formData.append(
    "username",
    document.getElementById("register-username-input").value
  );
  formData.append(
    "password",
    document.getElementById("register-password-input").value
  );
  formData.append(
    "image",
    document.getElementById("register-image-input").files[0]
  );

  toggleLoader(true);
  axios
    .post(`${baseUrl}/register`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => {
      saveAuthData(res.data);
      closeModal("register-modal");
      setupUI();
      showAlert("New User Registered Successfully", "success");
    })
    .catch((err) => handleError(err, "Registration failed"))
    .finally(() => toggleLoader(false));
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setupUI();
  showAlert("Logged out successfully", "success");
}

function saveAuthData(data) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
}

function editPost(postObject) {
  let post = JSON.parse(decodeURIComponent(postObject));
  document.getElementById("post-modal-submit-btn").innerHTML = "Update";
  document.getElementById("post-id-input").value = post.id;
  document.getElementById("post-title-input").value = post.title;
  document.getElementById("post-body-input").value = post.body;
  document.getElementById("post-modal-title").innerHTML = "Edit Post";
  showModal("create-post-modal");
  if (typeof getPosts === "function") getPosts();
}

function deletePost(postObject) {
  let post = JSON.parse(decodeURIComponent(postObject));
  document.getElementById("delete-post-id-input").value = post.id;
  showModal("delete-post-modal");
}

function confirmDelete() {
  const postId = document.getElementById("delete-post-id-input").value;
  const headers = getAuthHeaders();

  toggleLoader(true);
  axios
    .delete(`${baseUrl}/posts/${postId}`, { headers })
    .then(() => {
      closeModal("delete-post-modal");
      showAlert("The Post Has Been Deleted Successfully", "success");
      if (typeof getPosts === "function") getPosts();
      if (typeof getUser === "function") getUser();
    })
    .catch((err) => handleError(err, "Delete failed"))
    .finally(() => toggleLoader(false));
}

function createNewPost() {
  const postId = document.getElementById("post-id-input").value;
  const isCreate = !postId;
  const formData = new FormData();

  formData.append("body", document.getElementById("post-body-input").value);
  formData.append("title", document.getElementById("post-title-input").value);
  formData.append(
    "image",
    document.getElementById("post-image-input").files[0]
  );

  let url = isCreate ? `${baseUrl}/posts` : `${baseUrl}/posts/${postId}`;
  if (!isCreate) formData.append("_method", "put");

  toggleLoader(true);
  axios
    .post(url, formData, { headers: getAuthHeaders() })
    .then(() => {
      closeModal("create-post-modal");
      showAlert("Post saved successfully", "success");
      if (typeof getPosts === "function") getPosts();
      if (typeof getUser === "function") getUser();
    })
    .catch((err) => handleError(err, "Save failed"))
    .finally(() => toggleLoader(false));
}

function addBtnClicked() {
  document.getElementById("post-modal-submit-btn").innerHTML = "Create";
  document.getElementById("post-id-input").value = "";
  document.getElementById("post-title-input").value = "";
  document.getElementById("post-body-input").value = "";
  document.getElementById("post-modal-title").innerHTML = "Create A New Post";
  showModal("create-post-modal");
}

function getCurrentUser() {
  const storageUser = localStorage.getItem("user");
  return storageUser ? JSON.parse(storageUser) : null;
}

function profileClicked() {
  const user = getCurrentUser();
  if (user) window.location = `profile.html?userid=${user.id}`;
}

function toggleLoader(show) {
  const loader = document.getElementById("loader");
  if (loader) loader.style.visibility = show ? "visible" : "hidden";
}

function showAlert(message, type) {
  const alertPlaceholder = document.getElementById("success-alert");
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      <div>${message}</div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
  alertPlaceholder.append(wrapper);

  setTimeout(() => {
    const bsAlert = bootstrap.Alert.getOrCreateInstance(
      wrapper.querySelector(".alert")
    );
    bsAlert.close();
  }, 2000);
}

function handleError(error, defaultMsg) {
  const message = error.response?.data?.message || defaultMsg;
  showAlert(message, "danger");
}

function getAuthHeaders() {
  return {
    "Content-Type": "multipart/form-data",
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

function showModal(id) {
  new bootstrap.Modal(document.getElementById(id), {}).toggle();
}

function closeModal(id) {
  const modal = document.getElementById(id);
  const inst = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
  inst.hide();
}
