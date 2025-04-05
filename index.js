/*
 * Copyright 2025 Jort Vlaming
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://www.apache.org/licenses/LICENSE-2.0
 */

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
            title.innerHTML = get_title_name(actual_item);

            let result = document.createElement("b");
            result.innerText = "Result quantity: " + actual_item["quantity"] * parseInt(quantityInput.value);

            let rawItemsText = document.createElement("b")
            rawItemsText.innerHTML = "Raw cost"
            let rawItems = document.createElement("ul")

            let treeText = document.createElement("b")
            treeText.innerHTML = "Crafting Tree"

            let rawItemsDict = {}

            tree.appendChild(title);
            tree.appendChild(result);
            tree.appendChild(document.createElement("br"));
            tree.appendChild(document.createElement("br"));
            tree.appendChild(rawItemsText);
            tree.appendChild(rawItems);
            tree.appendChild(document.createElement("br"));
            tree.appendChild(document.createElement("br"));
            tree.appendChild(treeText)

            function get_title_name(item) {
                if (item["display_name"] !== null && item["display_name"] !== undefined) return item["display_name"]
                return titleCase(item["name"].toLowerCase().replaceAll("_", " "))
            }

            function create_tree(item_name, depth, multiplier) {
                let item = get_item(item_name);
                if (item === undefined) {
                    return;
                }
                item = item[0];
                for (const [key, value] of Object.entries(item["components"])) {
                    let i = get_item(key);
                    i = i[0]
                    if (i === undefined) {
                        let current = document.createElement("p");
                        current.innerText = "⠀".repeat(depth*2) + " - " + titleCase(key.replaceAll("_", " ")) + " x " + value * multiplier;
                        tree.appendChild(current);
                        if (rawItemsDict[key] !== undefined && rawItemsDict[key] !== null) {
                            rawItemsDict[key] += value * multiplier;
                        } else {
                            rawItemsDict[key] = value * multiplier;
                        }
                        console.log(rawItemsDict)
                        continue;
                    }
                    let current = document.createElement("p");
                    current.innerText = "⠀".repeat(depth*2) + " - " + get_title_name(i) + " x " + value * multiplier;
                    tree.appendChild(current);
                    if (i["category"] === "RNG Drop") {
                        let sources = rng_drops.filter(drop => drop.name.toLowerCase().replaceAll(" ", "_") === i["name"].toLowerCase().replaceAll(" ", "_"))
                        sources.forEach(item => {
                            let source = document.createElement("p");
                            if (item["minimumDrop"] === item["maximumDrop"])
                                source.innerText = "⠀".repeat((depth+1)*2) + " - " + item.source + " -> " + item["minimumDrop"] + "x - " + item["maximumDrop"] + "x (" + item["chance"] + ")";
                            else
                                source.innerText = "⠀".repeat((depth+1)*2) + " - " + item.source + " -> " + item["minimumDrop"] + "x - " + item["maximumDrop"] + "x (" + item["chance"] + ")";
                            tree.appendChild(source)
                        })
                    }
                    else if (i["category"] === "Mob Drop") {
                        let sources = mob_drops.filter(item => item.name.toLowerCase().replaceAll(" ", "_") === i["name"].toLowerCase().replaceAll(" ", "_"));
                        sources.forEach(item => {
                            let source = document.createElement("p");
                            if (item["minimumDrop"] === item["maximumDrop"])
                                source.innerText = "⠀".repeat((depth+1)*2) + " - " + item.source + " -> " + item["minimumDrop"] + "x - " + item["maximumDrop"] + "x (" + item["chance"] + ")";
                            else
                                source.innerText = "⠀".repeat((depth+1)*2) + " - " + item.source + " -> " + item["minimumDrop"] + "x - " + item["maximumDrop"] + "x (" + item["chance"] + ")";
                            tree.appendChild(source)
                        })
                    }
                    else if (Object.keys(i["components"]).length > 0) {
                        console.log("Creating tree for " + i["name"] + " with a quantity of " + value + " and multiplier of " + value * multiplier)
                        create_tree(i["name"], depth + 1, value * multiplier);
                    }
                    else {
                        if (rawItemsDict[get_title_name(i["name"])] !== undefined && rawItemsDict[get_title_name(i["name"])] !== null) {
                            rawItemsDict[get_title_name(i["name"])] += value * multiplier;
                        } else {
                            rawItemsDict[get_title_name(i["name"])] = value * multiplier;
                        }
                        console.log(rawItemsDict)
                    }
                }
            }

            create_tree(actual_item.name, 0, parseInt(quantityInput.value));

            console.log(rawItemsDict);
            for (const [iKey, iValue] of Object.entries(rawItemsDict)) {
                console.log(iKey, iValue);
                let r = document.createElement("li")
                r.innerHTML = titleCase(iKey.replaceAll("_", " ")) + " x " + iValue;
                rawItems.appendChild(r);
            }

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
                chance.innerHTML = "Drop chance: " + item["chance"];

                let amount = document.createElement("p");
                if (item["minimumDrop"] === item["maximumDrop"]) {
                    amount.innerHTML = "Drop amount: " + item["minimumDrop"] + "x";
                } else {
                    amount.innerHTML = "Drop amount: " + item["minimumDrop"] + "x - " + item["maximumDrop"] + "x";
                }

                tree.appendChild(source);
                tree.appendChild(chance);
                tree.appendChild(amount);
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