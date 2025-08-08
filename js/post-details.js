const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("postId");

setupUI();
getPost();

function getPost() {
  const token = localStorage.getItem("token");
  toggleLoader(true);
  axios
    .get(`${baseUrl}/posts/${id}`)
    .then((response) => {
      const post = response.data.data;
      const comments = post.comments;
      const author = post.author;
      document.getElementById("username-span").innerHTML =
        author.username + " Post";
      const postTitle = post.title || "";
      let commentsContent = "";
      for (const comment of comments) {
        commentsContent += `
          <div class="p-3" style="background-color: rgb(235, 235, 235);">
            <div>
              <img src="${comment.author.profile_image}" class="rounded-circle" style="width: 40px; height: 40px;">
              <b>${comment.author.username}</b>
            </div>
            <div>${comment.body}</div>
          </div>
        `;
      }
      const postContent = `
        <div class="card shadow">
          <div class="card-header">
            <img class="rounded-circle border border-2" src="${author.profile_image}" alt="" style="width: 40px; height: 40px;">
            <b>@${author.username}</b>
          </div>
          <div class="card-body">
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
          <div id="comments">${commentsContent}</div>
          <div class="input-group mb-3" id="add-comment-div">
            <input id="comment-input" type="text" placeholder="add your comment here..." class="form-control">
            <button class="btn btn-outline-primary" type="button" onclick="creatComment()">send</button>
          </div>
        </div>
      `;
      document.getElementById("post").innerHTML = postContent;
      const commentDiv = document.getElementById("add-comment-div");
      if (!token) commentDiv.style.setProperty("display", "none", "important");
      else commentDiv.style.setProperty("display", "flex", "important");
    })
    .catch((error) => {
      const message = error.response?.data?.message || "Failed to load post";
      showAlert(message, "danger");
    })
    .finally(() => toggleLoader(false));
}

function creatComment() {
  const commentBody = document.getElementById("comment-input").value;
  const token = localStorage.getItem("token");
  const url = `${baseUrl}/posts/${id}/comments`;
  toggleLoader(true);
  axios
    .post(
      url,
      { body: commentBody },
      {
        headers: { authorization: `Bearer ${token}` },
      }
    )
    .then(() => {
      showAlert("The comment has been created successfully", "success");
      getPost();
    })
    .catch((error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to create comment";
      showAlert(errorMessage, "danger");
    })
    .finally(() => toggleLoader(false));
}
