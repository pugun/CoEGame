const root = "https://" + window.location.host + "/users/";
function getUri(name) { return root + name; }
let userInfo;
let sendGeoId;

let sendGeo = new Promise(function (resolve, reject) {
	getGeo();
	// sendGeoId = setInterval(getGeo, 7500);

})

getInfo();

get("isLogin", res => {
	if (!res.ok) {
		if (window.location.pathname !== "/login.html" && window.location.pathname !== "/register.html") {
			window.location = "/login.html";
		}
	}
	else {
		sendGeo();
		if (window.location.pathname === "/login.html" || window.location.pathname === "/register.html") {
			window.location = "/profile.html";
		}
	}
})

function get(endPoint, func) {
	try {
		fetch(getUri(endPoint), { method: "GET", credentials: "include" })
			.then(response => {
				func(response);
			})
			.catch(err => {
				console.log(err);
			});
	}
	catch (err) {
		alert(err);
	}
}

function post(form, endPoint, func) {
	try {
		console.log(JSON.stringify(formToObject(form)));
		fetch(getUri(endPoint), PostOptions(formToObject(form)))
			.then(response => {
				func(response);
			})
			.catch(err => {
				console.log(err);
			});
	}
	catch (err) {
		alert(err);
	}
}

function PostOptions(obj) {
	return options = {
		method: "POST",
		body: JSON.stringify(obj),
		headers: { 
			"Content-Type": "application/json"
		},
		credentials: "include"
	};
}

function formToObject(obj) {
	resultObj = new Object();
	for (i = 0; i < obj.length; i++) {
		resultObj[obj[i]["name"]] = obj[i]["value"];
	}
	return resultObj;
}

function getGeo() {
	if (!navigator.geolocation) {
		console.log("Geolocation is not supported by your browser");
		return;
	}

	function success(position) {
		var latitude = position.coords.latitude;
		var longitude = position.coords.longitude;
		var geo = [{ name: 'lat', value: latitude }, { name: 'long', value: longitude }];

		console.log(geo);
		//postGeo
		post(geo, "postGeo", null);
	}

	function error() {
		console.log("Unable to retrieve your location");
	}

	navigator.geolocation.getCurrentPosition(success, error);
}

//confirm box
function challenge(id) {
	var r = confirm("Press a button!");
	if (r == true) {
		// txt = "You pressed OK!";
	} else {
		// txt = "You pressed Cancel!";
	}
}

//getInfo
function getInfo() {
	try{
		get("getUserInfo", res => {
			res.json().then(json => {
				console.log(json);
				userInfo = json;
			})
			
			
		})
	}
	catch(err) {
		alert(err);
	}
}