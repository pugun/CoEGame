const root = "http://" + window.location.host + "/users/";
function getUri(name) { return root + name; }

get("isLogin", res => {
	if(!res.ok) {
		if( window.location.pathname !== "/login.html" && window.location.pathname !== "/register.html" ) {
			window.location = "/login.html";
		}
	}
	else {
		if( window.location.pathname === "/login.html" || window.location.pathname === "/register.html" ) {
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