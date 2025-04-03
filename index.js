const items = ["diamond_sword", "gold_sword", "iron_sword", "stone_sword", "wooden_sword", "golden_apple"];

const recipeSelector = document.getElementById("itemInput");
const recipeDropdown = document.querySelector(".itemAutoCompleteItems");

const autocompleteLimit = 4;

function calculateCrafting() {
    console.log("Crafting " + recipeSelector.value);
}

recipeSelector.addEventListener("input", function () {
    let value = this.value.toLowerCase();
    recipeDropdown.innerHTML = "";

    if (!value) return;

    value = value.replaceAll(" ", "_");

    const filtered = items.filter(item => item.toLowerCase().includes(value));

    let completionsAdded = 0;
    filtered.forEach(item => {
        if (completionsAdded >= autocompleteLimit) return;
        const div = document.createElement("div");
        div.classList.add("autocomplete-item");
        div.textContent = item.replaceAll("_", " ");
        div.addEventListener("click", () => {
            recipeSelector.value = item.replaceAll("_", " ");
            recipeDropdown.innerHTML = "";
        });
        recipeDropdown.appendChild(div);
        completionsAdded++;
    })
});

document.addEventListener("click", function (event) {
    if (!recipeSelector.contains(event.target) && !recipeDropdown.contains(event.target)) {
        recipeDropdown.innerHTML = "";
    }
});