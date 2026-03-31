const API = 'http://localhost:8080/api';
let allProducts = [];
let activeCategory = '';

async function loadProducts() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = Array(8).fill(0).map(() =>
    '<div class="skeleton-card"><div class="skeleton" style="height:160px;border-radius:0;"></div><div style="padding:12px;"><div class="skeleton" style="height:11px;width:40%;margin-bottom:8px;"></div><div class="skeleton" style="height:14px;width:80%;margin-bottom:6px;"></div><div class="skeleton" style="height:20px;width:50%;margin-bottom:10px;"></div><div class="skeleton" style="height:32px;"></div></div></div>'
  ).join('');
  try {
    const res = await fetch(API + '/products');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    allProducts = await res.json();
    buildCategoryNav();
    buildBrandFilters();
    filterProducts();
  } catch(e) {
    grid.innerHTML = '<div class="empty"><div class="empty-icon">warning</div><h2>Cannot reach server</h2><p>Make sure Spring Boot is running on localhost:8080</p><small style="color:red">' + e.message + '</small></div>';
    document.getElementById('resultCount').textContent = 'Connection failed';
  }
}

function renderProducts(products) {
  const grid = document.getElementById('productGrid');
  document.getElementById('resultCount').textContent = products.length + ' product' + (products.length !== 1 ? 's' : '') + ' found';
  if (!products.length) {
    grid.innerHTML = '<div class="empty"><div class="empty-icon">search</div><h2>No products found</h2><p>Try adjusting your search or filters.</p></div>';
    return;
  }
  grid.innerHTML = products.map(p => {
    const imgSrc = p.imagename ? API + '/products/' + p.id + '/image' : null;
    const inStock = p.available && p.quantity > 0;
    const lowStock = p.quantity > 0 && p.quantity <= 5;
    const price = Number(p.price).toLocaleString('en-IN', {style:'currency', currency:'INR', maximumFractionDigits:0});
    const brand = p.Brand || p.brand || '';
    const imgHtml = imgSrc ? '<img src="' + imgSrc + '" alt="' + p.name + '" onerror="this.parentElement.innerHTML=\'<div class=no-img>car</div>\'">' : '<div class="no-img">car</div>';
    const badge = !inStock ? '<div class="card-badge out">Out of Stock</div>' : lowStock ? '<div class="card-badge">Low Stock</div>' : '';
    const qtyClass = p.quantity === 0 ? 'out-qty' : lowStock ? 'low' : '';
    const qtyText = p.quantity === 0 ? 'Out of stock' : lowStock ? 'Only ' + p.quantity + ' left' : p.quantity + ' in stock';
    return '<div class="product-card" onclick="viewProduct(' + p.id + ')">'
      + badge
      + '<div class="card-img">' + imgHtml + '</div>'
      + '<div class="card-body">'
      + '<div class="card-brand">' + brand + '</div>'
      + '<div class="card-name">' + p.name + '</div>'
      + '<div class="card-category">' + (p.category || 'General') + '</div>'
      + '<div class="card-price">' + price + '</div>'
      + '<div class="card-qty ' + qtyClass + '">' + qtyText + '</div>'
      + '<div class="card-actions" onclick="event.stopPropagation()">'
      + '<button class="btn-cart" onclick="openEditModal(' + p.id + ')">Edit</button>'
      + '<button class="btn-icon" onclick="confirmDelete(' + p.id + ')" title="Delete">Del</button>'
      + '</div></div></div>';
  }).join('');
}

function filterProducts() {
  let list = [...allProducts];
  const q = document.getElementById('searchInput').value.toLowerCase();
  const onlyAvail = document.getElementById('filterAvailable').checked;
  const minP = parseFloat(document.getElementById('priceMin').value) || 0;
  const maxP = parseFloat(document.getElementById('priceMax').value) || Infinity;
  const sort = document.getElementById('sortSelect').value;
  if (activeCategory) list = list.filter(p => (p.category||'').toLowerCase() === activeCategory.toLowerCase());
  if (q) list = list.filter(p => [p.name, p.Brand||p.brand, p.category, p.description].join(' ').toLowerCase().includes(q));
  if (onlyAvail) list = list.filter(p => p.available && p.quantity > 0);
  list = list.filter(p => Number(p.price) >= minP && Number(p.price) <= maxP);
  const checkedBrands = [...document.querySelectorAll('#brandFilters input:checked')].map(i => i.value);
  if (checkedBrands.length) list = list.filter(p => checkedBrands.includes(p.Brand||p.brand||''));
  if (sort === 'price-asc') list.sort((a,b) => a.price - b.price);
  else if (sort === 'price-desc') list.sort((a,b) => b.price - a.price);
  else if (sort === 'name-asc') list.sort((a,b) => a.name.localeCompare(b.name));
  else if (sort === 'qty-desc') list.sort((a,b) => b.quantity - a.quantity);
  renderProducts(list);
}

function buildCategoryNav() {
  const cats = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
  document.getElementById('categoryNav').innerHTML =
    '<button class="nav-pill active" onclick="filterCategory(\'\', this)">All</button>' +
    cats.map(c => '<button class="nav-pill" onclick="filterCategory(\'' + c + '\', this)">' + c + '</button>').join('');
}

function buildBrandFilters() {
  const brands = [...new Set(allProducts.map(p => p.Brand||p.brand).filter(Boolean))];
  document.getElementById('brandFilters').innerHTML = brands.map(b =>
    '<label class="filter-item"><input type="checkbox" value="' + b + '" onchange="filterProducts()"> ' + b + '</label>'
  ).join('');
}

function filterCategory(cat, btn) {
  activeCategory = cat;
  document.querySelectorAll('.nav-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filterProducts();
}

function viewProduct(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  const imgSrc = p.imagename ? API + '/products/' + p.id + '/image' : null;
  const price = Number(p.price).toLocaleString('en-IN', {style:'currency', currency:'INR'});
  const date = p.releaseDate ? new Date(p.releaseDate).toLocaleDateString('en-IN', {year:'numeric',month:'short',day:'numeric'}) : 'N/A';
  const brand = p.Brand || p.brand || 'N/A';
  const imgHtml = imgSrc ? '<img src="' + imgSrc + '" alt="' + p.name + '" onerror="this.parentElement.innerHTML=\'<span style=font-size:56px>car</span>\'">' : '<span style="font-size:56px">car</span>';
  document.getElementById('detailTitle').textContent = p.name;
  document.getElementById('detailBody').innerHTML =
    '<div class="detail-img">' + imgHtml + '</div>'
    + '<div class="detail-brand">' + brand + '</div>'
    + '<div class="detail-name">' + p.name + '</div>'
    + '<div class="detail-desc">' + (p.description || 'No description provided.') + '</div>'
    + '<div class="detail-price">' + price + '</div>'
    + '<div class="detail-meta">'
    + '<div class="meta-chip">Category<strong>' + (p.category||'N/A') + '</strong></div>'
    + '<div class="meta-chip">Stock<strong>' + p.quantity + ' units</strong></div>'
    + '<div class="meta-chip">Status<strong style="color:' + (p.available?'var(--success)':'var(--danger)') + '">' + (p.available?'Available':'Unavailable') + '</strong></div>'
    + '<div class="meta-chip">Release<strong>' + date + '</strong></div>'
    + '</div>'
    + '<div class="detail-actions">'
    + '<button class="btn-edit" onclick="closeModal(\'detailModal\');openEditModal(' + p.id + ')">Edit Product</button>'
    + '<button class="btn-delete" onclick="closeModal(\'detailModal\');confirmDelete(' + p.id + ')">Delete</button>'
    + '</div>';
  openModal('detailModal');
}

function openAddModal() {
  document.getElementById('formTitle').textContent = 'Add Product';
  ['editId','fName','fBrand','fCategory','fPrice','fQty','fDate','fDesc'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('fAvailable').value = 'true';
  document.getElementById('imageFile').value = '';
  document.getElementById('imgPreview').innerHTML = '<span style="font-size:28px;color:#ccc">Photo</span>';
  openModal('formModal');
}

function openEditModal(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  document.getElementById('formTitle').textContent = 'Edit Product';
  document.getElementById('editId').value = p.id;
  document.getElementById('fName').value = p.name || '';
  document.getElementById('fBrand').value = p.Brand || p.brand || '';
  document.getElementById('fCategory').value = p.category || '';
  document.getElementById('fPrice').value = p.price || '';
  document.getElementById('fQty').value = p.quantity || '';
  document.getElementById('fDesc').value = p.description || '';
  document.getElementById('fAvailable').value = String(p.available);
  document.getElementById('fDate').value = p.releaseDate ? new Date(p.releaseDate).toISOString().split('T')[0] : '';
  document.getElementById('imageFile').value = '';
  const imgSrc = p.imagename ? API + '/products/' + p.id + '/image' : null;
  document.getElementById('imgPreview').innerHTML = imgSrc ? '<img src="' + imgSrc + '" alt="">' : '<span style="font-size:28px;color:#ccc">Photo</span>';
  openModal('formModal');
}

function previewImg(input) {
  if (!input.files[0]) return;
  const reader = new FileReader();
  reader.onload = e => { document.getElementById('imgPreview').innerHTML = '<img src="' + e.target.result + '" alt="">'; };
  reader.readAsDataURL(input.files[0]);
}

async function saveProduct() {
  const id = document.getElementById('editId').value;
  const name = document.getElementById('fName').value.trim();
  const brand = document.getElementById('fBrand').value.trim();
  const category = document.getElementById('fCategory').value.trim();
  const price = document.getElementById('fPrice').value;
  const qty = document.getElementById('fQty').value;
  const imageFile = document.getElementById('imageFile').files[0];

  if (!name || !brand || !category || !price || !qty) { toast('Fill all required fields.', 'error'); return; }
  if (!id && !imageFile) { toast('Please select an image.', 'error'); return; }

  const productObj = {
    name: name,
    Brand: brand,
    category: category,
    price: parseFloat(price),
    quantity: parseInt(qty),
    description: document.getElementById('fDesc').value || '',
    available: document.getElementById('fAvailable').value === 'true',
    releaseDate: document.getElementById('fDate').value || '2000-01-01'
  };
  productObj.id = id ? parseInt(id) : 0;

  const btn = document.getElementById('saveBtn');
  btn.disabled = true;
  btn.innerHTML = 'Saving...';

  try {
    const fd = new FormData();
    fd.append('p', new Blob([JSON.stringify(productObj)], {type: 'application/json'}), 'product.json');

    if (imageFile) {
      fd.append('imageFile', imageFile, imageFile.name);
    } else {
      // Re-fetch existing image for PUT without image change
      const imgRes = await fetch(API + '/products/' + id + '/image');
      if (!imgRes.ok) { toast('Re-upload image to update product.', 'error'); btn.disabled=false; btn.textContent='Save Product'; return; }
      const imgBlob = await imgRes.blob();
      const existingP = allProducts.find(x => x.id === parseInt(id));
      fd.append('imageFile', imgBlob, (existingP && existingP.imagename) || 'image.jpg');
    }

    const url = id ? API + '/products/' + id : API + '/products';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {method: method, body: fd});
    const txt = await res.text();

    console.log('Status:', res.status, '| Response:', txt);

    if (!res.ok) {
      let msg = 'HTTP ' + res.status + ': ';
      try { const j = JSON.parse(txt); msg += j.message || j.error || txt; } catch(e) { msg += txt; }
      toast(msg.substring(0, 200), 'error');
      return;
    }
    toast(id ? 'Product updated!' : 'Product added!', 'success');
    closeModal('formModal');
    await loadProducts();
  } catch(e) {
    console.error(e);
    toast('Network error: ' + e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Product';
  }
}

function confirmDelete(id) {
  const p = allProducts.find(x => x.id === id);
  document.querySelector('.confirm-box p').textContent = 'Delete "' + (p ? p.name : 'this product') + '"? This cannot be undone.';
  document.getElementById('confirmDelBtn').onclick = () => doDelete(id);
  openModal('confirmModal');
}

async function doDelete(id) {
  try {
    const res = await fetch(API + '/products/' + id, {method: 'DELETE'});
    if (!res.ok) throw new Error('HTTP ' + res.status);
    toast('Product deleted.', 'success');
    closeModal('confirmModal');
    await loadProducts();
  } catch(e) {
    toast('Delete failed: ' + e.message, 'error');
  }
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function closeDetailIfOutside(e) { if (e.target.id === 'detailModal') closeModal('detailModal'); }
function closeFormIfOutside(e) { if (e.target.id === 'formModal') closeModal('formModal'); }

function toast(msg, type) {
  type = type || 'success';
  const c = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = (type === 'success' ? 'OK ' : 'ERR ') + '<span style="word-break:break-word">' + msg + '</span>';
  c.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 5000);
}

loadProducts();
