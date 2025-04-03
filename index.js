let recipes = {};
let rng_drops = {};
let mob_drops = {};

fetch("./items.json")
    .then((response) => response.json())
    .then((data) => {
        recipes = Object.values(data["recipes"]).map(item => ({ ...item, category: "Recipe" }));
        rng_drops = Object.values(data["rng_drops"]).map(item => ({ ...item, category: "RNG Drop" }));
        mob_drops = Object.values(data["mob_drops"]).map(item => ({ ...item, category: "Mob Drop" }));
    });

const itemSelector = document.getElementById("itemInput");
const itemDropdown = document.querySelector(".itemAutoCompleteItems");
const autocompleteLimit = 4;

function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
}

itemSelector.addEventListener("input", function () {
    let value = this.value.toLowerCase().replaceAll(" ", "_");
    itemDropdown.innerHTML = "";

    if (!value) return;

    const allItems = [...recipes, ...rng_drops, ...mob_drops];

    const filteredItems = allItems.filter(item => item.name.toLowerCase().includes(value));

    let completionsAdded = 0;
    filteredItems.forEach(item => {
        if (completionsAdded >= autocompleteLimit) return;

        const div = document.createElement("div");
        div.classList.add("autocomplete-item");
        div.innerHTML = `<strong>${titleCase(item.name.replaceAll("_", " "))}</strong> <span style="color: gray;">(${item.category})</span>`;

        div.addEventListener("click", () => {
            itemSelector.value = titleCase(item.name.replaceAll("_", " "));
            itemSelector.dataset.category = item.category; // Store the category
            itemDropdown.innerHTML = "";
        });

        itemDropdown.appendChild(div);
        completionsAdded++;
    });
});

document.addEventListener("click", function (event) {
    if (!itemSelector.contains(event.target) && !itemDropdown.contains(event.target)) {
        itemDropdown.innerHTML = "";
    }
});

function calculateCrafting() {

}