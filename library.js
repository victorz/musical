var currentDir = "/";
var playQueue = [];

window.onload = function() {
	audio = document.getElementById("audio");
	dirButton = document.getElementById("dirbutton");
	dirField = document.getElementById("dirfield");
	fileList = document.getElementById("filelist");
	audio.addEventListener('ended', function() {
		console.log('Playback has ended for song: ' + currentSong.textContent);
		currentSong = currentSong.nextElementSibling;
		this.src = "library/" + currentDir + "/" + currentSong.textContent;
		console.log('Now playing: ' + currentSong.textContent);
		this.play();
	});

	dirButton.addEventListener('click', function() {
		currentDir = "/" + dirField.value;
		while (fileList.childElementCount) {
			fileList.removeChild(fileList.firstChild);
		}
		loadLibraryDirectory(currentDir, function(response) {
			var json = JSON.parse(response);
			for (var i = 0; i < json.length; i++) {
				var listItem = document.createElement("li");
				listItem.textContent = json[i];
				fileList.appendChild(listItem);
				listItem.addEventListener('click', function() {
					audio.src = "library/" + currentDir + "/" + this.textContent;
					currentSong = this;
					audio.play();
				});
			}
		});
	});
};

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
