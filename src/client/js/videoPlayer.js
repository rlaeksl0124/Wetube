const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currnenTime = document.getElementById("currnenTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;

// 비디오 재생
const handlePlayClick = (e) => { 
    if(video.paused){ // 비디오가 멈춰있다면 플레이
        video.play();
    } else { // 그렇지않을경우 비디오 멈추기
        video.pause();
    }
    playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
}


// 음소거
const handleMute = (e) => {
    if(video.muted){
        video.muted = false;
    } else {
        video.muted = true;
    }
    muteBtnIcon.classList = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
    volumeRange.value = video.muted ? 0 : volumeValue;
}

// 볼륨조정
const handleVolumeChange = (event) => {
    const { target : { value }} = event // event.target.value;
    if(video.muted){
        video.muted = false;
        muteBtn.innerText = "Mute";
    }
    volumeValue = value;
    video.volume = value;
};

// 비디오 시간 포맷
const formatTime = (seconds) => new Date(seconds * 1000).toISOString().substr(14, 5)


// 비디오 재생시간
const handleLoadedMetadata = () => { // 비디오 총시간
    totalTime.innerText = formatTime(Math.floor(video.duration));
    timeline.max = Math.floor(video.duration); // timeline의 최대값은 비디오의 총시간이다
}

const handleTimeUpdate = () => { // 비디오 현재 재생시간
    currnenTime.innerText = formatTime(Math.floor(video.currentTime));
    timeline.value = Math.floor(video.currentTime); // timeline은 현재 비디오재생시 currentTime에 맞춰서 변한다
}


// 비디오 타임라인 바
const handleTimelineChange = (event) => {
    const { target : { value }} = event // event.target.value;
    video.currentTime = value; // timeline이 변할때 currentTime도 변한다 ( 현재 재생 시간 )
}

// 비디오 풀스크린
const handleFullScreen = () => {
    const fullscreen = document.fullscreenElement;
    if(fullscreen){
        document.exitFullscreen();
        fullScreenIcon.classList = "fas fa-expand";
    }else {
        videoContainer.requestFullscreen();
        fullScreenIcon.classList = "fas fa-compress";
    }
}

const hideControls = () => videoControls.classList.remove("showing");

// 마우스가 비디오안에 위치했을때
const handleMouseMove = () => {
    if(controlsTimeout){ // 밖으로 나간 마우스가 다시 비디오 안으로 들어온다면, ( timeout이 존재한다면 )
        clearTimeout(controlsTimeout); // timeout을 없애줄것
        controlsTimeout = null;
    }
    if(controlsMovementTimeout){ // 오래된 타임아웃을 없애준다
        clearTimeout(controlsMovementTimeout);
        controlsMovementTimeout = null;
    }
    videoControls.classList.add("showing"); // showing 클래스 추가
    controlsMovementTimeout = setTimeout(hideControls, 3000); // 3초뒤에 showing 클래스를 삭제 
}


// 마우스가 비디오밖에 위치했을때, 
const handleMouseLeave = () => {
    controlsTimeout = setTimeout(hideControls, 3000); // 3초뒤에 showing 클래스를 삭제 
}

// 화면을 클릭했을때 동영상 재생
const handleClickPlay = () => {
    if (video.paused){
        video.play();
    } else {
        video.pause();
    }
    playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
}

// 스페이스바 클릭했을때 동영상 재생
const handleKeyclick = (event) => {
    const { key } = event
    if(key === " " && video.paused){  
        video.play();
    } else if(key === " " && video.played){
        video.pause();
    }
    playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
}

console.log(videoContainer.dataset.id)

const handleEnded = () => {
    const { id } = videoContainer.dataset;
    fetch(`/api/videos/${id}/view`, {
        method: "POST"
    }) // fetch = get 요청
}


playBtn.addEventListener("click", handlePlayClick); // 클릭시 재생/정지 이벤트 발생
muteBtn.addEventListener("click", handleMute); // 클릭시 음소거 / 비음소거 이벤트
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadeddata", handleLoadedMetadata); // 비디오가 로드된 시점에 이벤트 발생
video.addEventListener("timeupdate", handleTimeUpdate); // 비디오의 시간이 변할때마다 이벤트 발생
video.addEventListener("ended", handleEnded); // 비디오 재생 완료 여부를 Boolean 값으로 반환합니다.
timeline.addEventListener("input", handleTimelineChange); // 비디오 타임라인 바
fullScreenBtn.addEventListener("click", handleFullScreen); // 비디오 풀스크린 이벤트
videoContainer.addEventListener("mousemove", handleMouseMove); // 마우스가 비디오안에 위치했을때
videoContainer.addEventListener("mouseleave", handleMouseLeave); // 마우스가 비디오밖에 위치했을때 이벤트발생
video.addEventListener("click", handleClickPlay); // 화면을 클릭했을때 동영상 재생/멈춤
document.addEventListener("keydown", handleKeyclick); // 스페이스바 클릭했을때 동영상 재생/멈춤
