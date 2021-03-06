
const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

let peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
});


let myVideoStream;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {

    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
    });

    let text = $('input');

    $('html').keydown(e => {
        if (e.which === 13 && text.val().length !== 0) {
            socket.emit('message', text.val());
            text.val('');
        }
    });

    socket.on('createMessage', message => {
        $('ul').append(`<li class="message"><b>User</b></br>${message}</li>`);
        scrollToBottom();
    });

});

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});


const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream)
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
}


const addVideoStream = (video, stream) => {

    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
};

const scrollToBottom = () => {
    let d = $('.main__chat__window');
    d.scrollTop(d.prop('scrollHeight'));
}


const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
        <i class="fa fa-microphone"></i>
        <span>Mute</span>
    `;

    document.querySelector('.main__mute__button').innerHTML = html;
};

const setUnmuteButton = () => {
    const html = `
        <i class="unmute fa fa-microphone-slash"></i>
        <span>Unmute</span>
    `;

    document.querySelector('.main__mute__button').innerHTML = html;
}


const playStop = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setPlayVideo = () => {

    const html = `
    <i class="fa fa-play"></i>
    <span>Play Video</span>
`;

    document.querySelector('.main__video__button').innerHTML = html;

}

const setStopVideo = () => {

    const html = `
    <i class="fa fa-video-camera"></i>
    <span>Stop Video</span>
`;

    document.querySelector('.main__video__button').innerHTML = html;
}


document.addEventListener('mousemove', function (e) {

    mouseY = e.clientY || e.pageY;
    if (mouseY < 56 && mouseY > 0) {
        $('.main__controls__top').css({ display: 'flex' });
    } else {
        $('.main__controls__top').css({ display: 'none' });
    }
}, false);

shareScreen = async() => {
    const video = document.createElement('video');
    captureStream = await navigator.mediaDevices.getDisplayMedia();
    addVideoStream(video, captureStream)
}