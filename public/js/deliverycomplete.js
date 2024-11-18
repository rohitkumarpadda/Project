let state = 0;
let btn = document.querySelector('.mode');
btn.addEventListener('click', () => {
	if (state == 0) {
		state = 1;
		document.querySelector('body').style.backgroundColor = 'black';
		btn.src = 'assets/sun-moon.svg';
		document.querySelector('#heading').style.color = 'white';
		let nav_ele = document.querySelectorAll('.starti');
		nav_ele.forEach((ele) => {
			ele.style.color = 'white';
			ele.addEventListener('mouseover', () => {
				ele.style.transform = 'translateY(-5px)';
				ele.style.color = '#0369A1';
				ele.style.transition = 'all 0.3s linear';
			});
			ele.addEventListener('mouseout', () => {
				ele.style.transform = 'translateY(0px)';
				ele.style.color = 'white';
			});
		});
		document.querySelector('#dcmfirst').style.backgroundColor = '#082F41';
		document.querySelectorAll('.dcmseconditem').forEach((ele) => {
			ele.style.backgroundColor = '#082F41';
		});
		document.querySelector('#dcbottom').style.backgroundColor = '#082F41';
		document.querySelectorAll('h2').forEach((ele) => {
			ele.style.color = 'white';
		});
		document.querySelectorAll('p').forEach((ele) => {
			ele.style.color = 'white';
		});
		document.querySelectorAll('h3').forEach((ele) => {
			ele.style.color = 'white';
		});
		document.querySelectorAll('label').forEach((ele) => {
			ele.style.color = 'white';
		});
	} else {
		state = 0;
		document.querySelector('body').style.backgroundColor = 'white';
		btn.src = 'assets/moon.svg';
		document.querySelector('#heading').style.color = 'black';
		let nav_ele = document.querySelectorAll('.starti');
		nav_ele.forEach((ele) => {
			ele.style.color = 'black';
			ele.addEventListener('mouseover', () => {
				ele.style.transform = 'translateY(-5px)';
				ele.style.color = '#0369A1';
				ele.style.transition = 'all 0.3s linear';
			});
			ele.addEventListener('mouseout', () => {
				ele.style.transform = 'translateY(0px)';
				ele.style.color = 'black';
			});
		});
		document.querySelector('#dcmfirst').style.backgroundColor = 'white';
		document.querySelectorAll('.dcmseconditem').forEach((ele) => {
			ele.style.backgroundColor = 'white';
		});
		document.querySelector('#dcbottom').style.backgroundColor = 'white';
		document.querySelectorAll('h2').forEach((ele) => {
			ele.style.color = 'black';
		});
		document.querySelectorAll('p').forEach((ele) => {
			ele.style.color = 'black';
		});
		document.querySelectorAll('h3').forEach((ele) => {
			ele.style.color = 'black';
		});
		document.querySelectorAll('label').forEach((ele) => {
			ele.style.color = 'black';
		});
	}
});

function getOrderIdFromUrl() {
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get('orderId');
}

document.addEventListener('DOMContentLoaded', () => {
	const orderId = getOrderIdFromUrl();
	if (!orderId) {
		alert('Order ID not found in URL parameters.');
		return;
	}

	fetch(`/orderDetailsComplete?orderId=${orderId}`)
		.then((response) => response.json())
		.then((orderData) => {
			if (orderData.error) {
				console.error('Error fetching order details:', orderData.error);
				return;
			}
			console.log(orderData);
			displayOrderDetails(orderData);

			const shipperId = orderData.acceptedShipperId;
			if (shipperId) {
				fetch(`/shipperDetailsComplete?shipperId=${shipperId}`)
					.then((response) => response.json())
					.then((shipperData) => {
						if (shipperData.error) {
							console.error(
								'Error fetching shipper details:',
								shipperData.error
							);
							return;
						}

						displayShipperDetails(shipperData);
					})
					.catch((error) => {
						console.error('Error fetching shipper details:', error);
					});
			} else {
				console.warn('No shipper assigned to this order.');
				document.getElementById('shipperName').textContent = 'Not Assigned';
				document.getElementById('shipperDeliveries').textContent = '';
			}
		})
		.catch((error) => {
			console.error('Error fetching order details:', error);
		});
});

function displayOrderDetails(orderData) {
	// Update status
	document.getElementById('state').textContent =
		orderData.status || 'Delivered';

	document.getElementById(
		'originAddress'
	).textContent = `${orderData.fromAddress.houseNumber}, ${orderData.fromAddress.colony}, ${orderData.fromAddress.city}, ${orderData.fromAddress.state}, ${orderData.fromAddress.pinCode}`;

	document.getElementById(
		'weight'
	).textContent = `${orderData.dimensions.weight} Kg`;

	document.getElementById('price').textContent = `₹${
		orderData.finalPrice || 'N/A'
	}`;

	document.getElementById('deliveredOn').textContent = orderData.deliveryDate
		? formatDate(orderData.deliveryDate)
		: 'Not Delivered Yet';

	document.getElementById(
		'destinationAddress'
	).textContent = `${orderData.toAddress.houseNumber}, ${orderData.toAddress.colony}, ${orderData.toAddress.city}, ${orderData.toAddress.state}, ${orderData.toAddress.pinCode}`;

	document.getElementById(
		'dimensions'
	).textContent = `${orderData.dimensions.length}cm x ${orderData.dimensions.width}cm x ${orderData.dimensions.height}cm`;

	document.getElementById('description').textContent =
		orderData.description || 'No description provided';
}

function displayShipperDetails(shipperData) {
	document.getElementById('shipperName').textContent =
		shipperData.fullname || 'N/A';

	document.getElementById('shipperDeliveries').textContent = `${
		shipperData.shipperDelivered || 0
	} Deliveries`;
}

function formatDate(dateStr) {
	const date = new Date(dateStr);
	return date.toLocaleDateString();
}

// public/js/deliverycomplete.js

// ... existing code ...

// Get all rating sections
const ratingSections = document.querySelectorAll('.ratingsgiving');

const ratingsData = {};

ratingSections.forEach((section) => {
	const ratingType = section
		.querySelector('.ratingStars')
		.getAttribute('data-rating-type');
	const stars = section.querySelectorAll('.ratingsobs');
	const ratingValueInput = section.querySelector('.ratingValue');

	stars.forEach((star) => {
		star.addEventListener('click', () => {
			const value = parseInt(star.getAttribute('data-value'));
			ratingValueInput.value = value;
			ratingsData[ratingType] = value;

			// Update star images within this section
			stars.forEach((s) => {
				const starValue = parseInt(s.getAttribute('data-value'));
				if (starValue <= value) {
					s.src = 'assets/star_filled.svg';
				} else {
					s.src = 'assets/star.svg';
				}
			});
		});
	});
});

const reviewForm = document.getElementById('reviewForm');

reviewForm.addEventListener('submit', (event) => {
	event.preventDefault();

	const orderId = getOrderIdFromUrl();
	const reviewText = document.getElementById('dctextarea').value.trim();

	// Check if all ratings are selected
	const requiredRatings = [
		'overallRating',
		'punctualityRating',
		'professionalismRating',
		'communicationRating',
	];

	for (let ratingType of requiredRatings) {
		if (!ratingsData[ratingType]) {
			alert(`Please rate ${ratingType.replace('Rating', '')}.`);
			return;
		}
	}

	if (!reviewText) {
		alert('Please enter your review.');
		return;
	}

	const reviewData = {
		orderId: orderId,
		review: reviewText,
		...ratingsData,
	};

	fetch('/submitReview', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(reviewData),
	})
		.then((response) => response.json())
		.then((data) => {
			if (data.success) {
				alert('Thank you for your review!');
				window.location.reload();
			} else {
				alert('Error submitting review: ' + data.error);
			}
		})
		.catch((error) => {
			console.error('Error submitting review:', error);
		});
});
