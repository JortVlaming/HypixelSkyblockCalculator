let recipes = {};
let rng_drops = {};
let mob_drops = {};
let allItems = []

fetch("./items.json")
    .then((response) => response.json())
    .then((data) => {
        recipes = Object.values(data["recipes"]).map(item => ({ ...item, category: "Recipe" }));
        rng_drops = Object.values(data["rng_drops"]).map(item => ({ ...item, category: "RNG Drop" }));
        mob_drops = Object.values(data["mob_drops"]).map(item => ({ ...item, category: "Mob Drop" }));
        allItems = [...recipes, ...rng_drops, ...mob_drops];
        console.log(allItems);
    });

const itemSelector = document.getElementById("itemInput");
const quantityInput = document.getElementById("itemQuantityInput");
itemSelector.value = "";
const itemDropdown = document.querySelector(".itemAutoCompleteItems");
const autocompleteLimit = 10;

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
            function get_item(item_name) {
                return allItems.filter(item => item.name.toLowerCase().replaceAll(" ", "_") === item_name.toLowerCase().replaceAll(" ", "_"));
            }
            let actual_item = get_item(itemSelector.value);

            actual_item = actual_item[0];

            let title = document.createElement("h1");
            title.innerHTML = titleCase(actual_item.name.replaceAll("_", " "));

            let result = document.createElement("b");
            result.innerText = "Result quantity: " + actual_item.quantity * parseInt(quantityInput.value);

            tree.appendChild(title);
            tree.appendChild(result);
            tree.appendChild(document.createElement("br"));
            tree.appendChild(document.createElement("br"));

            function create_tree(item_name, depth) {
                let item = get_item(item_name);
                if (item === undefined) {
                    return;
                }
                item = item[0];
                for (const [key, value] of Object.entries(item["components"])) {
                    let i = get_item(key);
                    console.log(depth + " " + key + " " + value)
                    i = i[0]
                    if (i === undefined) {
                        let current = document.createElement("p");
                        current.innerText = "⠀".repeat(depth*2) + " - " + titleCase(key.replaceAll("_", " ")) + " x " + value * parseInt(quantityInput.value);
                        tree.appendChild(current);
                        continue;
                    }
                    let current = document.createElement("p");
                    current.innerText = "⠀".repeat(depth*2) + " - " + titleCase(i["name"].replaceAll("_", " ")) + " x " + value * parseInt(quantityInput.value);
                    tree.appendChild(current);
                    if (Object.keys(i["components"]).length > 0) {
                        create_tree(i["name"], depth + 1);
                    }
                }
            }

            create_tree(actual_item.name, 0);

            break;
        }
        case "RNG Drop": {
            let actual_item = rng_drops.filter(item => item.category === "RNG Drop" && item.name.toLowerCase().replaceAll(" ", "_") === itemSelector.value.toLowerCase().replaceAll(" ", "_"));
            if (actual_item.length === 0) {
                return;
            }
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
            });

            break;
        }
        case "Mob Drop": {
            let actual_item = mob_drops.filter(item => item.category === "Mob Drop" && item.name.toLowerCase().replaceAll(" ", "_") === itemSelector.value.toLowerCase().replaceAll(" ", "_"));
            if (actual_item.length === 0) {
                return;
            }
            let title = document.createElement("h1")
            title.innerHTML = titleCase(actual_item[0].name);
            tree.appendChild(title);
            actual_item.forEach(item => {
                let source = document.createElement("b")
                source.innerHTML = "Entity: " + item.source;

                let separator = document.createElement("div");
                separator.classList.add("inputSpacer");

                let dropAmount = document.createElement("p");

                if (item.minimumDrop === item.maximumDrop) {
                    dropAmount.innerHTML = "Drop Amount: " + item.minimumDrop + "x";
                } else {
                    dropAmount.innerHTML = "Drop Amount: " + item.minimumDrop + "x - " + item.maximumDrop + "x";
                }

                let chance = document.createElement("p");
                chance.innerHTML = "Drop chance: " + item.chance;

                tree.appendChild(source);
                tree.appendChild(dropAmount);
                tree.appendChild(chance);
                tree.appendChild(separator);
            });
            break;
        }
    }
}