class utils {
    static getReference(referenceName) {
        return document.querySelector(referenceName)
    }

    static crateElement(elementName) {
        return document.createElement(elementName)
    }

    static listenEvent(element, event, callback) {
        element.addEventListener(event, callback)
    }
}

let youTubePlayer;


let _currentVideoId = '';
let _currentVideoDurationCalculateInterval;

class iframeRender {
    constructor(videoId) {
        // const element = utils.crateElement('iframe');
        // element.src = `https://www.youtube.com/embed/${videoId}`;
        // element.width = '560';
        // element.height = '315';
        // element.frameborder = '0';
        // element.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
        // element.allowfullscreen = true;
        // utils.getReference('#video-showing-box').appendChild(element)
        _currentVideoId = videoId;
    }

    onPlayerReady(event) {
        console.log('onReady');
        const player = event.target;
        player.loadVideoById(_currentVideoId, 1, 'large');
        player.pauseVideo();
    }

    onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.PLAYING) {
            console.log('playing');
            const currentVideoVolume = Math.round(event.target.getVolume());
            utils.getReference('#volume').value = currentVideoVolume;
        }
    }

    generateYoutubeVideoPlayer() {
        youTubePlayer = new YT.Player('video-showing-box', {
            height: '315',
            width: '560',
            playerVars: {
                'autohide': 0,
                'cc_load_policy': 0,
                'controls': 2,
                'disablekb': 1,
                'iv_load_policy': 3,
                'modestbranding': 1,
                'rel': 0,
                'showinfo': 0,
                'start': 3
            },
            videoId: _currentVideoId,
            events: {
                'onReady': this.onPlayerReady,
                'onStateChange': this.onPlayerStateChange
            }
        });
        youTubePlayer.personalPlayer = {
            'currentTimeSliding': false,
            'errors': []
        };
    };
}

class App {
    constructor(videoId) {
        this._currnetVideoId = videoId;
    }

    init() {
        this.render();
    }

    render() {
        new iframeRender(this._currnetVideoId).generateYoutubeVideoPlayer();
    }
}

function youTubePlayerActive() {
    return youTubePlayer && youTubePlayer.hasOwnProperty('getPlayerState');
}

// get video id from url
let idInput = utils.getReference("#video_id");
//listen to input change
utils.listenEvent(idInput, "keyup", function (e) {
    const currentValue = e.target.value.trim();
    if (currentValue.match(/^[a-zA-Z0-9_-]{11}$/) && currentValue.length <= 11) {
        utils.getReference("#submit").style.display = "block";
    } else {
        utils.getReference("#submit").style.display = "none";
    }
});
// listen to submit button
utils.listenEvent(utils.getReference("#submit"), "click", function (e) {
    e.preventDefault();
    const videoId = idInput.value.trim();
    utils.getReference("#video-showing-box").innerHTML = '';
    new App(videoId).init();
});
//lib added to the project

(function () {
    function init() {
        let tag = document.createElement('script');

        tag.src = 'https://www.youtube.com/iframe_api';

        let first_script_tag = document.getElementsByTagName('script')[0];

        first_script_tag.parentNode.insertBefore(tag, first_script_tag);
    }

    if (window.addEventListener) {
        window.addEventListener('load', init);
    }
}());

function calculateDurationSlider() {

    let current = youTubePlayer.getCurrentTime();
    let duration = youTubePlayer.getDuration();
    let currentPercent = (current && duration ? current * 100 / duration : 0);
    utils.getReference("#duration").value = currentPercent;
}

const eventList = [
    {
        id: "#play",
        event: "click",
        callback: function (e) {
            e.preventDefault();
            youTubePlayer.playVideo();
            _currentVideoDurationCalculateInterval = setInterval(calculateDurationSlider, 1000);
            console.log(youTubePlayer)
        }
    },
    {
        id: "#pause",
        event: "click",
        callback: function (e) {
            e.preventDefault();
            youTubePlayer.pauseVideo();
            clearInterval(_currentVideoDurationCalculateInterval);
        }
    },
    {
        id: "#stop",
        event: "click",
        callback: function (e) {
            e.preventDefault();
            youTubePlayer.stopVideo();
            youTubePlayer.clearVideo();
            clearInterval(_currentVideoDurationCalculateInterval);
        }
    },
    {
        id: "#volume",
        event: "change",
        callback: function (e) {
            e.preventDefault();
            youTubePlayer.setVolume(e.target.value);

        }
    },
    {
        id: "#duration",
        event: "change",
        callback: function (e) {
            e.preventDefault();
            youTubePlayer.seekTo(~~e.target.value * youTubePlayer.getDuration() / 100, true);
        }
    },
    {
        id: "#duration",
        event: "input",
        callback: function (e) {
            e.preventDefault();
            youTubePlayer.personalPlayer.currentTimeSliding = true;
        }
    }
]

eventList.forEach(function (event) {
    utils.listenEvent(utils.getReference(event.id), event.event, event.callback)
})



