const jokeContent = document.getElementById("jokeContent");
const categoryLabel = document.getElementById("category");
const loading = document.getElementById("loading");
const newJokeBtn = document.getElementById("newJoke");
const feedback = document.getElementById("feedback");
const saveBtn = document.getElementById("saveBtn");

let currentJoke = null;
let selectedCategory = "Any";

let favorites = JSON.parse(
    localStorage.getItem("favoriteJokes") || "[]"
);

// GET JOKE FROM API
async function getJoke() {

    loading.classList.add("show");
    jokeContent.style.display = "none";
    newJokeBtn.disabled = true;
    feedback.textContent = "";
    saveBtn.textContent = "♡ Save";
    saveBtn.classList.remove("saved");

    const url = `https://v2.jokeapi.dev/joke/${selectedCategory}?safe-mode`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("API connection failed");
        }

        const data = await response.json();

        if (data.error) {
            throw new Error("Joke unavailable");
        }

        currentJoke = {
            id: data.id,
            category: data.category,
            joke: data.type === "single"
                ? data.joke
                : data.setup + "\n\n" + data.delivery
        };

        categoryLabel.textContent = data.category.toUpperCase();

        jokeContent.textContent = currentJoke.joke;

        updateSaveButton();

    } catch (error) {

        currentJoke = null;
        jokeContent.textContent =
            "Oops! The jokes are taking a little break. Please check your internet and try again!";

        categoryLabel.textContent = "CONNECTION ERROR";
        feedback.textContent = "⚠ Unable to load a joke right now.";

    } finally {

        loading.classList.remove("show");
        jokeContent.style.display = "flex";
        newJokeBtn.disabled = false;

    }
}

// CATEGORY SELECTION
document.querySelectorAll(".category").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".category").forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        selectedCategory = button.dataset.category;

        getJoke();
    });

});

// NEW JOKE BUTTON
newJokeBtn.addEventListener("click", getJoke);

// COPY JOKE
document.getElementById("copyBtn").addEventListener("click", async () => {

    if (!currentJoke) {
        feedback.textContent = "Get a joke first!";
        return;
    }

    try {
        await navigator.clipboard.writeText(currentJoke.joke);
        feedback.textContent = "✦ Joke copied successfully!";
    } catch {
        feedback.textContent = "Copy is unavailable in this browser.";
    }

});

// SAVE FAVORITE JOKE
saveBtn.addEventListener("click", () => {

    if (!currentJoke) {
        feedback.textContent = "Get a joke first!";
        return;
    }

    const exists = favorites.some(
        item => item.id === currentJoke.id
    );

    if (exists) {
        feedback.textContent = "Already saved in favourites!";
        return;
    }

    favorites.push(currentJoke);

    localStorage.setItem(
        "favoriteJokes",
        JSON.stringify(favorites)
    );

    feedback.textContent = "♡ Added to your favourites!";

    updateSaveButton();
    displayFavorites();

});

// UPDATE SAVE BUTTON
function updateSaveButton() {

    if (!currentJoke) return;

    const exists = favorites.some(
        item => item.id === currentJoke.id
    );

    saveBtn.textContent = exists ? "♥ Saved" : "♡ Save";
    saveBtn.classList.toggle("saved", exists);
}

// DISPLAY FAVORITES
function displayFavorites() {

    const list = document.getElementById("favoritesList");

    document.getElementById("favoriteCount").textContent =
        `${favorites.length} SAVED`;

    if (favorites.length === 0) {
        list.innerHTML =
            '<p class="empty">Your favourite jokes will appear here. ♡</p>';
        return;
    }

    list.innerHTML = "";

    favorites.forEach(item => {

        const card = document.createElement("div");
        card.className = "favorite-item";

        const jokeText = document.createElement("span");
        jokeText.textContent = item.joke;

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "♥ Remove";

        removeBtn.addEventListener("click", () => {

            favorites = favorites.filter(
                joke => joke.id !== item.id
            );

            localStorage.setItem(
                "favoriteJokes",
                JSON.stringify(favorites)
            );

            displayFavorites();
            updateSaveButton();

        });

        card.appendChild(jokeText);
        card.appendChild(removeBtn);

        list.appendChild(card);

    });

}

// INITIALIZE APP
displayFavorites();
getJoke();