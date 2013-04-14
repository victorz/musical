var currentDir = "/";
var playQueue = [];

window.onload = function() {

	button = document.getElementById('dirbutton');
	audio = document.getElementById('audio');
	dirField = document.getElementById('dirfield');
	audio.addEventListener('ended', function() {
		currentSong = currentSong.nextElementSibling;
		this.src = "library/" + currentDir + "/" + currentSong.textContent;
		console.log('Now playing: ' + currentSong.textContent);
		this.play();
	});

	button.addEventListener('click', function() {
		currentDir = "/" + dirField.value;
		loadLibraryDirectory(currentDir, parseJSON);
	});
};

function parseJSON(json) {
	var dirList = document.getElementById('dirlist');
	var fileList = document.getElementById('filelist');
	while (dirList.childElementCount) {
		dirList.removeChild(dirList.firstChild);
	}
	while (fileList.childElementCount) {
		fileList.removeChild(fileList.firstChild);
	}
	var parsedJSON = JSON.parse(json);
	if (currentDir !== "/") {
		var listItem = document.createElement("li");
		listItem.textContent = "..";
		dirList.appendChild(listItem);
		listItem.addEventListener('click', function() {
			// open directory
			//currentDir = currentDir + this.textContent;
			currentDir = currentDir.slice(0, currentDir.lastIndexOf('/'));
			if (currentDir === "") {
				currentDir = "/";
			}
			loadLibraryDirectory(currentDir, parseJSON);
		});
	}
	// add parent directory list entry
	for (var i = 0; i < parsedJSON.directories.length; i++) {
		var listItem = document.createElement("li");
		listItem.textContent = parsedJSON.directories[i];
		dirList.appendChild(listItem);
		listItem.addEventListener('click', function() {
			// open directory
			currentDir = currentDir + "/" + this.textContent;
			loadLibraryDirectory(currentDir, parseJSON);
		});
	}
	for (var i = 0; i < parsedJSON.files.length; i++) {
		var listItem = document.createElement("li");
		listItem.textContent = parsedJSON.files[i];
		fileList.appendChild(listItem);
		listItem.addEventListener('click', function() {
			// play track
			audio.src = "library/" + currentDir + "/" + this.textContent;
			currentSong = this;
			audio.play();
		});
	}
}

function loadLibraryDirectory(dir, callback) {
	if (window.XMLHttpRequest) {
		var httpRequest = new XMLHttpRequest();
		httpRequest.onreadystatechange = function() {
			if (httpRequest.readyState === 4 && httpRequest.status === 200) {
				callback(httpRequest.response);
			}
		};
		httpRequest.open("GET", "cgi-bin/library.py?dir=" + dir, true);
		httpRequest.send(null);
	} else {
		alert("Your browser does not support XMLHttpRequest. (Try Chrome?)");
	}
}
