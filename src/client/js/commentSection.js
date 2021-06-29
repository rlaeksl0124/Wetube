const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteBtn = document.querySelectorAll("#delBtn")

const handleDelBtn = async(event) => {
    event.preventDefault();
    const li = event.target.parentElement;
    const commentId = li.dataset.id
    const videoId = videoContainer.dataset.id;
    const response = await fetch(`/api/videos/${videoId}/comments/${commentId}`, {
        method: "DELETE",
    })
    if(response.status===200){
        li.remove();
    }
}

const addComment = (text, id) => {
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    newComment.dataset.id = id;
    newComment.className = "video__comment";
    const icon = document.createElement("i");
    icon.className = "fas fa-comment";
    const span = document.createElement("span");
    span.innerText = ` ${text}`;
    const delBtn = document.createElement("span");
    delBtn.innerText = "❌";
    delBtn.className = "delBtn"
    newComment.appendChild(icon); // li 안에 icon을 추가
    newComment.appendChild(span);
    newComment.appendChild(delBtn);
    videoComments.prepend(newComment); // 맨위에 댓글이 추가됨
    delBtn.addEventListener("click", handleDelBtn);
}

const handleSubmit = async(event) => {
    event.preventDefault(); // 브라우저가 새로고침하는걸 막는다
    const textarea = form.querySelector("textarea");
    const text = textarea.value; // 댓글의 내용을 text가 받는다
    const videoId = videoContainer.dataset.id;
    if(text === ""){ // 유저가 text를 비어서 댓글등록하면 아무것도 리턴해주지않음
        return
    }
    const response = await fetch(`/api/videos/${videoId}/comment`, {
        method: "POST",
        headers: { // express에게 json파일을 보내고 있다고 알려줌, server.js에서 받는다
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
    });
    if(response.status===201){
        textarea.value = "";
        const {newCommentId} = await response.json();
        addComment(text, newCommentId);
    }
};

if(form){
    form.addEventListener("submit", handleSubmit); // form이 submit을 감지할때 이벤트
}

for(const btn of deleteBtn){
    btn.addEventListener("click", handleDelBtn);
}