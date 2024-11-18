let state = 0;
let btn = document.querySelector(".mode");
btn.addEventListener("click", () => {
  if (state == 0) {
    state = 1;
    document.querySelector("body").style.backgroundColor = "black";
    btn.src = "assets/sun-moon.svg";
    document.querySelector("#heading").style.color = "white";
    let nav_ele = document.querySelectorAll(".starti");
    nav_ele.forEach((ele) => {
      ele.style.color = "white";
      ele.addEventListener("mouseover", () => {
        ele.style.transform = "translateY(-5px)";
        ele.style.color = "#0369A1";
        ele.style.transition = "all 0.3s linear";
      });
      ele.addEventListener("mouseout", () => {
        ele.style.transform = "translateY(0px)";
        ele.style.color = "white";
      });
    });
      document.querySelector("#form").style.backgroundColor = "#082F49";
      document.querySelector("form").style.backgroundColor = "black";
      document.querySelector("#formheading").style.color = "white";
      document.querySelector("#formpara").style.color = "white";
      document.querySelectorAll(".address").forEach((ele) => {
          ele.style.backgroundColor = "black";
          ele.style.color = "white";
          ele.style.border = "2px solid white";
      })
      document.querySelectorAll("label").forEach((ele) => {
          ele.style.color = "white";
      })
      document.querySelectorAll("input").forEach((ele) => {
          ele.style.backgroundColor = "black";
          ele.style.color = "white";
            ele.style.border = "2px solid white";
      });
      document.querySelector("#submitbtn").style.color = "black";
  } else {
    state = 0;
    document.querySelector("body").style.backgroundColor = "white";
    btn.src = "assets/moon.svg";
    document.querySelector("#heading").style.color = "black";
    let nav_ele = document.querySelectorAll(".starti");
    nav_ele.forEach((ele) => {
      ele.style.color = "black";
      ele.addEventListener("mouseover", () => {
        ele.style.transform = "translateY(-5px)";
        ele.style.color = "#0369A1";
        ele.style.transition = "all 0.3s linear";
      });
      ele.addEventListener("mouseout", () => {
        ele.style.transform = "translateY(0px)";
        ele.style.color = "black";
      });
    });
      document.querySelector("#form").style.backgroundColor = "#F0F9FF";
       document.querySelector("form").style.backgroundColor = "white";
       document.querySelector("#formheading").style.color = "black";
       document.querySelector("#formpara").style.color = "black";
       document.querySelectorAll(".address").forEach((ele) => {
         ele.style.backgroundColor = "white";
         ele.style.color = "black";
         ele.style.border = "1px solid #9a9a9b";
       });
       document.querySelectorAll("label").forEach((ele) => {
         ele.style.color = "black";
       });
       document.querySelectorAll("input").forEach((ele) => {
         ele.style.backgroundColor = "white";
         ele.style.color = "black";
         ele.style.border = "2px solid #9a9a9b";
       });
      document.querySelector("#submitbtn").style.color = "white";
  }
});
let comp = 0;
let check = document.querySelector("#check");
check.addEventListener("click", () => {
  if (comp == 0) {
    comp =1;
    check.innerText = "I don't have a company";
    document.querySelectorAll(".companyaddress").forEach((ele) => {
      ele.style.display="block";
    })
  } else {
    comp = 0;
     check.innerText = "I have a company";
      document.querySelectorAll(".companyaddress").forEach((ele) => {
        ele.style.display = "none";
      });
  }
})