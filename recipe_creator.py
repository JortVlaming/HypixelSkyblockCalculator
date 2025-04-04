#!/bin/python3
import itertools
# Copyright 2025 Jort Vlaming
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import json
import os
import time
from typing import Tuple, Dict, List


def clear():
    if "TERM" not in os.environ:
        return
    os.system("cls" if os.name == "nt" else "clear")

def load() -> Tuple[Dict[str, Dict], Dict[str, List[Dict]], Dict[str, List[Dict]]]:
    recipes = {}
    rng_drops = {}
    mob_drops = {}

    with open("items.json", "r") as jsonFile:
        data = json.load(jsonFile)

        name = lambda original: original.lower().replace(" ", "_")

        for recipe in data["recipes"]:
            print("Recipe", recipe)
            recipes[name(recipe["name"])] = recipe

        for drop in data["rng_drops"]:
            print("RNG", drop)
            n = name(drop["name"])
            if n not in rng_drops:
                rng_drops[n] = []
            rng_drops[n].append(drop)

        for drop in data["mob_drops"]:
            print("Mob", drop)
            n = name(drop["name"])
            if n not in mob_drops:
                mob_drops[n] = []
            mob_drops[n].append(drop)

        jsonFile.close()

    return recipes, rng_drops, mob_drops

def save(recipes: Dict[str, Dict], rng_drops: Dict[str, List[Dict]], mob_drops: Dict[str, List[Dict]]):
    savable_dict = {
        "recipes": list(recipes.values()),
        "rng_drops": list(itertools.chain.from_iterable(rng_drops.values())),
        "mob_drops": list(itertools.chain.from_iterable(mob_drops.values()))
    }

    with open("items.json", "w") as jsonFile:
        # noinspection PyTypeChecker
        json.dump(savable_dict, jsonFile, indent=2)
        jsonFile.flush()
        jsonFile.close()

    print(savable_dict)

    input("Press enter to continue...")

def safe_input(prompt: str, expected_type: type = str):
    while True:
        user_input = input(prompt)
        try:
            return expected_type(user_input)
        except ValueError:
            print(f"Invalid input! Please enter a valid {expected_type.__name__}.")

def create_recipe(recipes):
    clear()

    name = safe_input("Name of the item >> ", str)
    result_amount = safe_input("Result amount of craft >> ", int)

    print("")
    print("Please enter components in the item, type 'done' to exit")
    print("")

    s = None

    components = {}

    while s is None or s != "done":
        s = safe_input("Name of the component >> ", str).lower().replace(" ", "_")
        if s == "done":
            print("")
            break
        if s in components:
            print("Component is already in the recipe! Current amount is: " + str(components[s]))
        a = safe_input("Amount of the component needed >> ", int)
        print("")

        components[s] = a

    recipes[name.lower().replace(" ", "_")] = {
        "name": name.lower().replace(" ", "_"),
        "quantity": result_amount,
        "components": components
    }

    print("Recipe for " + name + " created!")
    time.sleep(1)

def create_rng_drop(rng_drops):
    clear()

    name = safe_input("Name of the item >> ", str)
    normalized_name = name.lower().replace(" ", "_")

    if normalized_name in rng_drops:
        sources = [("- " + source["source"] + ", chance: " + source["chance"]) for source in rng_drops[normalized_name]]

        print(f"{name} is already found in:")

        [print(source) for source in sources]

        print("To cancel the addition type 'cancel'")

    source = safe_input("Source of the item >> ", str)
    if source == "cancel":
        return
    minimum_amount = safe_input("Minimum amount of the item that is dropped >> ", int)
    maximum_amount = safe_input("Maximum amount of the item that is dropped >> ", int)
    chance = safe_input("Chance that the item is dropped (1 in X) >> ", int)

    chance = f"1 in {chance} ({(1/chance*100):.5f}%)"

    if normalized_name not in rng_drops:
        rng_drops[normalized_name] = []

    rng_drops[normalized_name].append({
        "name": name,
        "source": source,
        "minimumDrop": minimum_amount,
        "maximumDrop": maximum_amount,
        "chance": chance
    })

    print("RNG drop for " + name + " created! " + chance)
    input("Press enter to continue...")

def create_mob_drop(mob_drops):
    clear()

    name = safe_input("Name of the item >> ", str)
    normalized_name = name.lower().replace(" ", "_")

    if normalized_name in mob_drops:
        sources = [("- " + source["source"] + ", chance: " + source["chance"]) for source in mob_drops[normalized_name]]

        print(f"{name} is already dropped by:")

        [print(source) for source in sources]

        print("To cancel the addition type 'cancel'")

    source = safe_input("Entity that drops this item >> ", str)
    if source == "cancel":
        return
    minimum_amount = safe_input("Minimum amount of the item that is dropped >> ", int)
    maximum_amount = safe_input("Maximum amount of the item that is dropped >> ", int)
    chance = safe_input("Chance that the item is dropped (1 in X) >> ", int)

    chance = f"1 in {chance} ({(1/chance*100):.5f}%)"

    if normalized_name not in mob_drops:
        mob_drops[normalized_name] = []

    mob_drops[normalized_name].append({
        "name": name,
        "source": source,
        "minimumDrop": minimum_amount,
        "maximumDrop": maximum_amount,
        "chance": chance
    })

    print("Mob drop for " + name + " created! " + chance)
    input("Press enter to continue...")

def main():
    clear()

    recipes, rng_drops, mob_drops = load()

    print(recipes, rng_drops, mob_drops)

    input("Press enter to continue...")

    while True:
        clear()

        print("1. Create recipe")
        print("2. Create RNG drop")
        print("3. Create Mob drop")
        print("4. Reload (Discard unsaved changes)")
        print("5. Save")
        print("6. Save & Exit")
        print("7. Exit")
        print("8. Print all")

        match (input("Enter command >> ")):
            case "1":
                create_recipe(recipes)
            case "2":
                create_rng_drop(rng_drops)
            case "3":
                create_mob_drop(mob_drops)
            case "4":
                recipes, rng_drops, mob_drops = load()
            case "5":
                save(recipes, rng_drops, mob_drops)
            case "6":
                save(recipes, rng_drops, mob_drops)
                break
            case "7":
                break
            case "8":
                print(recipes)
                print(rng_drops)
                print(mob_drops)

                input("Press enter to continue...")
            case _:
                print("That is not an option!")
                time.sleep(1)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        pass
    except Exception as e:
        raise e
