// -----------------------------------------------------
// YOUR EXISTING PRODUCT DETAILS CODE (UNCHANGED)
// -----------------------------------------------------

const result = document.getElementById("result");

const params = new URLSearchParams(window.location.search);
const loc = params.get("details");
details();
availble();

async function details() {
  result.innerHTML = "";
  const res = await fetch(`/api/details/${loc}`);
  const data = await res.json();

  data.forEach(element => {
    const card = document.createElement("div");
    card.className = "res";
    card.innerHTML = `
      <section class="hero">
        <img src="${element.image}" class="hero-bg" alt="">
        <div class="hero-text">
          <h1>${element.name}</h1>
          <p><i class="fa-solid fa-location-dot"></i> ${element.city}</p>
        </div>
      </section>
      <main class="container">

        <!-- About -->
        <section class="about">
          <h2>About this stay</h2>
          <p class="yet">Yet to be decieded</p>
        </section>

        <!-- Reviews -->
        <aside class="reviews">
          <div class="review-header">
            <h3>Guest Reviews</h3>
            <div class="rating"><i class="fa-solid fa-star"></i> ${element.rating}</div>
          </div>

          <div class="review">
            <h4>Aditya Verma <span>★★★★★</span></h4>
            <p>"A magical experience! The boat ride arrival sets the tone for a royal stay."</p>
          </div>

          <div class="review">
            <h4>Sarah Jenkins <span>★★★★★</span></h4>
            <p>"The architecture is stunning. Best hotel in India."</p>
          </div>
        </aside>

        <!-- Amenities -->
        <section class="amenities">
          <h2>Premium Amenities</h2>
          <div class="grid">
            <div class="amenity"><i class="fa-solid fa-check"></i> Free WiFi</div>
            <div class="amenity"><i class="fa-solid fa-check"></i> Swimming Pool</div>
            <div class="amenity"><i class="fa-solid fa-check"></i> Spa</div>
            <div class="amenity"><i class="fa-solid fa-check"></i> Boat Transfer</div>
            <div class="amenity"><i class="fa-solid fa-check"></i> Heritage Walk</div>
          </div>
        </section>
      </main>
    `;
    result.appendChild(card);
  });
}

async function availble() {
  const rooms = document.getElementById("results-grid");
  rooms.innerHTML = "";

  const res = await fetch(`/api/details/${loc}`);
  const data = await res.json();

  data.forEach((property) => {
    property.rooms.forEach((room) => {
      const card = document.createElement("div");
      card.className = "result-card";

      const img = document.createElement("img");
      img.src = room.image;
      img.alt = room.name;

      const title = document.createElement("div");
      title.className = "result-title";
      title.textContent = room.name;

      const body = document.createElement("div");
      body.className = "result-card-body";

      const price = document.createElement("div");
      price.className = "result-price";
      price.textContent = `₹${room.price} / night · up to ${room.maxGuests} guests`;

      body.appendChild(title);
      body.appendChild(price);

      card.appendChild(img);
      card.appendChild(body);
      rooms.appendChild(card);
    });
  });
}
