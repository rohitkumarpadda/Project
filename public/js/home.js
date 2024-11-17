let color1 = "black";
let color2 = "white";
let state = 0; //initial customer
let choice = document.querySelectorAll(".selectuser");
// let colorchange = (color1, color2) => {
//   console.log("hi");
choice.forEach((button) => {
  //annielements vaccahi vachaka prathi element ki event add cheyali
  button.addEventListener("click", () => {
    event.preventDefault(); //as these buttons are present inside a form we need to prevent it from submitting
    let option = button.getAttribute("id");
    if (option == "customer" && state == 1) {
      state = 0;
    choice[0].style.backgroundColor = "#0369A1"; //color1
      choice[0].style.color = "white"; //color2
      choice[1].style.backgroundColor = "white"; //color2
      choice[1].style.color = "#0369A1"; //color1
    } else if (option == "retailer" && state == 0) {
      state = 1;
      choice[1].style.backgroundColor = "#0369A1"; //color1
      choice[1].style.color = "white"; //color2
      choice[0].style.backgroundColor = "white"; //color2
      choice[0].style.color = "#0369A1"; //color1
    }
  });
}); //doubt auto refresh !

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
    document.querySelector("#parent2").style.backgroundColor = "#082F49";
    document.querySelector("#parent2para").style.color = "#f9f9f9";
    document.querySelector("#parent2heading").style.color = "white";
    document.querySelector("#joinheading").style.color = "white";

    document.querySelectorAll(".loginheading").forEach((ele) => {
      ele.style.color = "white";
    })
     document.querySelectorAll(".loginpara").forEach((ele) => {
       ele.style.color = "white";
     });
    document.querySelectorAll(".labelbox1").forEach((ele) => {
      ele.style.color = "white";
    });
     document.querySelectorAll(".labelbox2").forEach((ele) => {
       ele.style.color = "white";
     });
    document.querySelectorAll(".dhaa").forEach((ele) => {
      ele.style.color = "white";
    });
    document.querySelectorAll(".loginbutton").forEach((ele) => {
       ele.addEventListener("mouseover", () => {
         document.querySelectorAll(".loginbutton").forEach((ele1) => {
           ele1.style.borderColor = "white";
         })
       });
    })
     
   document.querySelector(".box1").forEach((ele) => {
     ele.style.backgroundColor = "white";
   });
   document.querySelector(".box2").forEach((ele) => {
     ele.style.backgroundColor = "white";
   });
    document.querySelector(".box1").forEach((ele) => {
      ele.style.color = "white";
    });
    document.querySelector(".box2").forEach((ele) => {
      ele.style.color = "white";
    });
    // let useropt = document.querySelectorAll(".selectuser");
   //i need to consider the states
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

    document.querySelector("#parent2").style.backgroundColor = "#F0F9FF";
    document.querySelector("#parent2para").style.color = "black";
    document.querySelector("#parent2heading").style.color = "black";
    document.querySelector("#joinheading").style.color = "black";

    document.querySelectorAll(".loginheading").forEach((ele) => {
      ele.style.color = "black";
    });
    document.querySelectorAll(".loginpara").forEach((ele) => {
      ele.style.color = "black";
    });
    document.querySelectorAll(".labelbox1").forEach((ele) => {
      ele.style.color = "black";
    });
    document.querySelectorAll(".labelbox2").forEach((ele) => {
      ele.style.color = "black";
    });
    document.querySelectorAll(".dhaa").forEach((ele) => {
      ele.style.color = "black";
    });
    document.querySelectorAll(".loginbutton").forEach((ele) => {
      ele.addEventListener("mouseover", () => {
        document.querySelectorAll(".loginbutton").forEach((ele1) => {
          ele1.style.borderColor = "black";
        });
      });
    });

    document.querySelector(".box1").forEach((ele) => {
      ele.style.backgroundColor = "black";
    });
    document.querySelector(".box2").forEach((ele) => {
      ele.style.backgroundColor = "black";
    });
    document.querySelector(".box1").forEach((ele) => {
      ele.style.color = "black";
    });
    document.querySelector(".box2").forEach((ele) => {
      ele.style.color = "black";
    });
    //i need to consider the states!
  }
});
let btn = document.querySelectorAll(".selectuser");
btn.forEach((ele) => {
  let id = ele.id;
  ele.addEventListener("click", () => {
    if (id == "customer") {
      document.querySelector("#cust").style.display = "block";
      document.querySelector("#ship").style.display = "none";
    } else {
      document.querySelector("#cust").style.display = "none";
      document.querySelector("#ship").style.display = "block";
    }
   })
})