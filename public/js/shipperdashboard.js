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
    document.querySelector("#body").style.backgroundColor = "#082F49";
    document.querySelector("#mainheading").style.color = "white";
    document.querySelectorAll(".contentheading").forEach((ele) => {
      ele.style.color = "white";
    });
    document.querySelector("#userheading").style.color = "white";
    document.querySelectorAll("p").forEach((ele) => {
      ele.style.color = "white";
    });
    document.querySelectorAll(".contentheading").forEach((ele) => {
      ele.style.color = "white";
    });
    document.querySelectorAll(".contents").forEach((ele) => {
      ele.style.backgroundColor = "black";
    });
    document.querySelector("#rating").style.color = "white";
    document.querySelectorAll("h4").forEach((ele) => {
      ele.style.color = "white";
    });
    // let useropt = document.querySelectorAll(".selectuser");
    //i need to consider the states
      document.querySelector("#wholeps").style.backgroundColor = "black";
      document.querySelectorAll("h2").forEach((ele) => {
          ele.style.color = "white";
      })
      document.querySelectorAll("h3").forEach((ele) => {
        ele.style.color = "white";
      });
      document.querySelector("#twocontents").style.backgroundColor = "black";
      document.querySelectorAll(".btnsh").forEach((ele) => {
          ele.style.color = "white";
          ele.style.border = "1px solid white";
          ele.style.backgroundColor="black"
      })
      document.querySelectorAll(".shdiv").forEach((ele) => {
          ele.style.backgroundColor = "black";
          ele.style.border = "2px solid white";
      })
    document.querySelector("#achievements").style.backgroundColor = "black";
    document.querySelector("#bankdetails").style.backgroundColor = "black";
    document.querySelectorAll("label").forEach((ele) => {
      ele.style.color = "white";
    })
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
    document.querySelector("#body").style.backgroundColor = "#f3f4f6";
    document.querySelector("#mainheading").style.color = "black";
    document.querySelectorAll(".contentheading").forEach((ele) => {
      ele.style.color = "black";
    });
    document.querySelector("#userheading").style.color = "black";
    document.querySelectorAll("p").forEach((ele) => {
      ele.style.color = "black";
    });
    document.querySelectorAll(".contentheading").forEach((ele) => {
      ele.style.color = "black";
    });
    document.querySelectorAll(".contents").forEach((ele) => {
      ele.style.backgroundColor = "white";
    });
    document.querySelector("#rating").style.color = "black";
    document.querySelectorAll("h4").forEach((ele) => {
      ele.style.color = "black";
    });
      document.querySelector("#wholeps").style.backgroundColor = "white";
      document.querySelectorAll("h2").forEach((ele) => {
        ele.style.color = "black";
      });
      document.querySelectorAll("h3").forEach((ele) => {
        ele.style.color = "black";
      });
      document.querySelector("#twocontents").style.backgroundColor = "white";
       document.querySelectorAll(".btnsh").forEach((ele) => {
         ele.style.color = "black";
         ele.style.border = "1px solid black";
         ele.style.backgroundColor = "white";
       });
       document.querySelectorAll(".shdiv").forEach((ele) => {
           ele.style.backgroundColor = "white";
           
       });
    document.querySelector("#achievements").style.backgroundColor = "white";
    document.querySelector("#bankdetails").style.backgroundColor = "white";
    document.querySelectorAll("label").forEach((ele) => {
      ele.style.color = "black";
    });
  }
});
