var b = document.getElementById("wid");
var a = window.matchMedia("(max-width: 900px)");

myFunction(a) ;
a.addListener(myFunction);

function myFunction(a) {
  	if (a.matches) { 
    	b.classList.remove("wid");
	} 
	else {
   		b.classList.add("wid");
  	}
};


