let mode = document.querySelector("#modebtn");
let cntmode = "light";
mode.addEventListener("click", () => {
  if (cntmode == "light") {
    cntmode = "dark";
    document.querySelector("body").style.backgroundColor = "black";
      document.querySelector(".mode").src = "assets/sun-moon.svg";
       document.querySelector("#heading").style.color = "white";
       let nav_ele = document.querySelectorAll(".starti");
       for (let i of nav_ele) {
         i.style.color = "white";
       }
       nav_ele.forEach((ele) => {
         ele.addEventListener("mouseover", () => {
           ele.style.transform = "translateY(-5px)";
           ele.style.color = "#0369A1";
           ele.style.transition = "all 0.2s linear 0s";
         });
         ele.addEventListener("mouseout", () => {
           ele.style.transform = "translateY(0px)";
           ele.style.color = "white";
         });
       });
      document.querySelector("form").style.backgroundColor = "#082F41";
      document.querySelectorAll("label").forEach((ele) => {
          ele.style.color = "white";
      })
      document.querySelectorAll("h1").forEach((ele) => {
          ele.style.color = "white";
      })
       document.querySelectorAll("p").forEach((ele) => {
         ele.style.color = "white";
       });

  } else {
    cntmode = "light";
    document.querySelector("body").style.backgroundColor = "white";
      document.querySelector(".mode").src = "assets/moon.svg";
       document.querySelector("#heading").style.color = "black";
       let nav_ele = document.querySelectorAll(".starti");
       for (let i of nav_ele) {
         i.style.color = "black";
       }
       nav_ele.forEach((ele) => {
         ele.addEventListener("mouseover", () => {
           ele.style.transform = "translateY(-5px)";
           ele.style.color = "#0369A1";
           ele.style.transition = "all 0.2s linear 0s";
         });
         ele.addEventListener("mouseout", () => {
           ele.style.transform = "translateY(0px)";
           ele.style.color = "black";
         });
       });
      document.querySelector("form").style.backgroundColor = "white";
document.querySelectorAll("label").forEach((ele) => {
  ele.style.color = "black";
});
       document.querySelectorAll("h1").forEach((ele) => {
         ele.style.color = "black";
       });
       document.querySelectorAll("p").forEach((ele) => {
         ele.style.color = "black";
       });
  }
});
