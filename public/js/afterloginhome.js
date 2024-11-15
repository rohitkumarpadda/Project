let click = 0;
let mode = document.querySelector("#newmodebtn");
mode.addEventListener("click", () => {
    if (click == 0) {
        click = 1;
      document.querySelector("#newdiv").style.display = "block";
      document.querySelector("#imgprofile").src = "circle-x.svg";
    } else {
        click = 0;
        document.querySelector("#newdiv").style.display = "none";
        document.querySelector("#imgprofile").src = "user - Copy.svg";
      mode.style.backgroundColor = "white";
       mode.addEventListener("mouseout", () => {
         ele.style.backgroundColor = "#f3f4f6";
       });
      mode.addEventListener("mouseout", () => {
        ele.style.backgroundColor = "white";
      })
    }
})
let state = 0;
let mode1 = document.querySelector("#modebtn");
mode1.addEventListener("click", () => {
  if (state == 0) {
    event.preventDefault();
    document.querySelector("#modebtn1").src = "sun-moon.svg";
        state = 1;
        document.querySelector("body").style.backgroundColor = "black";
        document.querySelector("#heading").style.color = "white";
        document.querySelectorAll(".starti").forEach((ele) => {
            ele.style.color = "white";
            ele.addEventListener("mouseover", () => {
                ele.style.transform = "translateY(-5px)";
                ele.style.transition = "all 0.3s linear";
                ele.style.color = "#0369A1";
            })
            ele.addEventListener("mouseout", () => {
                 ele.style.transform = "translateY(0px)";
                 ele.style.transition = "all 0.3s linear";
                ele.style.color = "white";
            })
        })
        document.querySelector("#parent2").style.backgroundColor = "#082F49";
        document.querySelector("#parent2para").style.color = "#f9f9f9";
        document.querySelector("#parent2heading").style.color = "white";
        document.querySelector("#parent3").style.backgroundColor = "#111827";
        document.querySelector("#parent3mainheading").style.color = "white";
        document.querySelectorAll(".parent3btn").forEach((ele) => {
            ele.style.backgroundColor = "grey";
            ele.style.color = "white";
            ele.style.border = "1px solid grey";
        })
        document.querySelectorAll(".shippment").forEach((ele) => {
            ele.style.backgroundColor = "black";

        })
        document.querySelectorAll(".shippmentheading").forEach((ele) => {
            ele.style.color = "white";
        })
        document.querySelectorAll(".shippmentdicrip").forEach((ele) => {
            ele.style.color = "white";
        })
      document.querySelector("#formheading").style.color = "white";
      document.querySelectorAll("label").forEach((ele) => {
        ele.style.color = "white";
      })
      document.querySelectorAll("input").forEach((ele) => {
        ele.style.backgroundColor = "black";
        ele.style.color = "white";
      })
      document.querySelector("#caution").style.backgroundColor = "#3F1D0D";
    document.querySelector("#caution").style.color = "#F5D383";
    // document.querySelector("#forming").src = "camera (1).svg"; //doubt
    document.querySelector("#body").style.backgroundColor = "black";
    document.querySelectorAll(".contents").forEach((ele) => {
      ele.style.color = "white";
    })
    document.querySelector("#profilephoto").style.backgroundColor = "white";
    document.querySelector("#bodyheading").style.color = "white";
    document.querySelectorAll(".addressheading").forEach((ele) => {
      ele.style.color = "white";
    });
    } else {
       event.preventDefault();
    state = 0;
      document.querySelector("#modebtn1").src = "moon.svg";
     mode1.src = "moon.svg";
        document.querySelector("body").style.backgroundColor = "white";
        document.querySelector("#heading").style.color = "black";
         document.querySelectorAll(".starti").forEach((ele) => {
           ele.style.color = "black";
           ele.addEventListener("mouseover", () => {
             ele.style.transform = "translateY(-5px)";
             ele.style.transition = "all 0.3s linear";
             ele.style.color = "#0369A1";
           });
           ele.addEventListener("mouseout", () => {
             ele.style.transform = "translateY(0px)";
             ele.style.transition = "all 0.3s linear";
             ele.style.color = "black";
           });
         });
         document.querySelector("#parent2").style.backgroundColor = "#F0F9FF";
         document.querySelector("#parent2para").style.color = "black";
        document.querySelector("#parent2heading").style.color = "black";
        document.querySelector("#parent3").style.backgroundColor = "#f4f3f3";
        document.querySelector("#parent3mainheading").style.color = "black";
         document.querySelectorAll(".parent3btn").forEach((ele) => {
           ele.style.backgroundColor = "white";
             ele.style.color = "black";
         });
        document.querySelectorAll(".shippment").forEach((ele) => {
          ele.style.backgroundColor = "white";
        });
         document.querySelectorAll(".shippmentheading").forEach((ele) => {
           ele.style.color = "black";
         });
           document.querySelectorAll(".shippmentdicrip").forEach((ele) => {
             ele.style.color = "black";
           });
      document.querySelector("#formheading").style.color = "black";
       document.querySelectorAll("label").forEach((ele) => {
         ele.style.color = "black";
       });
       document.querySelectorAll("input").forEach((ele) => {
         ele.style.backgroundColor = "white";
         ele.style.color = "black";
       });
      document.querySelector("#caution").style.backgroundColor = "#FFF9E5";
    document.querySelector("#caution").style.color = "black";
    //  document.querySelector("#forming").src = "camera.svg"; //doubt
    document.querySelector("#body").style.backgroundColor = "white";
     document.querySelectorAll(".contents").forEach((ele) => {
       ele.style.color = "black";
     });
    document.querySelector("#bodyheading").style.color = "black";
     document.querySelectorAll(".addressheading").forEach((ele) => {
       ele.style.color = "black";
     });
    }
})
