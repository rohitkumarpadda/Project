let state = 0; //initial customer
let choice = document.querySelectorAll(".selectuser");
choice.forEach((button) => {
  
  button.addEventListener("click", () => {
    event.preventDefault(); //as these buttons are present inside a form we need to prevent it from submitting
    let option = button.getAttribute("id");
    if (option == "customer" && state == 1) {
      state = 0;
      let dis = document.querySelector("#loginpara");
      let log = document.querySelector("#formlogo");
      dis.innerText = "Hi! there please Sign In to your account";
      log.src = "assets/user.svg";
      choice[0].style.backgroundColor = "black";
      choice[0].style.color = "white";
      choice[1].style.backgroundColor = "white";
      choice[1].style.color = "black";
    } else if (option == "retailer" && state == 0) {
      state = 1;
      let dis = document.querySelector("#loginpara");
      dis.innerText = "Hello! Shipper please Sign In to your account";
      let log = document.querySelector("#formlogo");
      log.src = "assets/package-2.svg";
      choice[1].style.backgroundColor = "black";
      choice[1].style.color = "white";
      choice[0].style.backgroundColor = "white";
      choice[0].style.color = "black";
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
    document.querySelector("#loginheading").style.color = "white";
    document.querySelector("#loginpara").style.color = "#f9f9f9";
    document.querySelector("#labelbox1").style.color = "white";
    document.querySelector("#labelbox2").style.color = "white";
    document.querySelector("#dhaa").style.color = "white";
    document.querySelector("#loginbutton").addEventListener("mouseover", () => {
      document.querySelector("#loginbutton").style.borderColor = "white";
    });
    document.querySelector("#box1").style.backgroundColor = "black";
    document.querySelector("#box2").style.backgroundColor = "black";
    document.querySelector("#box1").style.color = "white";
    document.querySelector("#box2").style.color = "white";
    // choice.forEach((button) => {
    //   if (button.style.backgroundColor == "black") {
    //     button.style.backgroundColor = "white";
    //     button.style.color = "black";
    //   } else {
    //     button.style.backgroundColor = "black";
    //     button.style.color = "white";
    //   }
    // });
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
    document.querySelector("#loginheading").style.color = "black";
    document.querySelector("#loginpara").style.color = "black";
    document.querySelector("#labelbox1").style.color = "black";
    document.querySelector("#labelbox2").style.color = "black";
    document.querySelector("#dhaa").style.color = "black";
    document.querySelector("#box1").style.backgroundColor = "white";
    document.querySelector("#box2").style.backgroundColor = "white";
    document.querySelector("#box1").style.color = "black";
    document.querySelector("#box2").style.color = "black";
  }
});
