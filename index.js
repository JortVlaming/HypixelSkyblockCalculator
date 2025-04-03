let recipes = {};
let rng_drops = {};
let mob_drops = {};
let all_items = []

fetch("./items.json")
    .then((response) => response.json())
    .then((data) => {
        recipes = Object.values(data["recipes"]).map(item => ({ ...item, category: "Recipe" }));
        rng_drops = Object.values(data["rng_drops"]).map(item => ({ ...item, category: "RNG Drop" }));
        mob_drops = Object.values(data["mob_drops"]).map(item => ({ ...item, category: "Mob Drop" }));
        allItems = [...recipes, ...rng_drops, ...mob_drops];
    });

const itemSelector = document.getElementById("itemInput");
itemSelector.value = "";
const itemDropdown = document.querySelector(".itemAutoCompleteItems");
const autocompleteLimit = 4;

const tree = document.getElementById("crafting-tree");

function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
}

function findExactMatch(value) {
    const normalizedValue = value.toLowerCase().replaceAll(" ", "_");

    return allItems.find(item => item.name.toLowerCase() === normalizedValue);
}

itemSelector.addEventListener("input", function () {
    let value = this.value.toLowerCase().replaceAll(" ", "_");
    itemDropdown.innerHTML = "";

    if (!value) return;

    const exactMatch = findExactMatch(value);
    if (exactMatch) {
        itemSelector.dataset.category = exactMatch.category;
    } else {
        itemSelector.dataset.category = "";
    }

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
    tree.innerHTML = "";
    switch (itemSelector.dataset.category) {
        case "Recipe": {

            break;
        }
        case "RNG Drop": {
            let actual_item = rng_drops.filter(item => item.name.toLowerCase().replaceAll(" ", "_") === itemSelector.value.toLowerCase().replaceAll(" ", "_"));
            if (actual_item.length === 0) {
                return;
            }
            if (actual_item.length === 1) {
                let item = actual_item[0];
                let title = document.createElement("h1")
                title.innerHTML = titleCase(item.name);

                let source = document.createElement("b")
                source.innerHTML = "Source: " + item.source;

                let chance = document.createElement("p");
                chance.innerHTML = "Drop chance: " + item.chance;

                tree.appendChild(title);
                tree.appendChild(source);
                tree.appendChild(chance);
            } else {
                let title = document.createElement("h1")
                title.innerHTML = titleCase(actual_item[0].name);
                tree.appendChild(title);
                actual_item.forEach(item => {
                    let source = document.createElement("b")
                    source.innerHTML = "Source: " + item.source;
                    
                    let separator = document.createElement("div");
                    separator.classList.add("inputSpacer");

                    let chance = document.createElement("p");
                    chance.innerHTML = "Drop chance: " + item.chance;

                    tree.appendChild(source);
                    tree.appendChild(chance);
                    tree.appendChild(separator);
                })
            }

            break;
        }
        case "Mob Drop": {

            break;
        }
    }
}