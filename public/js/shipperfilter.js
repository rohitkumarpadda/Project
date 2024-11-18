function updateSlider(slider) {
	const sliderValue = document.getElementById('sliderValue');
	sliderValue.textContent = `${slider.value} kg`;

	// Update the slider's background
	const min = slider.min;
	const max = slider.max;
	const percentage = ((slider.value - min) / (max - min)) * 100;

	slider.style.background = `linear-gradient(to right, #555 ${percentage}%, #ddd ${percentage}%)`;
}
let mode = document.querySelector('#modebtn');
let state = 1;
mode.addEventListener('click', () => {
	if (state == 1) {
		state = 0;
		document.querySelector('body').style.backgroundColor = 'black';
		document.querySelector('.mode').src = 'assets/sun-moon.svg';
		document.querySelector('#heading').style.color = 'white';
		let nav_ele = document.querySelectorAll('.starti');
		for (let i of nav_ele) {
			i.style.color = 'white';
		}
		nav_ele.forEach((ele) => {
			ele.addEventListener('mouseover', () => {
				ele.style.transform = 'translateY(-5px)';
				ele.style.color = '#0369A1';
				ele.style.transition = 'all 0.2s linear 0s';
			});
			ele.addEventListener('mouseout', () => {
				ele.style.transform = 'translateY(0px)';
				ele.style.color = 'white';
			});
		});
		document.querySelector('#body').style.backgroundColor = '#082F49';
		document.querySelectorAll('label').forEach((ele) => {
			ele.style.color = 'white';
		});
		document.querySelectorAll('h3').forEach((ele) => {
			ele.style.color = 'white';
		});
		document.querySelectorAll('p').forEach((ele) => {
			ele.style.color = 'white';
		});
		document.querySelectorAll('strong').forEach((ele) => {
			ele.style.color = 'white';
		});
		document.querySelectorAll('.shipment-card').forEach((ele) => {
			ele.style.background = 'black';
		});
		document.querySelector('#sliderValue').style.color = 'white';
		document.querySelector('#weightRange').style.background =
			' background: linear-gradient(to right, black 50%, #ddd 50%);';
	} else {
		state = 1;
		document.querySelector('body').style.backgroundColor = 'white';
		document.querySelector('.mode').src = 'assets/moon.svg';
		document.querySelector('#heading').style.color = 'black';
		let nav_ele = document.querySelectorAll('.starti');
		for (let i of nav_ele) {
			i.style.color = 'black';
		}
		nav_ele.forEach((ele) => {
			ele.addEventListener('mouseover', () => {
				ele.style.transform = 'translateY(-5px)';
				ele.style.color = '#0369A1';
				ele.style.transition = 'all 0.2s linear 0s';
			});
			ele.addEventListener('mouseout', () => {
				ele.style.transform = 'translateY(0px)';
				ele.style.color = 'black';
			});
		});
		document.querySelector('#body').style.backgroundColor = '#f3f4f6';
		document.querySelectorAll('label').forEach((ele) => {
			ele.style.color = 'black';
		});
		document.querySelectorAll('h3').forEach((ele) => {
			ele.style.color = 'black';
		});
		document.querySelectorAll('p').forEach((ele) => {
			ele.style.color = 'black';
		});
		document.querySelectorAll('strong').forEach((ele) => {
			ele.style.color = 'black';
		});
		document.querySelectorAll('.shipment-card').forEach((ele) => {
			ele.style.background = 'rgb(226,226,226)';
		});
		document.querySelector('#sliderValue').style.color = 'black';
		document.querySelector('#weightRange').style.background =
			' background: linear-gradient(to right, #555 50%, #ddd 50%);';
	}
});
