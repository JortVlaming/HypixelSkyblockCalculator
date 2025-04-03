let recipes = {};
let rng_drops = {};
let mob_drops = {};

fetch("./items.json")
    .then((response) => response.json())
    .then((data) => {
        recipes = data["recipes"];
        rng_drops = data["rng_drops"]
        mob_drops = data["mob_drops"]
    });

const recipeSelector = document.getElementById("itemInput");
const recipeDropdown = document.querySelector(".itemAutoCompleteItems");

const autocompleteLimit = 4;

function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
}

function calculateCrafting() {
    console.log("Crafting " + recipeSelector.value);
}

recipeSelector.addEventListener("input", function () {
    let value = this.value.toLowerCase();
    recipeDropdown.innerHTML = "";

    if (!value) return;

    value = value.replaceAll(" ", "_");

    const filteredRecipes = recipes.filter(item => item.name.toLowerCase().includes(value.toLowerCase().replaceAll(" ", "_")));

    let completionsAdded = 0;
    Object.keys(filteredRecipes).forEach(item => {
        item = filteredRecipes[item]
        if (completionsAdded >= autocompleteLimit) return;
        const div = document.createElement("div");
        div.classList.add("autocomplete-item");
        div.textContent = titleCase(item["name"].replaceAll("_", " "));
        div.addEventListener("click", () => {
            recipeSelector.value = item["name"].replaceAll("_", " ");
            recipeDropdown.innerHTML = "";
        });
        recipeDropdown.appendChild(div);
        completionsAdded++;
    });
});

document.addEventListener("click", function (event) {
    if (!recipeSelector.contains(event.target) && !recipeDropdown.contains(event.target)) {
        recipeDropdown.innerHTML = "";
    }
});