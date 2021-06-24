import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const files = {
    input: "recording.webm",
    output: "output.mp4",
    thumb: "thumbnail.jpg",
}

const downloadFile = (fileUrl, fileName) => {
    const a = document.createElement("a");
    a.href = fileUrl; // mp4 링크생성
    a.download = fileName; // a링크 다운로드, 제목은 MyRecording 확장자는 .mp4
    document.body.appendChild(a);
    a.click();
}

const handleDownload = async() => {

    actionBtn.removeEventListener("click", handleDownload); // 다운로드버튼을 한번더누르면 이벤트삭제
    actionBtn.innerText = "Transcoding..."
    actionBtn.disabled = true;

    const ffmpeg = createFFmpeg({log:true})
    await ffmpeg.load();

    ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));
    // 파일생성, 생성할파일명 : recording.webm, 파일경로는 videoFile (blob 파일이있는 경로)

    await ffmpeg.run("-i", files.input, "-r", "60", files.output); //mp4 파일생성
    // -i: input, 사용할파일명: recording.webm, webm 파일을전환: output.mp4
    // -r 과 60, 초당 60프레임으로 인코딩

    await ffmpeg.run("-i", files.input, "-ss", "00:00:01", "-frames:v", "1", files.thumb); 
    //썸네일 파일생성
    // -ss 와 00:00:01 : 해당 특정시간대로 갈수있게 해준다
    // -frames:v 와 1 : 이동한 시간대의 프레임의 스크린샷 한장
    
    const mp4File = ffmpeg.FS("readFile", files.output); // 생성한 output 파일 읽기
    const thumbFile = ffmpeg.FS("readFile", files.thumb) // 생성한 썸네일 파일 읽기
    
    const mp4Blob = new Blob([mp4File.buffer], {type: "video/mp4"}); // buffer로 mp4파일 blop생성
    const thumbBlob = new Blob([thumbFile.buffer], {type: "image/jpg"}); // buffer로 썸네일 파일 blop 생성

    const mp4Url = URL.createObjectURL(mp4Blob); // mp4 blop으로 url생성
    const thumbUrl = URL.createObjectURL(thumbBlob);

    downloadFile(mp4Url, "MyRecording.mp4");
    downloadFile(thumbUrl, "MyThumbnail.jpg");

    // 파일을 브라우저에 가지고있으면 무거워지기때문에 브라우저 속도가 느려질수있다
    ffmpeg.FS("unlink", files.input); 
    ffmpeg.FS("unlink", files.output);
    ffmpeg.FS("unlink", files.thumb);

    URL.revokeObjectURL(mp4Url);
    URL.revokeObjectURL(thumbUrl);
    URL.revokeObjectURL(videoFile);

    actionBtn.disabled = false;
    actionBtn.innerText = "Record Again..."
    actionBtn.addEventListener("click", handleStart);
};

const handleStop = () => {
    actionBtn.innerText = "Download Recording";
    actionBtn.removeEventListener("click", handleStop);
    actionBtn.addEventListener("click", handleDownload);
    recorder.stop();
};
const handleStart = () => {
    actionBtn.innerText = "Stop Recording";
    actionBtn.removeEventListener("click", handleStart);
    actionBtn.addEventListener("click", handleStop);
    recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    recorder.ondataavailable = (event) => {
        videoFile = URL.createObjectURL(event.data);
        video.srcObject = null;
        video.src = videoFile;
        video.loop = true;
        video.play();
    };
    recorder.start();
};

const init = async () => {
    stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
    });
    video.srcObject = stream;
    video.play();
};

init();
actionBtn.addEventListener("click", handleStart);