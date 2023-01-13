class utils {
    static getReference(element) {
        return document.querySelector(element);
    }

    static listenEvent(element, event, callback) {
        this.getReference(element).addEventListener(event, callback);
    }

    static changeIconClassName(icon, classNameFirst, classNameSecond) {
        if (icon.classList.contains(classNameFirst)) {
            icon.classList.remove(classNameFirst);
            icon.classList.add(classNameSecond);
            return true;
        } else {
            icon.classList.remove(classNameSecond);
            icon.classList.add(classNameFirst);
            return false;
        }
    }

    static changePlayerStateIcon() {
        const ref1 = this.getReference("#video-controller-wrapper-status-button");
        const ref2 = this.getReference("#video-status-button");
        [ref1.children[0], ref2.children[0]].forEach((el) => {
            this.changeIconClassName(el, "fa-play", "fa-pause");
        })
    }

    static regexTest(regex, string) {
        return regex.test(string);
    }

    static getCurrentVolumeOfIcon(volume) {
        volume = ~~volume
        let name = "";
        if (volume === 0) {
            name = "fas fa-volume-mute";
        } else if (volume > 0 && volume <= 50) {
            name = "fa-solid fa-volume-low";
        } else if (volume > 50 && volume <= 100) {
            name = "fa-solid fa-volume-high";
        }
        return name;
    }

}

class VideoState {
    static videoId = "";
    static videoPlayer = null;
    static player = null;
    static isVideoPlaying = false;
    static isMuted = false;
    static currentVolume = 50;
    static currentVideoDurationSliderUpdateInterval = null;
    static currentVideoDuration = 0;
}

class VimeoVideoPlayer {
    constructor() {
    }

}


let _currentVideoId = "";

class YoutubeVideoPlayer {
    constructor(videoId) {
        _currentVideoId = videoId;
    }

    onPlayerReady(event) {
        console.log('onReady');
        const player = event.target;
        player.loadVideoById(_currentVideoId, 1, 'large');
        player.pauseVideo();
        player.setVolume(VideoState.currentVolume);
    }

    onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.PLAYING) {
            console.log('playing');
            const currentVideoVolume = Math.round(event.target.getVolume());
            utils.getReference('#volume-range').value = currentVideoVolume;
        }
    }

    generateYoutubeVideoPlayer() {
        VideoState.videoPlayer = new YT.Player('video-showing-box', {
            height: '315',
            width: '560',
            playerVars: {
                'autohide': 0,
                'cc_load_policy': 0,
                'controls': 0,
                'disablekb': 0,
                'iv_load_policy': 3,
                'modestbranding': 0,
                'rel': 0,
                'showinfo': 0,
                'start': 0,
                'playsinline': 0,
                'autoplay': 0,
                'mute': 0,
                'loop': 0,
                'fs': 0,
                "end": 0,
            },
            videoId: _currentVideoId,
            events: {
                'onReady': this.onPlayerReady,
                'onStateChange': this.onPlayerStateChange
            }
        });
        VideoState.videoPlayer.personalPlayer = {
            'currentTimeSliding': false,
            'errors': []
        };
    };
}

class VideoController {
    static youTubePlayerActive() {
        return VideoState.player && VideoState.player.hasOwnProperty('getPlayerState');
    }

    static updateVideoCurrentTime() {
        let current = VideoState.videoPlayer.getCurrentTime();
        let duration = VideoState.videoPlayer.getDuration();
        let currentPercent = (current && duration ? current * 100 / duration : 0);
        utils.getReference("#duration-range").value = currentPercent;
    }

    static changeVideoCurrentTime(time) {
        VideoState.videoPlayer.seekTo(time, true);
    }

    static playVideo() {
        VideoState.videoPlayer.playVideo();
        VideoState.currentVideoDurationSliderUpdateInterval = setInterval(() => {
            this.updateVideoCurrentTime();
        }, 1000);
    }

    static pauseVideo() {
        VideoState.videoPlayer.pauseVideo();
        clearInterval(VideoState.currentVideoDurationSliderUpdateInterval);
    }

    static muteVideo() {
        VideoState.videoPlayer.mute();
    }

    static unMuteVideo() {
        VideoState.videoPlayer.unMute();
    }

    static changeVideoVolume(volume) {
        VideoState.videoPlayer.setVolume(volume);
    }

    static changeVideoPlayState() {
        if (VideoState.isVideoPlaying) {
            VideoController.pauseVideo();
        } else {
            VideoController.playVideo();
        }
        VideoState.isVideoPlaying = !VideoState.isVideoPlaying;
    }
}

(() => {
    function init() {
        let tag = document.createElement('script');

        tag.src = 'https://www.youtube.com/iframe_api';

        let first_script_tag = document.getElementsByTagName('script')[0];

        first_script_tag.parentNode.insertBefore(tag, first_script_tag);
        utils.getReference("#volume-range").value = VideoState.currentVolume;
        utils.getReference("#video-status-mute").lastElementChild.className = utils.getCurrentVolumeOfIcon(VideoState.currentVolume);

    }

    if (window.addEventListener) {
        window.addEventListener('load', init);
    }
})()

const eventList = [
    {
        id: "#video-status-button",
        event: "click",
        callback: function () {
            VideoState.isMuted = !VideoState.isMuted;
            utils.changePlayerStateIcon();
            VideoController.changeVideoPlayState();
        }
    },
    {
        id: "#video-status-mute",
        event: "click",
        callback: function (e) {
            const state = !VideoState.isMuted;
            VideoState.isMuted = state;
            let volume = 0;
            if (state) {
                volume = 0;
                if (VideoState.currentVolume === 0) {
                    volume = 50;
                    VideoController.changeVideoVolume(50);
                }
            } else {
                if (VideoState.currentVolume !== 0) {
                    volume = VideoState.currentVolume;
                    VideoController.changeVideoVolume(volume);
                }
            }
            if (VideoState.isMuted) {
                VideoController.muteVideo();
            } else {
                VideoController.unMuteVideo();
            }
            console.log("volume", volume);
            const volumeSlider = e.target.nextElementSibling.children[0];
            const icon = e.target.lastElementChild;
            icon.className = utils.getCurrentVolumeOfIcon(volume);
            volumeSlider.value = volume;
        }
    },
    {
        id: "#video-expand-button",
        event: "click",
        callback: function (e) {
            const icon = e.target.lastElementChild;
            const bool = utils.changeIconClassName(icon, "fa-expand", "fa-compress");
            const videoBox = utils.getReference("#video-showing-box");
            const controllerBox = utils.getReference(".controller-video-box");
            const controllerBoxListChild = utils.getReference(".controller-video-box ul");
            if (bool) {
                videoBox.style.width = "100vw";
                videoBox.style.height = "100vh";
                videoBox.style.position = "absolute";
                videoBox.parentElement.parentElement.style.height = "100vh";
                videoBox.parentElement.parentElement.style.width = "100vw";
                controllerBox.style.width = "100vw";
                controllerBoxListChild.style.width = "95vw";
                controllerBoxListChild.style.margin = "0 auto";
            } else {
                videoBox.style.width = "560px";
                videoBox.style.height = "315px";
                videoBox.style.position = "relative";
                videoBox.parentElement.parentElement.style.removeProperty("height");
                videoBox.parentElement.parentElement.style.removeProperty("width");
                controllerBox.style.width = "560px";
                controllerBoxListChild.style.width = "100%";
            }
        }
    },
    {
        id: "#volume-range",
        event: "change",
        callback: function (e) {
            const value = e.target.value;
            const icon = e.target.parentElement.previousElementSibling.children[0];
            VideoState.currentVolume = value * 1;
            icon.className = utils.getCurrentVolumeOfIcon(value);
            VideoController.changeVideoVolume(value);
        }
    },
    {
        id: "#duration-range",
        event: "change",
        callback: function (e) {
            console.log(e.target.value)
            VideoController.changeVideoCurrentTime(~~e.target.value * VideoState.videoPlayer.getDuration() / 100, true);
        }
    },
    {
        id: "#video-watch-section-back-button",
        event: "click",
        callback: function (e) {
            window.scrollTo({top: 0, behavior: 'smooth'});
            VideoState.videoPlayer.destroy();
        }
    },
    {
        id: "#video-controller-wrapper-status-button",
        event: "click",
        callback: function () {
            utils.changePlayerStateIcon();
            VideoController.changeVideoPlayState();
        }
    },
    {
        id: "#card-footer-button",
        event: "click",
        callback: function (e) {
            if (!e.target.classList.contains("disable-btn")) {
                const ref = utils.getReference("#video-watch-section")
                ref.scrollIntoView({behavior: 'smooth'});
                new YoutubeVideoPlayer(VideoState.videoId).generateYoutubeVideoPlayer();
                utils.getReference("#duration-range").value = 0;
            }
        }
    },
    {
        id: "#video-url",
        event: "input",
        callback: function (e) {
            console.log(e.target.value)
            const rex = /https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9-]{11}$/;
            const url = e.target.value;
            // if (utils.regexTest(rex, url)) {
            if (url.length > 0) {
                console.log("valid")
                const videoId = url.match(rex);
                console.log(videoId)
                VideoState.videoId = url.split("=")[1];
                const btn = e.target.parentElement.nextElementSibling.children[0];
                btn.classList.remove("disable-btn");
            } else {
                console.log("invalid")
                const btn = e.target.parentElement.nextElementSibling.children[0];
                btn.classList.add("disable-btn");
            }
        }
    }
]

eventList.forEach((event) => {
    utils.listenEvent(event.id, event.event, event.callback)
})
