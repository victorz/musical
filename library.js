window.onload = function() {
	loadLibraryDirectory("../library", function(response) {
		var json = JSON.parse(response);
		var artists = document.getElementById("artists");
		for (var i = 0; i < json.length; i++) {
			var item = document.createElement("li");
			item.innerHTML = json[i];
			artists.appendChild(item);
		}
	});
};

function loadLibraryDirectory(dir, callback) {
	if (window.XMLHttpRequest) {
		var httpRequest = new XMLHttpRequest();
		// FIXME: need to implement what to do with the response.
		httpRequest.onreadystatechange = function() {
			if (httpRequest.readyState === 4 && httpRequest.status === 200) {
				callback(httpRequest.response);
			}
		};
		httpRequest.open("GET", "cgi-bin/library.cgi?dir=" + dir);
		httpRequest.send(null);
	}
}
