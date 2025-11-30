document.addEventListener('DOMContentLoaded', () => {
  displayPopularDestinations();
  document.getElementById('search-btn')?.addEventListener('click', handleSearch);
});
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function displayPopularDestinations() {
  const container = document.getElementById('Destination');
  if (!container) return;

  try {
    const res = await fetch('/api');
    const data = await res.json();

    if (!Array.isArray(data)) return;

    // Sort by rating desc
    data.sort((a, b) => b.rating - a.rating);

    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'cards';
    cardWrapper.innerHTML = "";
    data.forEach((property) => {
      const card = document.createElement("div");

      card.innerHTML = `
        <div class="card">
          <img src="${property.images}" alt="${escapeHtml(
            property.city
          )}" />
          <p>${escapeHtml(property.city)}</p>
        </div>
      `;

      card.addEventListener('click', () => {
        window.location.href = `products.html?details=${encodeURIComponent(
          property.city
        )}`;
      });

      cardWrapper.appendChild(card);

    });
    container.appendChild(cardWrapper);
  } catch (err) {
    console.error('Error loading popular destinations:', err);
  }
}

/**
 * Handle search: call /api/search and render results.
 */
async function handleSearch() {
  const destinationInput = document.getElementById('destination-input');
  const guestsSelect = document.getElementById('guests-select');
  const resultsSubtitle = document.getElementById('results-subtitle');
  const resultsGrid = document.getElementById('results-grid');

  if (!destinationInput || !guestsSelect || !resultsSubtitle || !resultsGrid) {
    return;
  }

  const destination = destinationInput.value.trim();
  const guests = guestsSelect.value;

  if (!destination) {
    alert('Please enter a destination.');
    return;
  }

  // Clear old results
  resultsGrid.innerHTML = '';
  resultsSubtitle.textContent = 'Searching...';

  try {
    const params = new URLSearchParams({
      destination,
      guests,
    });

    const res = await fetch(`/api/search?${params.toString()}`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      resultsSubtitle.textContent = 'No stays found for that search.';
      return;
    }

    resultsSubtitle.textContent = `Found ${data.length} stay(s):`;

    data.forEach((property) => {
      const card = document.createElement('div');
      card.className = 'result-card';

      const img = document.createElement('img');
      img.src = property.image;
      img.alt = property.name;

      const body = document.createElement('div');
      body.className = 'result-card-body';

      const title = document.createElement('div');
      title.className = 'result-title';
      title.textContent = property.name;

      const city = document.createElement('div');
      city.className = 'result-subtitle';
      city.textContent = property.city;
      /*
      const desc = document.createElement('div');
      desc.className = 'result-description';
      desc.textContent = property.description;
      

      const price = document.createElement('div');
      price.className = 'result-price';
      price.textContent = `₹${property.pricePerNight} / night · up to ${property.maxGuests} guests`;
      */
     const addrss=document.createElement('div');
     addrss.className='result-address';
     addrss.textContent=property.address;

      body.appendChild(title);
      body.appendChild(city);
      body.appendChild(addrss);
      //body.appendChild(desc);
      //body.appendChild(price);

      card.appendChild(img);
      card.appendChild(body);

      card.addEventListener('click', () => {
        window.location.href = `products.html?details=${encodeURIComponent(
          property.name
        )}`;
      });

      resultsGrid.appendChild(card);
    });

    // Scroll to results
    document.getElementById('results-section').scrollIntoView({
      behavior: 'smooth',
    });
  } catch (err) {
    console.error('Search error:', err);
    resultsSubtitle.textContent = 'Something went wrong. Please try again.';
  }
}
