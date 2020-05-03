var y = document.getElementById("wid");
var z = window.matchMedia("(max-width: 900px)");
myFunction(z) ;
z.addListener(myFunction);

function myFunction(z) {
  if (z.matches) { 
    y.classList.remove("wid");
  } else {
   	y.classList.add("wid");
  }
}

