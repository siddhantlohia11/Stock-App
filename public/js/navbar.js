var hamburger = document.getElementById("hamburger");
var drop = document.getElementById("drop");
var x = document.getElementsByClassName("toNext"); 
var close = document.getElementById("close");
var y = document.getElementsByClassName("next");
var i;

hamburger.addEventListener("click", function(){
	setTimeout(function(){
		for (i = 0; i < x.length; i++) {
			x[i].style.fontSize = "50px";
			x[i].style.display = "block";
		}
		close.style.display = "block";
	}, 200);
	drop.style.zIndex = "100000";
	drop.style.height = "100vh";
	drop.style.transition = "all 0.5s";
});

close.addEventListener("click", function(){
	drop.style.height = "0";
	drop.style.transition = "all 0.5s";
	setTimeout(function(){
	for (i = 0; i < x.length; i++) {
		x[i].style.display = "none";
		x[i].style.display = "none";
	}
	close.style.display = "none";
	},100);
})

hamburger.addEventListener("click", function(){
	setTimeout(function(){
		for (i = 0; i < x.length; i++) {
			y[i].style.fontSize = "20px";
			y[i].style.display = "block";
		}
		close.style.display = "block";
	}, 200);
	drop.style.zIndex = "100000";
	drop.style.height = "100vh";
	drop.style.transition = "all 0.5s";
});

close.addEventListener("click", function(){
	drop.style.height = "0";
	drop.style.transition = "all 0.5s";
	setTimeout(function(){
	for (i = 0; i < x.length; i++) {
		y[i].style.display = "none";
		y[i].style.display = "none";
	}
	close.style.display = "none";
	},100);
})


