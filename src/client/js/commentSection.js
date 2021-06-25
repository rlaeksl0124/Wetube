const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const handleSubmit = (event) => {
    event.preventDefault() // 브라우저가 새로고침하는걸 막는다
    const textarea = form.querySelector("textarea");
    const text = textarea.value; // 댓글의 내용을 text가 받는다
    const videoId = videoContainer.dataset.id;
    if(text === ""){ // 유저가 text를 비어서 댓글등록하면 아무것도 리턴해주지않음
        return
    }
    fetch(`/api/videos/${videoId}/comment`, {
        method: "POST",
        headers: { // express에게 json파일을 보내고 있다고 알려줌, server.js에서 받는다
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
    });
};

if(form){
    form.addEventListener("submit", handleSubmit); // form이 submit을 감지할때 이벤트
}