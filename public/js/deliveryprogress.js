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

	// Fetch order details
	fetch(`/orderDetailsProgress?orderId=${orderId}`)
		.then((response) => response.json())
		.then((orderData) => {
			if (orderData.error) {
				console.error('Error fetching order details:', orderData.error);
				return;
			}
			displayOrderDetails(orderData);

			if (orderData.status === 'In Auction') {
				document.getElementById('currentBidders').style.display = 'block';
				fetchBidders(orderData.Bids);
			} else if (orderData.status === 'In Transit') {
				document.getElementById(
					'shipperinformationdeliveryprogress'
				).style.display = 'block';
				document.getElementById('paymentdeliveryprogress').style.display =
					'block';
				fetchShipperDetails(orderData.acceptedShipperId);
				displayPaymentSection(orderData.acceptedBidAmount);
			}
		})
		.catch((error) => {
			console.error('Error fetching order details:', error);
		});
});

function displayOrderDetails(orderData) {
	// Update order details in the DOM
	document.getElementById('state').textContent =
		orderData.status || 'In Progress';
	document.getElementById('originAddress').textContent = formatAddress(
		orderData.fromAddress
	);
	document.getElementById('destinationAddress').textContent = formatAddress(
		orderData.toAddress
	);
	document.getElementById(
		'weight'
	).textContent = `${orderData.dimensions.weight} Kg`;
	document.getElementById(
		'dimensions'
	).textContent = `${orderData.dimensions.length}cm * ${orderData.dimensions.width}cm * ${orderData.dimensions.height}cm`;
	document.getElementById('price').textContent = `₹${
		orderData.finalPrice || 'N/A'
	}`;
	document.getElementById('deliveredOn').textContent = orderData.deliveryDate
		? formatDate(orderData.deliveryDate)
		: 'Not Delivered Yet';
	document.getElementById('description').textContent =
		orderData.description || 'No description provided';
}

function formatAddress(address) {
	return `${address.houseNumber}, ${address.colony}, ${address.city}, ${address.state}, ${address.pinCode}`;
}

function formatDate(dateStr) {
	const date = new Date(dateStr);
	return date.toLocaleDateString();
}

function fetchBidders(bids) {
	const biddersContainer = document.getElementById('biddersContainer');
	biddersContainer.innerHTML = '';

	if (bids.length === 0) {
		biddersContainer.innerHTML = '<p>No bids yet.</p>';
		return;
	}

	bids.forEach((bid) => {
		const bidCard = document.createElement('div');
		bidCard.classList.add('card-body');
		bidCard.innerHTML = `
            <div class="card-bodyele">
                <p>Shipper Name</p>
                <p>${bid.shipperfullname}</p>
            </div>
            <div class="card-bodyele">
                <p>Bid Amount</p>
                <p>₹${bid.amount}</p>
            </div>
            <div class="card-footer">
                <button class="bid-button" onclick="acceptBid('${bid.shipperId}', ${bid.amount})">Accept Bid</button>
            </div>
        `;
		biddersContainer.appendChild(bidCard);
	});
}

function acceptBid(shipperId, amount) {
	const orderId = getOrderIdFromUrl();
	fetch('/acceptBid', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ orderId, shipperId, amount }),
	})
		.then((response) => response.json())
		.then((data) => {
			if (data.success) {
				alert('Bid accepted successfully.');
				window.location.reload();
			} else {
				alert('Error accepting bid: ' + data.message);
			}
		})
		.catch((error) => {
			console.error('Error accepting bid:', error);
		});
}

function fetchShipperDetails(shipperId) {
	fetch(`/shipperDetailsProgress?shipperId=${shipperId}`)
		.then((response) => response.json())
		.then((shipperData) => {
			displayShipperDetails(shipperData);
		})
		.catch((error) => {
			console.error('Error fetching shipper details:', error);
		});
}

function displayShipperDetails(shipperData) {
	document.getElementById('shipperName').textContent =
		shipperData.fullname || 'N/A';
	document.getElementById('shipperRating').textContent = `⭐${
		shipperData.shipperRating || 'N/A'
	}`;
	document.getElementById('shipperDeliveries').textContent = `${
		shipperData.shipperDelivered || 0
	} Deliveries`;
}

function displayPaymentSection(bidAmount) {
	document.getElementById('shippingCost').textContent = `₹${bidAmount}`;

	const taxes = bidAmount * 0.1; // 10% tax
	const totalAmount = bidAmount + taxes;

	document.getElementById('taxes').textContent = `₹${taxes.toFixed(2)}`;
	document.getElementById('totalAmount').textContent = `₹${totalAmount.toFixed(
		2
	)}`;

	// Add event listener to 'Make Payment' button
	document.getElementById('makePaymentBtn').addEventListener('click', () => {
		amountinPaisa = Math.round(totalAmount * 100);
		initiatePayment(amountinPaisa); // Amount in paisa
	});
}

function initiatePayment(amount) {
	const orderId = getOrderIdFromUrl();
	fetch('/createOrder', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ amount, orderId }),
	})
		.then((response) => response.json())
		.then((data) => {
			if (data.success) {
				const options = {
					key: data.keyId,
					amount: data.order.amount,
					currency: data.order.currency,
					name: 'ShipIt',
					description: 'Shipment Payment',
					order_id: data.order.id,
					handler: function (response) {
						// Verify payment on the server
						verifyPayment(response, orderId);
					},
					prefill: {
						name: 'Customer Name', // Replace with actual user name if available
						email: 'customer@example.com', // Replace with actual user email if available
						contact: '9999999999', // Replace with actual user contact if available
					},
					theme: {
						color: '#3399cc',
					},
				};
				const rzp = new Razorpay(options);
				rzp.open();
			} else {
				alert('Error creating order. Please try again.');
			}
		})
		.catch((error) => {
			console.error('Error initiating payment:', error);
		});
}

function verifyPayment(paymentData, orderId) {
	fetch('/verifyPayment', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ paymentData, orderId }),
	})
		.then((response) => response.json())
		.then((data) => {
			if (data.success) {
				alert('Payment successful!');
				window.location.reload();
			} else {
				alert('Payment verification failed.');
			}
		})
		.catch((error) => {
			console.error('Error verifying payment:', error);
		});
}
