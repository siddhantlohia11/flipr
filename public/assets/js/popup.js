
var coll = document.getElementsByClassName("collapsible");
console.log(coll.length);
var i;

for (i = 0; i < coll.length; i++) {
  console.log("andar gaya");
  coll[i].addEventListener("click", function() {
    console.log('Hello');
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
}