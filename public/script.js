var modal = document.querySelectorAll("#guitarModal");
var queryModal = document.querySelector("#queryModal");
var guitars = document.querySelectorAll(".post");
var queries = document.querySelectorAll(".queries");
var getUsers = document.getElementById("getAllUsers");
var getCollections = document.getElementById("getAllCollections");
var getBass = document.getElementById("getBass");
var mapReduce = document.getElementById("mapReduce");
var currentIndex;

if (getUsers != null){
	var modalList = document.getElementById("modal-list");
	mapReduce.onclick = function(){
		modalList.innerHTML = "";
		queryModal.style.display = "block";
		$.get("/map-reduce", function(data, status){
			console.log(data);
			data.results.forEach(function(results){
				var header = document.createElement("h3");
				header.innerHTML = "Average number of bass strings for " + results._id + ": " + results.value;
				modalList.appendChild(header);
			});
		});
	}
	getUsers.onclick = function(){
		modalList.innerHTML = "";
		queryModal.style.display = "block";
		$.get("/userquery", function(data, status){
			data.forEach(function(user){
				let li = document.createElement("li");
				modalList.appendChild(li);
				li.innerHTML += user.username;
			});
		});
	}
	getBass.onclick = function(){
		modalList.innerHTML = "";
		queryModal.style.display = "block";
		$.get("/aggregate", function(data, status){
			data.forEach(function(brand){
				var header = document.createElement("h3");
				header.innerHTML = "Average number of bass strings for " + brand._id + ": " + brand.average;
				modalList.appendChild(header);
			});
			
			
		});
	}
	getCollections.onclick = function(){
		modalList.innerHTML = "";
		queryModal.style.display = "block";
		$.get("/usercollections", function(data, status){
			data.forEach(function(collection){
				var header = document.createElement("h3");
				header.innerHTML += collection.guitarCollection[0].owner + ": ";
				modalList.appendChild(header);
				collection.guitarCollection.forEach(function(element){
					var listItem = document.createElement("li");
					listItem.innerHTML += element.brand;
					modalList.appendChild(listItem);
					listItem = document.createElement("li");
					listItem.innerHTML += element.model;
					modalList.appendChild(listItem);
					listItem = document.createElement("li");
					listItem.innerHTML += element.series;
					modalList.appendChild(listItem);
					listItem = document.createElement("li");
					listItem.innerHTML += element.color;
					modalList.appendChild(listItem);
					listItem = document.createElement("li");
					listItem.innerHTML += element.type;
					modalList.appendChild(listItem);
					listItem = document.createElement("hr");
					modalList.appendChild(listItem);
				});
				
			});
		});
	}
}


guitars.forEach(function(guitar, index){
	guitar.onclick = function() {
		modal[index].style.display = "block";
		currentIndex = index;
	}
});



window.onclick = function(event) {
	if (event.target == modal[currentIndex]){
		modal[currentIndex].style.display = "none";
	}
	if (event.target == queryModal){
		queryModal.style.display = "none";
	}

}

