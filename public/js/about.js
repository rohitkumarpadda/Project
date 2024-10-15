let mode = document.getElementById("modebtn");
let presentmde = "light";
mode.addEventListener("click", () => {
  if (presentmde === "light") {
    presentmde = "dark";
    document.querySelector(".mode").src = "sun-moon.svg";
    // document.querySelector(".modebtn").style.backgroundColor = "black";
    document.querySelector("body").style.backgroundColor = "black";
    document.querySelector(".parentbody").style.backgroundColor = "#082F49";
    document.querySelector("#bodyheading").style.color = "white";
    document.querySelector("#bodypara").style.color = "#f9f9f9";
    document.querySelector("#a1").style.color = "white";
    document.querySelector("#a2").style.color = "white";
    document.querySelector("#a3").style.color = "white";
    document.querySelector("#a4").style.color = "white";
    document.querySelector("#heading").style.color = "white";
    document.querySelector("#oneheading").style.color = "white";
    document.querySelector("#oneparaone").style.color = "#d1d5db";
    document.querySelector("#oneparatwo").style.color = "white";
    document.querySelector("#twoheading").style.color = "white";
    document.querySelector("#listpara1").style.color = "white";
    document.querySelector("#listpara2").style.color = "white";
    document.querySelector("#listpara3").style.color = "white";
    document.querySelector("#listpara4").style.color = "white";
    document.querySelector("#parent3").style.backgroundColor = "#111827";
    document.querySelector("#parent3heading").style.color = "white";
    document.querySelector("#infoheading1").style.color = "white";
    document.querySelector("#infopara1").style.color = "white";
    document.querySelector("#infoheading2").style.color = "white";
    document.querySelector("#infopara2").style.color = "white";
    document.querySelector("#infoheading3").style.color = "white";
    document.querySelector("#infopara3").style.color = "white";
    document.querySelector("#parent4heading").style.color = "white";
    document.querySelector("#parent4para").style.color = "white";
    document.querySelector("#parent4btn1").style.color = "black";
    document.querySelector("#parent4btn2").style.color = "black";
    document.querySelector("#two").style.backgroundColor = "#1f2937";
    let btn = document.querySelectorAll(".starti");
    btn.forEach((button) => {
      button.addEventListener("mouseover", () => {
        button.style.transform = "translateY(-10px)";
        button.style.color = "#0369A1";
        button.style.transition = "all 0.3s linear";
      });
      button.addEventListener("mouseout", () => {
        button.style.transform = "translateY(0px)";
        button.style.color = "white";
      });
    });
  } else {
    presentmde = "light";
    document.querySelector(".mode").src = "moon.svg";
    document.querySelector("body").style.backgroundColor = "white";
    document.querySelector(".parentbody").style.backgroundColor = "#F0F9FF";
    document.querySelector("#bodyheading").style.color = "black";
    document.querySelector("#bodypara").style.color = "#4b5563";
    document.querySelector("#a1").style.color = "black";
    document.querySelector("#a2").style.color = "black";
    document.querySelector("#a3").style.color = "black";
    document.querySelector("#a4").style.color = "black";
    document.querySelector("#heading").style.color = "black";
    document.querySelector("#oneheading").style.color = "black";
    document.querySelector("#oneparaone").style.color = "#4b5563";
    document.querySelector("#oneparatwo").style.color = "#4b5563";
    document.querySelector("#twoheading").style.color = "black";
    document.querySelector("#listpara1").style.color = "black";
    document.querySelector("#listpara2").style.color = "black";
    document.querySelector("#listpara3").style.color = "black";
    document.querySelector("#listpara4").style.color = "black";
    document.querySelector("#parent3").style.backgroundColor = "#f3f4f6";
    document.querySelector("#parent3heading").style.color = "black";
    document.querySelector("#infoheading1").style.color = "black";
    document.querySelector("#infopara1").style.color = "black";
    document.querySelector("#infoheading2").style.color = "black";
    document.querySelector("#infopara2").style.color = "black";
    document.querySelector("#infoheading3").style.color = "black";
    document.querySelector("#infopara3").style.color = "black";
    document.querySelector("#parent4heading").style.color = "black";
    document.querySelector("#parent4para").style.color = "#4b5563";
    document.querySelector("#parent4btn1").style.color = "aliceblue";
    document.querySelector("#parent4btn2").style.color = "aliceblue";
    document.querySelector("#two").style.backgroundColor = "#f3f4f6";
    let btn = document.querySelectorAll(".starti");
    btn.forEach((button) => {
      button.addEventListener("mouseover", () => {
        button.style.transform = "translateY(-10px)";
        button.style.color = "#0369A1";
        button.style.transition = "all 0.3s linear";
      });
      button.addEventListener("mouseout", () => {
        button.style.transform = "translateY(0px)";
        button.style.color = "black";
      });
    });
  }
});
