const baseDir = "library/";
var currentDir = "/";
var currentTrack;
//var playQueue = [];

window.onload = function() {
	loadButton = document.getElementById("loadbutton");
	audio = document.getElementById("audio");
	var volume = document.getElementById("volume");
	volume.addEventListener("change", function () {
		audio.volume = volume.value;
	});
	dirField = document.getElementById("dirfield");
	prevButton = document.querySelector("#controls #prev");
	playButton = document.querySelector("#controls #play");
	nextButton = document.querySelector("#controls #next");
	seekSlider = document.getElementById("seek");
	playButton.addEventListener("click", function() {
		if (!currentTrack) {
			currentTrack = document.querySelector("#entrylist .file");
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

	loadButton.addEventListener("click", function() {
		var dir = "/" + dirField.value;
		loadLibraryDirectory(dir, parseJSON, {"dir": dir});
	});

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
		audio.currentTime = seekSlider.value * (audio.duration ? audio.duration : 0);
		if (audio.wasJustPlaying) {
			audio.play();
			audio.wasJustPlaying = false;
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
	var entryList = document.getElementById("entrylist");
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
