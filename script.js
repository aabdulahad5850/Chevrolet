document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        const preloader = document.querySelector(".box2");
        if (preloader) {
            preloader.classList.add("hide");
        }
    }, 900);

    const header = document.querySelector(".box20");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 40) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = themeToggle.querySelector("i");

    themeToggle.addEventListener("click", () => {
        if (document.body.classList.contains("light-mode")) {
            document.body.classList.remove("light-mode");
            themeIcon.classList.remove("fa-sun");
            themeIcon.classList.add("fa-moon");
        } else {
            document.body.classList.add("light-mode");
            themeIcon.classList.remove("fa-moon");
            themeIcon.classList.add("fa-sun");
        }
    });

    const statsSection = document.getElementById("statsSection");
    const counters = document.querySelectorAll(".box47, .box50, .box53, .box56");
    let countersStarted = false;

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersStarted) {
                countersStarted = true;
                counters.forEach(counter => {
                    const target = parseInt(counter.getAttribute("data-target"), 10);
                    const suffix = counter.getAttribute("data-suffix") || "";
                    const duration = 1800;
                    const startTime = performance.now();

                    function updateCounter(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const currentVal = Math.max(1, Math.floor(1 + (target - 1) * eased));
                        counter.textContent = currentVal + suffix;

                        if (progress < 1) {
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.textContent = target + suffix;
                        }
                    }

                    requestAnimationFrame(updateCounter);
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.35 });

    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    const sections = document.querySelectorAll("#models, #about, #specs, #tech, #reviews");
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    const toastBox = document.getElementById("toastBox");
    let toastTimer;

    function showToast(message) {
        toastBox.textContent = message;
        toastBox.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toastBox.classList.remove("show");
        }, 2400);
    }

    const cartToggle = document.getElementById("cartToggle");
    const cartDrawer = document.getElementById("cartDrawer");
    const closeCart = document.getElementById("closeCart");
    const cartItemsContainer = document.getElementById("cartItems");
    const cartCount = document.querySelector("#cartToggle span");
    const checkoutBtn = document.getElementById("checkoutBtn");

    const wishlistToggle = document.getElementById("wishlistToggle");
    const wishlistDrawer = document.getElementById("wishlistDrawer");
    const closeWishlist = document.getElementById("closeWishlist");
    const wishlistItemsContainer = document.getElementById("wishlistItems");
    const wishlistCount = document.querySelector("#wishlistToggle span");

    let cart = [];
    let wishlist = [];

    cartToggle.addEventListener("click", () => {
        cartDrawer.classList.add("active");
        wishlistDrawer.classList.remove("active");
    });

    closeCart.addEventListener("click", () => {
        cartDrawer.classList.remove("active");
    });

    wishlistToggle.addEventListener("click", () => {
        wishlistDrawer.classList.add("active");
        cartDrawer.classList.remove("active");
    });

    closeWishlist.addEventListener("click", () => {
        wishlistDrawer.classList.remove("active");
    });

    function addToCart(id, name, price) {
        const existing = cart.find(item => item.id === id);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ id, name, price, qty: 1 });
        }
        updateCart();
        updateWishlist();
    }

    const orderButtons = document.querySelectorAll(".box71, .box81, .box91, .box101");
    orderButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            const btn = e.currentTarget;
            if (btn.disabled) return;
            const originalText = btn.textContent;
            btn.textContent = "Loading...";
            btn.disabled = true;

            setTimeout(() => {
                const card = btn.closest("[data-id]");
                const id = card.getAttribute("data-id");
                const name = card.getAttribute("data-name");
                const price = card.getAttribute("data-price");

                addToCart(id, name, price);
                showToast(name + " — Zakas qilindi!");

                btn.textContent = "Zakas qilindi!";
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }, 1400);
            }, 2000);
        });
    });

    const wishlistCardButtons = document.querySelectorAll(".box65, .box75, .box85, .box95");
    wishlistCardButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const card = e.currentTarget.closest("[data-id]");
            const id = card.getAttribute("data-id");
            const name = card.getAttribute("data-name");
            const price = card.getAttribute("data-price");

            const index = wishlist.findIndex(item => item.id === id);
            if (index === -1) {
                wishlist.push({ id, name, price });
                e.currentTarget.classList.add("active");
                showToast(name + " — Sevimlilarga qo'shildi");
            } else {
                wishlist.splice(index, 1);
                e.currentTarget.classList.remove("active");
                showToast(name + " — Sevimlilardan olib tashlandi");
            }
            updateWishlist();
        });
    });

    function updateCart() {
        cartItemsContainer.innerHTML = "";
        const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
        cartCount.textContent = totalQty;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = "<p style='color: #a8a29e; text-align: center;'>Your cart is empty</p>";
            return;
        }

        let totalSum = 0;

        cart.forEach((item, index) => {
            const numPrice = parseInt(item.price.replace(/[^0-9]/g, ""), 10) || 0;
            totalSum += numPrice * item.qty;

            const itemElement = document.createElement("div");
            itemElement.classList.add("cart-item");
            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.price} &times; ${item.qty}</p>
                </div>
                <div class="qty-controls">
                    <button class="qty-btn" data-action="dec" data-index="${index}">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" data-action="inc" data-index="${index}">+</button>
                    <button class="remove-item" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        const totalBox = document.createElement("div");
        totalBox.style.cssText = "padding-top: 12px; font-weight: bold; display: flex; justify-content: space-between; color: #d97743;";
        totalBox.innerHTML = `<span>Jami:</span><span>$${totalSum.toLocaleString()}</span>`;
        cartItemsContainer.appendChild(totalBox);

        cartItemsContainer.querySelectorAll(".qty-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = parseInt(e.currentTarget.getAttribute("data-index"), 10);
                const action = e.currentTarget.getAttribute("data-action");
                if (action === "inc") {
                    cart[idx].qty += 1;
                } else {
                    cart[idx].qty -= 1;
                    if (cart[idx].qty <= 0) {
                        cart.splice(idx, 1);
                    }
                }
                updateCart();
                updateWishlist();
            });
        });

        cartItemsContainer.querySelectorAll(".remove-item").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = parseInt(e.currentTarget.getAttribute("data-index"), 10);
                cart.splice(idx, 1);
                updateCart();
                updateWishlist();
            });
        });
    }

    function updateWishlist() {
        wishlistItemsContainer.innerHTML = "";
        wishlistCount.textContent = wishlist.length;

        if (wishlist.length === 0) {
            wishlistItemsContainer.innerHTML = "<p style='color: #a8a29e; text-align: center;'>Your wishlist is empty</p>";
            return;
        }

        wishlist.forEach((item, index) => {
            const isOrdered = cart.some(c => c.id === item.id);
            const itemElement = document.createElement("div");
            itemElement.classList.add("wishlist-item");
            itemElement.innerHTML = `
                <div class="wishlist-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.price}</p>
                </div>
                <div class="wishlist-actions">
                    <button class="wish-order-btn ${isOrdered ? "ordered" : ""}" data-index="${index}">${isOrdered ? "Zakas qilindi" : "Order Now"}</button>
                    <button class="remove-wishlist" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            wishlistItemsContainer.appendChild(itemElement);
        });

        wishlistItemsContainer.querySelectorAll(".wish-order-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const targetBtn = e.currentTarget;
                if (targetBtn.disabled) return;
                const idx = parseInt(targetBtn.getAttribute("data-index"), 10);
                const item = wishlist[idx];

                targetBtn.textContent = "Loading...";
                targetBtn.disabled = true;

                setTimeout(() => {
                    addToCart(item.id, item.name, item.price);
                    showToast(item.name + " — Zakas qilindi!");
                }, 2000);
            });
        });

        wishlistItemsContainer.querySelectorAll(".remove-wishlist").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const index = parseInt(e.currentTarget.getAttribute("data-index"), 10);
                const removedItem = wishlist[index];

                const cards = document.querySelectorAll("[data-id]");
                cards.forEach(card => {
                    if (card.getAttribute("data-id") === removedItem.id) {
                        card.querySelector("button").classList.remove("active");
                    }
                });

                wishlist.splice(index, 1);
                updateWishlist();
            });
        });
    }

    checkoutBtn.addEventListener("click", (e) => {
        if (cart.length === 0) return;
        const btn = e.currentTarget;
        const originalText = btn.textContent;
        btn.textContent = "Loading...";
        btn.disabled = true;

        setTimeout(() => {
            cart = [];
            updateCart();
            updateWishlist();
            btn.textContent = originalText;
            btn.disabled = false;
            cartDrawer.classList.remove("active");
            showToast("Buyurtmangiz muvaffaqiyatli rasmiylashtirildi!");
        }, 2000);
    });

    updateCart();
    updateWishlist();
});