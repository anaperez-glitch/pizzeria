// script.js

// Formato moneda europeo con coma y 2 decimales
function formatEurFromCents(cents){
  // cents es entero
  const euros = (cents / 100).toFixed(2).replace('.', ',');
  return `${euros} €`;
}

document.addEventListener('DOMContentLoaded', () => {
  const ingredientsList = document.getElementById('ingredients-list');
  const totalEur = document.getElementById('total-eur');
  const pizzaForm = document.getElementById('pizza-form');
  const message = document.getElementById('message');

  let ingredients = []; // array con {id,name,price} price en euros DECIMAL como string/number

  // Trae ingredientes disponibles desde PHP (JSON)
  fetch('get_ingredients.php')
    .then(r => {
      if (!r.ok) throw new Error('Error al cargar ingredientes');
      return r.json();
    })
    .then(data => {
      ingredients = data; // cada item: {id, name, price}
      if (!Array.isArray(ingredients) || ingredients.length === 0){
        ingredientsList.innerHTML = '<p>No hay ingredientes disponibles.</p>';
        return;
      }
      renderIngredients();
      updateTotal();
    })
    .catch(err => {
      ingredientsList.innerHTML = `<p>Error al cargar: ${err.message}</p>`;
    });

  function renderIngredients(){
    ingredientsList.innerHTML = '';
    ingredients.forEach(ing => {
      // price as decimal string -> convert to euros string for display
      const priceStr = Number(ing.price).toFixed(2).replace('.', ',') + ' €';
      const wrapper = document.createElement('label');
      wrapper.className = 'ingredient';
      wrapper.innerHTML = `
        <input type="checkbox" data-id="${ing.id}" />
        <div class="name">${ing.name}</div>
        <div class="price">${priceStr}</div>
      `;
      ingredientsList.appendChild(wrapper);
    });
    // listen changes
    ingredientsList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', updateTotal);
    });
  }

  // Suma precios en centavos para evitar float issues
  function updateTotal(){
    const checked = Array.from(ingredientsList.querySelectorAll('input[type="checkbox"]:checked'));
    let totalCents = 0;
    checked.forEach(cb => {
      const id = Number(cb.dataset.id);
      const ing = ingredients.find(i => Number(i.id) === id);
      if (ing){
        // convertir precio a céntimos (entero) de forma segura
        const priceFloat = Number(ing.price);
        const cents = Math.round(priceFloat * 100); // digit-by-digit style: usamos round al entero de céntimos
        totalCents += cents;
      }
    });
    totalEur.textContent = formatEurFromCents(totalCents);
    // attach totalCents al form por si quieres enviarlo
    pizzaForm.dataset.totalCents = totalCents;
  }

  // Enviar pedido (ejemplo guardado en DB en place_order.php)
  pizzaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    message.textContent = '';

    const formData = new FormData(pizzaForm);
    const name = formData.get('customer_name').trim();
    const phone = formData.get('customer_phone').trim();

    if (!name || !phone) {
      message.textContent = 'Rellena nombre y teléfono.';
      return;
    }

    const checkedBoxes = Array.from(ingredientsList.querySelectorAll('input[type="checkbox"]:checked'));
    const ingredientIds = checkedBoxes.map(cb => Number(cb.dataset.id));

    // preparar payload
    const payload = {
      customer_name: name,
      customer_phone: phone,
      ingredients: ingredientIds,
      total_cents: Number(pizzaForm.dataset.totalCents || 0)
    };

    // POST JSON
    fetch('place_order.php', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(res => {
      if (res.success){
        message.style.color = 'green';
        message.textContent = `Pedido registrado (id: ${res.order_id}). Total: ${formatEurFromCents(payload.total_cents)}`;
        pizzaForm.reset();
        updateTotal();
      } else {
        message.style.color = 'crimson';
        message.textContent = `Error: ${res.message || 'No se pudo crear el pedido.'}`;
      }
    })
    .catch(err => {
      message.style.color = 'crimson';
      message.textContent = 'Error en la petición: ' + err.message;
    });
  });
});
