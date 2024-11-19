let mode = document.querySelector('#modebtn');
let state = 0;
mode.addEventListener('click', () => {
	if (state == 0) {
		state = 1;
		document.querySelector('.mode').src = 'assets/sun-moon.svg';
		document.querySelector('body').style.backgroundColor = 'black';
		document.querySelector('#heading').style.color = 'white';
		document.querySelector('.header').style.border =
			'0px 0px 1px 0px solid white';
		document.querySelectorAll('h1').forEach((ele) => {
			ele.style.color = 'white';
		});
		//bodycontent1,sideflex,h2,h3,h4,p
		document.querySelectorAll('h2').forEach((ele) => {
			ele.style.color = 'white';
		});
		document.querySelectorAll('h3').forEach((ele) => {
			ele.style.color = 'white';
		});
		document.querySelectorAll('h4').forEach((ele) => {
			ele.style.color = 'white';
		});
		document.querySelectorAll('p').forEach((ele) => {
			ele.style.color = 'white';
		});
		document.querySelectorAll('.sideflex').forEach((ele) => {
			ele.style.backgroundColor = '#082f49';
		});
		document.querySelectorAll('.bodycontent1').forEach((ele) => {
			ele.style.backgroundColor = '#082f49';
		});
	} else {
		state = 0;
		document.querySelector('.mode').src = 'assets/moon.svg';
		document.querySelector('body').style.backgroundColor = 'white';
		document.querySelector('#heading').style.color = 'black';
		document.querySelector('.header').style.border =
			'0px 0px 1px 0px solid black';
		document.querySelectorAll('h1').forEach((ele) => {
			ele.style.color = 'black';
		});
		document.querySelectorAll('h2').forEach((ele) => {
			ele.style.color = 'black';
		});
		document.querySelectorAll('h3').forEach((ele) => {
			ele.style.color = 'black';
		});
		document.querySelectorAll('h4').forEach((ele) => {
			ele.style.color = 'black';
		});
		document.querySelectorAll('p').forEach((ele) => {
			ele.style.color = 'black';
		});
		document.querySelectorAll('.sideflex').forEach((ele) => {
			ele.style.backgroundColor = 'white';
		});
		document.querySelectorAll('.bodycontent1').forEach((ele) => {
			ele.style.backgroundColor = 'white';
		});
	}
});

// In public/js/biddingarea.js

document.addEventListener('DOMContentLoaded', () => {
	const urlparams = new URLSearchParams(window.location.search);
	const orderId = urlparams.get('orderId');

	fetch('/bidDetails?orderId=' + orderId)
		.then((response) => response.json())
		.then((data) => {
			displayData(data);
		})
		.catch((error) => {
			console.error('Error fetching order details:', error);
		});
});

function displayData(data) {
	// Update shipment details
	document.getElementById('shipmentNumber').textContent = data._id;
	document.getElementById('shipmentId').textContent = data._id;
	document.getElementById('shipmentType').textContent = data.type || 'N/A';
	document.getElementById('description').textContent =
		data.description || 'No description available';

	document.getElementById(
		'pickupLocation'
	).textContent = `${data.fromAddress.city}, ${data.fromAddress.state}`;
	document.getElementById('pickupDate').textContent = formatDate(
		data.pickupDate
	);
	document.getElementById(
		'destination'
	).textContent = `${data.toAddress.city}, ${data.toAddress.state}`;
	document.getElementById('estimatedDelivery').textContent =
		calculateEstimatedDelivery(data.pickupDate);

	document.getElementById('weight').textContent =
		data.dimensions.weight || 'N/A';
	document.getElementById('dimensions').textContent =
		`${data.dimensions.length} x ${data.dimensions.width} x ${data.dimensions.height}` ||
		'N/A';

	// Update images
	const imgInput = document.getElementById('imginput');
	imgInput.innerHTML = '';
	data.images.forEach((imagePath) => {
		const div = document.createElement('div');
		div.classList.add('imageupload');
		const img = document.createElement('img');
		img.src = imagePath;
		img.alt = 'Shipment Image';
		div.appendChild(img);
		imgInput.appendChild(div);
	});

	// Update bidding information
	const bestBid = getBestBid(data.Bids);
	document.getElementById('bestBid').textContent = `₹${bestBid}`;
	document.getElementById('numberOfBidders').textContent = data.Bids.length;

	const timeLeft = calculateTimeLeft(data.createdAt);
	document.getElementById('timeLeft').textContent = timeLeft;

	// Update recent bids
	const recentBidsContainer = document.getElementById('recentBids');
	recentBidsContainer.innerHTML = '';
  const sortedBids = data.Bids.sort((a, b) => a.amount - b.amount);
  
	sortedBids.slice(0, 5).forEach((bid) => {
		const bidItem = document.createElement('div');
		bidItem.classList.add('sideflexitem');

		const bidInfo = document.createElement('div');
		bidInfo.classList.add('sideflexsubitem');

		const shipperName = document.createElement('h4');
		shipperName.textContent = `${bid.shipperId || 'Shipper'}:`;

		const bidTime = document.createElement('p');
		bidTime.textContent = timeSince(new Date(bid.createdAt));

		bidInfo.appendChild(shipperName);
		bidInfo.appendChild(bidTime);

		const bidAmount = document.createElement('h4');
		bidAmount.textContent = `₹${bid.amount}`;

		bidItem.appendChild(bidInfo);
		bidItem.appendChild(bidAmount);

		recentBidsContainer.appendChild(bidItem);
	});
}

// Helper functions
function getBestBid(bids) {
	if (!bids || bids.length === 0) return 0;
	return Math.min(...bids.map((bid) => bid.amount));
}

function formatDate(dateStr) {
	const date = new Date(dateStr);
	return date.toLocaleDateString();
}

function calculateEstimatedDelivery(pickupDateStr) {
	const pickupDate = new Date(pickupDateStr);
	const estimatedDeliveryDate = new Date(
		pickupDate.getTime() + 2 * 24 * 60 * 60 * 1000
	);
	return estimatedDeliveryDate.toLocaleDateString();
}

function calculateTimeLeft(createdAtStr) {
	const createdAt = new Date(createdAtStr);
	const bidDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
	const now = Date.now();
	const timeLeft = createdAt.getTime() + bidDuration - now;

	if (timeLeft <= 0) return 'Bidding Closed';

	const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
	const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
	return `${days} days ${hours} hours`;
}

function timeSince(date) {
	const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
	let interval = Math.floor(seconds / 31536000);

	if (interval >= 1) {
		return interval + ' year' + (interval === 1 ? '' : 's') + ' ago';
	}
	interval = Math.floor(seconds / 2592000);
	if (interval >= 1) {
		return interval + ' month' + (interval === 1 ? '' : 's') + ' ago';
	}
	interval = Math.floor(seconds / 86400);
	if (interval >= 1) {
		return interval + ' day' + (interval === 1 ? '' : 's') + ' ago';
	}
	interval = Math.floor(seconds / 3600);
	if (interval >= 1) {
		return interval + ' hour' + (interval === 1 ? '' : 's') + ' ago';
	}
	interval = Math.floor(seconds / 60);
	if (interval >= 1) {
		return interval + ' minute' + (interval === 1 ? '' : 's') + ' ago';
	}
	return 'Just now';
}

// Handle bid form submission
document.getElementById('bidForm').addEventListener('submit', function (e) {
	e.preventDefault();
	const bidAmount = this.elements['bidamount'].value;
	const orderId = new URLSearchParams(window.location.search).get('orderId');

	fetch('/placeBid', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			orderId: orderId,
			amount: bidAmount,
		}),
	})
		.then((response) => response.json())
		.then((result) => {
			if (result.success) {
				alert('Bid placed successfully!');
				location.reload();
			} else {
				alert('Error placing bid: ' + result.message);
			}
		})
		.catch((error) => {
			console.error('Error placing bid:', error);
		});
});
