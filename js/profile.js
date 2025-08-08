function getCurrentUserId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("userid");
}

function getUser() {
  const id = getCurrentUserId();
  toggleLoader(true);
  axios
    .get(`${baseUrl}/users/${id}`)
    .then((response) => {
      const user = response.data.data;
      document.getElementById("header-image").src = user.profile_image;
      document.getElementById("main-info-email").innerHTML = user.email;
      document.getElementById("main-info-name").innerHTML = user.name;
      document.getElementById("main-info-username").innerHTML = user.username;
      document.getElementById("posts-count").innerHTML = user.posts_count;
      document.getElementById("comments-count").innerHTML = user.comments_count;
      document.getElementById(
        "name-posts"
      ).innerHTML = `${user.username}'s Posts`;
    })
    .catch((error) => {
      const message =
        error.response?.data?.message || "Failed to load user info";
      showAlert(message, "danger");
    })
    .finally(() => toggleLoader(false));
}

function getPosts() {
  const id = getCurrentUserId();
  toggleLoader(true);
  axios
    .get(`${baseUrl}/users/${id}/posts`)
    .then((response) => {
      const posts = response.data.data;
      const container = document.getElementById("user-posts");
      container.innerHTML = "";
      for (const post of posts) {
        const user = getCurrentUser();
        const isMyPost = user && post.author.id === user.id;
        const author = post.author;
        const postTitle = post.title || "";
        let editBtnContent = "";
        if (isMyPost) {
          editBtnContent = `
            <button class="btn btn-danger" style="margin-left: 5px; float: right;" onclick="deletePost('${encodeURIComponent(
              JSON.stringify(post)
            )}')">delete</button>
            <button class="btn btn-secondary" style="float: right;" onclick="editPost('${encodeURIComponent(
              JSON.stringify(post)
            )}')">edit</button>
          `;
        }
        const content = `
          <div class="card shadow">
            <div class="card-header">
              <img class="rounded-circle border border-2" src="${author.profile_image}" alt="" style="width: 40px; height: 40px;">
              <b>${author.username}</b>
              ${editBtnContent}
            </div>
            <div class="card-body" onclick="postClicked(${post.id})" style="cursor: pointer;">
              <img class="w-100" src="${post.image}" alt="">
              <h6 style="color: rgb(193, 193, 193);" class="mt-1">${post.created_at}</h6>
              <h5>${postTitle}</h5>
              <p>${post.body}</p>
              <hr>
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16"><path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/></svg>
                <span>
                  (${post.comments_count}) Comments
                  <span id="post-tags-${post.id}"></span>
                </span>
              </div>
            </div>
          </div>
        `;
        container.innerHTML += content;
        for (const tag of post.tags) {
          document.getElementById(`post-tags-${post.id}`).innerHTML += `
            <button class="btn btn-sm rounded-5" style="background-color: gray; color: white;">${tag.name}</button>
          `;
        }
      }
    })
    .catch((error) => {
      const message = error.response?.data?.message || "Failed to load posts";
      showAlert(message, "danger");
    })
    .finally(() => toggleLoader(false));
}

function postClicked(postId) {
  window.location = `post-details.html?postId=${postId}`;
}

setupUI();
getUser();
getPosts();
