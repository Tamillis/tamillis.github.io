let locked = (checkId) => Boolean(dom("#" + checkId).checked);
let rndSelect = (selectId) => dom("#" + selectId).value = rnd(Array.from(dom("#" + selectId).options)).value;

let getOptionVia3D6 = (set) => {
    let result = set[0];
    let roll = threeD6();
    for (let option of set) {
        if (option.value <= roll) result = option;
    }
    return result;
};

let effectsMap = {
    AA: "Change any attribute by ",
    LANG: "You can speak one extra language.",
    READCOMMON: "You can read and write the Common Tongue",
    PROF: "You gain a profession of your choice.",
    STRENGTH: "Strength",
    AGILITY: "Agility",
    WILL: "Will",
    INTELLECT: "Intellect",
    INSANITY: "Insanity",
    CORRUPTION: "Corruption",
    HEALTH: "Health",
    DEFENCE: "Defence",
    SIZE: "Size",
    CP: "Copper Penny",
    SS: "Silver stirling",
    GC: "Gold Crown"
}

let sotdlcc = false;

document.addEventListener("DOMContentLoaded", () => {
    dom("#char-name-schema").addEventListener("change", (e) => {
        dom("#char-name").innerText = window.generateName(e.target.value, "Male");
    });

    fetch("./sotdlcc.json")
        .then(res => res.json())
        .then(json => {
            sotdlcc = json;
            dom("#main").classList.remove("hidden");
            dom("#loading").classList.add("hidden");
            setAncestries();
            setAttributes();
            randomise();
        });
});

function setAncestries() {
    for (let anc of sotdlcc.ancestries) {
        dom("#ancestries").appendChild(el("option", { innerText: cap(anc), value: anc }));
    }
}

function setAttributes(attributes) {
    for (let attr in attributes) {
        dom("#" + attr).value = attributes[attr];
    }
}

function newName() {
    let charSchema = dom("#char-name-schema").value;
    let charGender = dom("#char-gender").value;
    dom("#char-name").innerText = window.generateName(charSchema, charGender);
}

function randomise() {
    // npc
    let traitIsAdjectiveOdds = sotdlcc.npc.traitAdjectives.length / (sotdlcc.npc.traitAdjectives.length + sotdlcc.npc.traitNouns.length);
    let npc = "";
    if (chance(traitIsAdjectiveOdds)) {
        npc = `${rnd(sotdlcc.npc.traitAdjectives)} ${rnd(sotdlcc.npc.personalities)} ${rnd(sotdlcc.ancestries)} seeking ${rnd(sotdlcc.npc.motivations)}.`
    }
    else {
        npc = `${rnd(sotdlcc.npc.personalities)} ${rnd(sotdlcc.ancestries)} with ${rnd(sotdlcc.npc.traitNouns)} seeking ${rnd(sotdlcc.npc.motivations)}.`
    }

    if (["a", "e", "i", "o", "u"].includes(npc.slice(0, 1))) npc = "An " + npc;
    else npc = "A " + npc;

    dom("#npc").innerText = npc;

    let effects = [];

    //set name
    if (!locked("name-lock")) {
        rndSelect("char-name-schema")
        rndSelect("char-gender")

        newName();
    }

    //set ancestry
    let ancestry = dom("#ancestries").value;
    if (!locked("ancestry-lock")) {
        ancestry = rnd(sotdlcc.ancestries);
        dom("#ancestries").value = ancestry;
    }

    //generate ancestry summary for that species' tables
    if (!locked("ancestry-summary-lock")) {
        dom("#ancestry-summary").innerHTML = '';

        switch (ancestry) {
            case "human":
                humanSummary(effects);
                setAttributes(sotdlcc.human.attributes);
                dom('#health').value = sotdlcc.human.attributes.strength;
                dom('#defense').value = sotdlcc.human.attributes.agility;
                dom('#perception').value = sotdlcc.human.perceptionChange + sotdlcc.human.attributes.intellect;
                dom('#insanity').value = 0;
                break;

            case "clockwork":
                clockworkSummary(effects);
                setAttributes(sotdlcc.clockwork.attributes);
                dom('#health').value = sotdlcc.clockwork.attributes.strength;
                dom('#defense').value = 13;
                dom('#perception').value = sotdlcc.clockwork.perceptionChange + sotdlcc.clockwork.attributes.intellect;
                dom('#insanity').value = 0;
                break;

            case "dwarf":
                dwarfSummary(effects);
                setAttributes(sotdlcc.dwarf.attributes);
                dom("#health").value = sotdlcc.dwarf.health;
                dom("#defense").value = sotdlcc.dwarf.attributes.agility;
                dom('#perception').value = sotdlcc.dwarf.perceptionChange + sotdlcc.dwarf.attributes.intellect;
                dom('#insanity').value = 0;
                break;
        }
    }

    //set ancestry stats

    //generate professions
    if (!locked("professions-lock")) {
        dom("#professions").innerHTML = '';
        appendP("professions", getProfession());
        appendP("professions", getProfession());
    }

    // generate equipment
    if (!locked("equipment-lock")) {
        let equipment = getOptionVia3D6(sotdlcc.equipment);

        dom("#equipment-wealth").innerText = equipment.wealth;
        dom("#equipment-desc").innerText = equipment.description;

        dom("#equipment-ul").innerHTML = '';
        for (let equip of equipment.equipment) {
            let li = el("li", {innerText: equip});
            dom("#equipment-ul").appendChild(li);
        }
    }


    //generate paths
    // novice
    // expert
    // master

    dom("#effects-ul").innerHTML = '';
    for (let effect of effects) {
        parseEffect(effect)
        append("effects-ul", el("li", { innerText: effect }))
    }
}

function getProfession() {
    let professionIndex = D6() - 1;
    let profession = Object.keys(sotdlcc.professions)[professionIndex];
    return cap(profession) + ": " + rnd(sotdlcc.professions[profession]);
}

function humanSummary(effects) {
    let bg = rnd(sotdlcc.human.backgrounds);
    effects.push(bg.effect);
    appendP("ancestry-summary", "Background: " + bg.background);

    let age = getOptionVia3D6(sotdlcc.human.ages);
    appendP("ancestry-summary", "Age: " + age.age);

    let personality = getOptionVia3D6(sotdlcc.human.personalities);
    appendP("ancestry-summary", "Personality: " + personality.personality);

    let religion = getOptionVia3D6(sotdlcc.human.religions);
    appendP("ancestry-summary", "Religion: " + religion.religion);

    let build = getOptionVia3D6(sotdlcc.human.builds);
    appendP("ancestry-summary", "Build: " + build.build);

    let appearance = getOptionVia3D6(sotdlcc.human.appearances);
    appendP("ancestry-summary", "Appearance: " + appearance.appearance);
}

function clockworkSummary(effects) {
    let age = getOptionVia3D6(sotdlcc.clockwork.ages);
    appendP("ancestry-summary", "Age: " + age.age);

    let bg = rnd(sotdlcc.clockwork.backgrounds);
    bg.effects.forEach(effect => effect ? effects.push(effect) : null);
    appendP("ancestry-summary", "Background: " + bg.background);

    let personality = getOptionVia3D6(sotdlcc.clockwork.personalities);
    appendP("ancestry-summary", "Personality: " + personality.personality);

    let form = getOptionVia3D6(sotdlcc.clockwork.forms);
    form.effects.forEach(effect => effect ? effects.push(effect) : null);
    appendP("ancestry-summary", "Form: " + form.form);

    let purpose = rnd(sotdlcc.clockwork.purposes);
    if (purpose.effect) effects.push(purpose.effect);
    appendP("ancestry-summary", "Purpose: " + purpose.purpose);

    let appearance = getOptionVia3D6(sotdlcc.human.appearances);
    appendP("ancestry-summary", "Appearance: " + appearance.appearance);
}

function dwarfSummary(effects) {
    let bg = rnd(sotdlcc.dwarf.backgrounds);
    effects.push(bg.effect);
    appendP("ancestry-summary", "Background: " + bg.background);

    let age = getOptionVia3D6(sotdlcc.dwarf.ages);
    appendP("ancestry-summary", "Age: " + age.age);

    let personality = getOptionVia3D6(sotdlcc.dwarf.personalities);
    appendP("ancestry-summary", "Personality: " + personality.personality);

    let hatred = rnd(sotdlcc.dwarf.hatreds);
    appendP("ancestry-summary", "Hated Creature: " + hatred);

    let build = getOptionVia3D6(sotdlcc.dwarf.builds);
    appendP("ancestry-summary", "Build: " + build.build);

    let appearance = getOptionVia3D6(sotdlcc.dwarf.appearances);
    appendP("ancestry-summary", "Appearance: " + appearance.appearance);
}

function parseEffect(effect) {
    let bad = true;
    for (let keyword in effectsMap) {
        if (effect.startsWith(keyword)) {
            console.log("FOUND: " + keyword);
            bad = false;
        }
    }
    if (bad) console.warn("EFFECT NOT FOUND: " + effect);

    return !bad;
}
