const baseDir = "library/";
var currentDir = "/";
var currentTrack;
//var playQueue = [];

window.onload = function() {
	audio = document.getElementById("audio");
	var volume = document.getElementById("volume-bar");
	volume.addEventListener("change", function () {
		audio.volume = volume.value;
	});
	dirField = document.getElementById("dirfield");
	prevButton = document.getElementById("prev");
	playButton = document.getElementById("play");
	nextButton = document.getElementById("next");
	seekSlider = document.getElementById("seek");
	playButton.addEventListener("click", function() {
		if (!currentTrack) {
			currentTrack = document.querySelector(".librarylist .file");
			if (currentTrack) {
				setNewTrackAsPlaying(currentTrack);
			}
		} else if (audio.paused) {
			audio.play();
		} else {
			audio.pause();
		}
	});
	prevButton.addEventListener("click", previousTrack);
	nextButton.addEventListener("click", nextTrack);

	audio.addEventListener("ended", nextTrack);

	audio.addEventListener("play", function() {
		playButton.textContent = "Pause";
	});

	audio.addEventListener("pause", function() {
		playButton.textContent = "Play";
	});

	audio.addEventListener("timeupdate", function() {
		seekSlider.value = audio.currentTime / audio.duration;
	});

	seekSlider.addEventListener("mousedown", function() {
		if (!audio.paused) {
			audio.pause();
			audio.wasJustPlaying = true;
		}
	});

	seekSlider.addEventListener("mouseup", function() {
		if (audio.wasJustPlaying) {
			audio.currentTime = seekSlider.value * (audio.duration ? audio.duration : 0);
			audio.play();
			audio.wasJustPlaying = false;
		}
	});

	// Add keyboard shortcuts.
	window.addEventListener('keydown', function(e) {
		console.log("keydown event happened: " + e.keyCode);
		switch (e.keyCode) {
			case 75: // 'k'
				if (audio.paused) {
					audio.play();
				} else {
					audio.pause();
				}
				break;
			case 74: // 'j'
				audio.currentTime -= 10;
				break;
			case 76: // 'l'
				audio.currentTime += 10;
				break;
		}
	});

	// load library on page load
	loadLibraryDirectory("/", parseJSON, {"dir": "/"});
};

function nextTrack() {
	if (currentTrack) {
		setNewTrackAsPlaying(currentTrack.nextElementSibling);
	}
}

function previousTrack() {
	if (currentTrack) {
		setNewTrackAsPlaying(currentTrack.previousElementSibling);
	}
}

function setNewTrackAsPlaying(newTrack) {
	if (currentTrack) {
		currentTrack.classList.remove("playing");
	}
	if (newTrack && newTrack.classList.contains("file")) {
		newTrack.classList.add("playing");
		audio.src = baseDir + currentDir + "/" + newTrack.textContent;
		console.log("Now playing: " + newTrack.textContent);
		currentTrack = newTrack;
		audio.play();
	}
}

function parseJSON(json, callbackArgs) {
	var parsedJSON = JSON.parse(json);
	if (parsedJSON.status !== "OK") {
		alert("Error: " + parsedJSON.error);
		return;
	}
	currentDir = callbackArgs.dir;
	var entryList = document.getElementById("librarylist");
	while (entryList.childElementCount) {
		entryList.removeChild(entryList.firstChild);
	}
	// add parent directory list entry if not at the root directory
	if (currentDir !== "/") {
		var listItem = document.createElement("li");
		listItem.textContent = "..";
		listItem.classList.add("directory");
		entryList.appendChild(listItem);
		listItem.addEventListener("click", function() {
			// open directory
			var dir = currentDir.slice(0, currentDir.lastIndexOf("/"));
			if (dir === "") {
				dir = "/";
			}
			loadLibraryDirectory(dir, parseJSON, {"dir": dir});
		});
	}
	for (var i = 0; i < parsedJSON.directories.length; i++) {
		var listItem = document.createElement("li");
		listItem.textContent = parsedJSON.directories[i];
		listItem.classList.add("directory");
		entryList.appendChild(listItem);
		listItem.addEventListener("click", function() {
			// open directory
			var dir = currentDir + "/" + this.textContent;
			loadLibraryDirectory(dir, parseJSON, {"dir": dir});
		});
	}
	for (var i = 0; i < parsedJSON.files.length; i++) {
		var listItem = document.createElement("li");
		listItem.textContent = parsedJSON.files[i];
		listItem.classList.add("file");
		entryList.appendChild(listItem);
		listItem.addEventListener("click", function() {
			setNewTrackAsPlaying(this);
		});
	}
}

function loadLibraryDirectory(dir, callback, callbackArgs) {
	if (window.XMLHttpRequest) {
		var httpRequest = new XMLHttpRequest();
		httpRequest.onreadystatechange = function() {
			if (httpRequest.readyState === 4 && httpRequest.status === 200) {
				callback(httpRequest.response, callbackArgs);
			}
		};
		httpRequest.open("GET", "cgi-bin/library.py?dir=" + dir, true);
		httpRequest.send(null);
	} else {
		alert("Your browser does not support XMLHttpRequest. (Try Chrome?)");
	}
}
