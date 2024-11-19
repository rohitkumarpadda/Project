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
		document.querySelector('.shipment-card').style.background =
			'rgb(226, 226, 226)';
		document.querySelector('#sliderValue').style.color = 'black';
		document.querySelector('#weightRange').style.background =
			' background: linear-gradient(to right, #555 50%, #ddd 50%);';
	}
});

document.addEventListener('DOMContentLoaded', () => {
	fetch('/api/mybids')
		.then((response) => response.json())
		.then((data) => {
			if (data.success) {
				displayMyBids(data.orders);
			} else {
				console.error('Failed to fetch bids:', data.message);
				displayNoBidsMessage();
			}
		})
		.catch((error) => {
			console.error('Error fetching bids:', error);
			displayNoBidsMessage();
		});
});

function displayMyBids(orders) {
	const shiperAreaBid = document.getElementById('shiperareabid');
	shiperAreaBid.innerHTML = ''; // Clear existing content

	if (orders.length === 0) {
		displayNoBidsMessage();
		return;
	}

	orders.forEach((order) => {
		const myBid = order.Bids[0]; // Since we filtered only the shipper's bids

		const shipmentCard = document.createElement('div');
		shipmentCard.className = 'shipment-card';

		shipmentCard.innerHTML = `
          <div class="card-header">
              <div>
                  <h3>Shipment #${order._id} ${
			order.category ? `<span class="tag">${order.category}</span>` : ''
		}</h3>
                  <p>Dimensions: ${order.dimensions.length}x${
			order.dimensions.width
		}x${order.dimensions.height} cm</p>
                  <p>Weight: ${order.dimensions.weight} kg</p>
              </div>
              <div class="bid-info">
                  <h3>₹${myBid.amount}</h3>
                  <p>Your Bid</p>
              </div>
          </div>
          <div class="card-body">
              <p><strong>Pickup:</strong> ${order.fromAddress.city}, ${
			order.fromAddress.state
		}</p>
              <p><strong>Destination:</strong> ${order.toAddress.city}, ${
			order.toAddress.state
		}</p>
              <p><strong>Status:</strong> ${order.status}</p>
          </div>
          <div class="card-footer">
              <button class="bid-button" onclick="viewShipment('${
								order._id
							}')">View Shipment</button>
          </div>
      `;

		shiperAreaBid.appendChild(shipmentCard);
	});
}

function displayNoBidsMessage() {
	const shiperAreaBid = document.getElementById('shiperareabid');
	shiperAreaBid.innerHTML = '<p>You have not placed any bids yet.</p>';
}

// Functions to handle button clicks
function viewShipment(orderId) {
	const urlparams = new URLSearchParams(window.location.search);
	const shipper = urlparams.get('shipperId');
	window.location.href = `/orderBids?orderId=${orderId}&shipperId=${shipper}`;
}

function updateBid(orderId) {
	window.location.href = `/biddingarea?orderId=${orderId}`;
}
