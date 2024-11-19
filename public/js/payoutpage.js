let state = 0;
let btn = document.querySelector('.mode');
btn.addEventListener('click', () => {
	if (state == 0) {
		state = 1;
		document.querySelector('body').style.backgroundColor = 'black';
		btn.src = 'sun-moon.svg';
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
		btn.src = 'moon.svg';
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

// public/js/payoutpage.js

document.addEventListener('DOMContentLoaded', () => {
	const urlParams = new URLSearchParams(window.location.search);
	const orderId = urlParams.get('orderId');

	if (!orderId) {
		alert('No Order ID provided.');
		window.location.href = '/shipperdashbord.html';
		return;
	}

	// Fetch Order Details
	fetchOrderDetails(orderId);

	// Handle OTP Submission
	const otpSubmitBtn = document.getElementById('otpsubmit');
	otpSubmitBtn.addEventListener('click', () => {
		const otp = document.getElementById('otp').value.trim();
		if (otp === '') {
			alert('Please enter your OTP.');
			return;
		}
		submitOtp(orderId, otp);
	});
});

function fetchOrderDetails(orderId) {
	fetch(`/api/order/details?orderId=${orderId}`)
		.then((response) => response.json())
		.then((data) => {
			if (data.success) {
				populateOrderDetails(data.order);
				fetchShipperDetails(data.order.acceptedShipperId);
			} else {
				console.error('Error fetching order details:', data.message);
				alert('Error fetching order details.');
			}
		})
		.catch((error) => {
			console.error('Error fetching order details:', error);
			alert('Error fetching order details.');
		});
}

function populateOrderDetails(order) {
	document.getElementById('state').textContent = order.status;
	document.getElementById('originAddress').textContent = formatAddress(
		order.fromAddress
	);
	document.getElementById('destinationAddress').textContent = formatAddress(
		order.toAddress
	);
	document.getElementById(
		'weight'
	).textContent = `${order.dimensions.weight} Kg`;
	document.getElementById(
		'dimensions'
	).textContent = `${order.dimensions.length}cm * ${order.dimensions.width}cm * ${order.dimensions.height}cm`;
	document.getElementById('price').textContent = `₹${order.acceptedBidAmount}`;
	document.getElementById('deliveredOn').textContent = order.deliveryDate
		? formatDate(order.deliveryDate)
		: 'Not Delivered Yet';
	document.getElementById('description').textContent =
		order.description || 'No description provided.';
}

function formatAddress(address) {
	return `${address.houseNumber}, ${address.colony}, ${address.city}, ${address.state}, ${address.pinCode}`;
}

function formatDate(dateStr) {
	const date = new Date(dateStr);
	return date.toLocaleDateString();
}

function fetchShipperDetails(shipperId) {
	fetch(`/api/shipper/bankingDetails?shipperId=${shipperId}`)
		.then((response) => response.json())
		.then((data) => {
			if (data.success) {
				displayPayoutOptions(data.bankingDetails);
			} else {
				console.error('Error fetching shipper banking details:', data.message);
				alert('Error fetching payout details.');
			}
		})
		.catch((error) => {
			console.error('Error fetching shipper banking details:', error);
			alert('Error fetching payout details.');
		});
}

function displayPayoutOptions(bankingDetails) {
	const payoutOptionsDiv = document.getElementById('payoutOptions');
	payoutOptionsDiv.innerHTML = ''; 

	if (bankingDetails.upiid) {
		payoutOptionsDiv.innerHTML = `
          <div class="payoutOption">
              <h3>UPI Payout</h3>
              <p>UPI ID: ${bankingDetails.upiid}</p>
              <button id="initiateUpiPayout" class="payoutBtn">Initiate UPI Payout</button>
          </div>
      `;
		document
			.getElementById('initiateUpiPayout')
			.addEventListener('click', () => {
				initiatePayout(bankingDetails, 'upi');
			});
	} else {
		// Else, Bank Transfer Payout
		payoutOptionsDiv.innerHTML = `
          <div class="payoutOption">
              <h3>Bank Transfer Payout</h3>
              <p>Bank Name: ${bankingDetails.bankName}</p>
              <p>Account Holder: ${bankingDetails.accountHolderName}</p>
              <p>Account Number: ${bankingDetails.accountNumber}</p>
              <p>IFSC Code: ${bankingDetails.ifscCode}</p>
              <button id="initiateBankPayout" class="payoutBtn">Initiate Bank Transfer</button>
          </div>
      `;
		document
			.getElementById('initiateBankPayout')
			.addEventListener('click', () => {
				initiatePayout(bankingDetails, 'bank_transfer');
			});
	}
}

function initiatePayout(bankingDetails, payoutMode) {
	const urlParams = new URLSearchParams(window.location.search);
	const orderId = urlParams.get('orderId');

	fetch('/api/payout/initiate', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ orderId }),
	})
		.then((response) => response.json())
		.then((data) => {
			if (data.success) {
				alert('Payout initiated successfully.');
				window.location.href = '/shipperdashbord.html';
			} else {
				alert('Error initiating payout: ' + data.message);
			}
		})
		.catch((error) => {
			console.error('Error initiating payout:', error);
			alert('Error initiating payout.');
		});
}

function submitOtp(orderId, otp) {
	initiatePayoutWithOtp(orderId, otp);
}

function initiatePayoutWithOtp(orderId, otp) {
	fetch('/api/payout/initiateWithOtp', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ orderId, otp }),
	})
		.then((response) => response.json())
		.then((data) => {
			if (data.success) {
				alert('Payout initiated successfully.');
				window.location.href = '/shipperdashbord.html';
			} else {
				alert('Error initiating payout: ' + data.message);
			}
		})
		.catch((error) => {
			console.error('Error initiating payout:', error);
			alert('Error initiating payout.');
		});
}
