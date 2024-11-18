let faq = document.querySelectorAll(".questionitems");
faq.forEach((fq) => {
  let s = 0;
  fq.addEventListener("click", () => {
    let childs = fq.children;
    if (s == 0) {
      s = 1;
      childs[1].style.display = "block";
    } else if (s == 1) {
      s = 0;
      childs[1].style.display = "none";
    }
  });
});

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
    document.querySelector("#body").style.backgroundColor = "#082F49";
    document.querySelector("#bodymainheading").style.color = "white";
    document.querySelectorAll(".bodysideheading").forEach((ele) => {
      ele.style.color = "white";
    });
    document.querySelector("#bodypara").style.color = "#f9f9f9";
    document.querySelectorAll(".paralists").forEach((ele) => {
      ele.style.color = "#f9f9f9";
    });
    document.querySelectorAll("input").forEach((ele) => {
      ele.style.backgroundColor = "black";
      ele.style.color = "white";
      ele.style.border = "1px solid white";
      ele.classList.add('newstyle');  //be clear here 
    });
    //we cannot directly access the pseudo class here 
    document.querySelectorAll(".pnt").forEach((ele) => {
      ele.style.color = "white";
    });
    document.querySelector("#tail").style.backgroundColor = "#082F49";
    document.querySelector("#tailmainheading").style.color = "white";
    document.querySelectorAll(".questionheading").forEach((ele) => {
      ele.style.color = "white";
    })
    document.querySelectorAll(".disc").forEach((ele) => {
      ele.style.color = "white";
    })
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
    document.querySelector("#body").style.backgroundColor = "#F0F9FF";
    document.querySelector("#bodymainheading").style.color = "black";
    document.querySelectorAll(".bodysideheading").forEach((ele) => {
      ele.style.color = "black";
    });
    document.querySelector("#bodypara").style.color = "black";
    document.querySelectorAll(".paralists").forEach((ele) => {
      ele.style.color = "black";
    });
    document.querySelectorAll("input").forEach((ele) => {
      ele.style.backgroundColor = "white";
      ele.style.color = "black";
      ele.style.border = "1px solid black";
       ele.classList.remove('newstyle');
    });
    //
    document.querySelectorAll(".pnt").forEach((ele) => {
      ele.style.color = "black";
    });
    document.querySelector("#tail").style.backgroundColor = "#F0F9FF";
    document.querySelector("#tailmainheading").style.color = "black";
     document.querySelectorAll(".questionheading").forEach((ele) => {
       ele.style.color = "black";
     });
     document.querySelectorAll(".disc").forEach((ele) => {
       ele.style.color = "black";
     });
  }
});
