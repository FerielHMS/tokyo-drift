let musicPath;

if (window.location.pathname.includes("/content/")) {
    musicPath = "../music/";
} else {
    musicPath = "music/";
}

var PLAYLIST = [
    {
        name: "Imagine Dragons - Natural",
        file: musicPath + "Imagine-Dragons-Natural.mp3"
    },
    {
        name: "Papa Roach - Born For Greatness",
        file: musicPath + "Papa-Roach-Born-For-Greatness.mp3"
    },
    {
        name: "The Score - Legend",
        file: musicPath + "The-Score-Legend.mp3"
    }
];

var musicPlayer = null;
var currentSongIndex = 0;



function initMusicPlayer() {
    musicPlayer = document.getElementById("bgMusic");
    if (!musicPlayer) return;

    var savedState = sessionStorage.getItem("musicState");
    var savedTime = 0;
    var shouldPlay = false;

    if (savedState) {
        var state = JSON.parse(savedState);
        currentSongIndex = state.currentSongIndex || 0;
        savedTime = state.currentTime || 0;
        shouldPlay = state.isPlaying === true;
    }

    loadSong(currentSongIndex);

    musicPlayer.volume = 0.3;

    musicPlayer.addEventListener("loadedmetadata", function () {

        if (savedTime > 0) {
            musicPlayer.currentTime = savedTime;
        }

        if (shouldPlay) {
            musicPlayer.play()
                .then(function () {
                    updatePlayButton();
                })
                .catch(function () {
                    console.log("Autoplay blocked");
                });
        }

    }, { once: true });

    musicPlayer.addEventListener("timeupdate", function () {
        saveMusicState();
    });

    musicPlayer.addEventListener("ended", function () {
        nextSong();
    });

    setupMusicButtons();
    updatePlayButton();
}



function loadSong(index) {
    if (!musicPlayer) return;

    currentSongIndex = (index + PLAYLIST.length) % PLAYLIST.length;

    var song = PLAYLIST[currentSongIndex];
    musicPlayer.src = song.file;
    musicPlayer.load();

    var songDisplay = document.getElementById("currentSong");
    if (songDisplay) songDisplay.textContent = song.name;

    saveMusicState();
}



function saveMusicState() {
    if (!musicPlayer) return;

    var state = {
        currentSongIndex: currentSongIndex,
        isPlaying: !musicPlayer.paused,
        currentTime: musicPlayer.currentTime || 0
    };

    sessionStorage.setItem("musicState", JSON.stringify(state));
}



function toggleMusic() {
    if (!musicPlayer) return;

    if (musicPlayer.paused) {
        musicPlayer.play()
            .then(function () {
                updatePlayButton();
                saveMusicState();
            })
            .catch(function (e) {
                console.log("Play blocked:", e);
                enableMusicOnFirstClick();
            });
    } else {
        musicPlayer.pause();
        updatePlayButton();
        saveMusicState();
    }
}



function updatePlayButton() {
    var playBtn = document.getElementById("musicPlayBtn");
    if (playBtn) {
        playBtn.textContent = musicPlayer && !musicPlayer.paused ? "🔊" : "🔈";
    }
}



function nextSong() {
    if (!musicPlayer) return;

    currentSongIndex = (currentSongIndex + 1) % PLAYLIST.length;
    loadSong(currentSongIndex);

    if (!musicPlayer.paused) {
        musicPlayer.play().catch(function () {
            console.log("Play failed");
        });
    }

    saveMusicState();
}

function previousSong() {
    if (!musicPlayer) return;

    currentSongIndex = (currentSongIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    loadSong(currentSongIndex);

    if (!musicPlayer.paused) {
        musicPlayer.play().catch(function () {
            console.log("Play failed");
        });
    }

    saveMusicState();
}



function enableMusicOnFirstClick() {
    function startMusic() {
        if (musicPlayer && musicPlayer.paused) {
            musicPlayer.play()
                .then(function () {
                    updatePlayButton();
                    saveMusicState();
                })
                .catch(function () {});
        }

        document.removeEventListener("click", startMusic);
        document.removeEventListener("keydown", startMusic);
    }

    document.addEventListener("click", startMusic);
    document.addEventListener("keydown", startMusic);
}



function setupMusicButtons() {
    var prevBtn = document.getElementById("musicPrevBtn");
    var playBtn = document.getElementById("musicPlayBtn");
    var nextBtn = document.getElementById("musicNextBtn");

    if (prevBtn) prevBtn.onclick = previousSong;
    if (playBtn) playBtn.onclick = toggleMusic;
    if (nextBtn) nextBtn.onclick = nextSong;
}



document.addEventListener("DOMContentLoaded", function () {
    initMusicPlayer();
});



function loadCarsFromDB() {
    if (window.db) {
        window.db.getAllItems('cars')
            .then(function (cars) {
                window.carsDatabase = cars;
                console.log("Cars loaded from IndexedDB:", cars.length);

                if (window.renderCars) window.renderCars();
            })
            .catch(function (err) {
                console.error("Error loading cars:", err);
            });
    }
}

window.refreshCarsDatabase = function () {
    loadCarsFromDB();
};

if (window.db) {
    loadCarsFromDB();
} else {
    window.addEventListener('databaseReady', function () {
        loadCarsFromDB();
    });
}
