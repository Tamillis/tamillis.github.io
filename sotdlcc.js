const locked = checkId => Boolean(dom("#" + checkId).checked);

const rndSelect = selectId => {
    const select = dom("#" + selectId);
    select.value = rnd(Array.from(select.options)).value;
    return select.value;
};

function getOptionVia3D6(set) {
    const roll = threeD6();
    return set.find(option => roll <= option.value) ?? set.at(-1);
}

const currencyLabels = {
    cp: "copper pennies",
    ss: "silver shillings",
    gc: "gold crowns"
};

let sotdlcc = null;

const character = {
    name: null,
    nameSchema: null,
    gender: null,
    ancestry: null,
    ancestrySummary: null,
    effectResolutions: {},
    professions: [],
    equipment: null
};

function createAncestryConfig(summaryFields, health, defence) {
    return {
        createSummary: () => summaryFields.reduce((summary, { key, create }) => {
            summary[key] = create(summary);
            return summary;
        }, {}),
        summaryFields,
        health,
        defence
    };
}

const ancestryConfig = {
    human: createAncestryConfig([
        { label: "Background", key: "background", property: "background", create: () => rnd(sotdlcc.human.backgrounds) },
        { label: "Age", key: "age", property: "age", create: () => getOptionVia3D6(sotdlcc.human.ages) },
        { label: "Personality", key: "personality", property: "personality", create: () => getOptionVia3D6(sotdlcc.human.personalities) },
        { label: "Religion", key: "religion", property: "religion", create: () => getOptionVia3D6(sotdlcc.human.religions) },
        { label: "Build", key: "build", property: "build", create: () => getOptionVia3D6(sotdlcc.human.builds) },
        { label: "Appearance", key: "appearance", property: "appearance", create: () => getOptionVia3D6(sotdlcc.human.appearances) }
    ], data => data.attributes.strength, data => data.attributes.agility),
    clockwork: createAncestryConfig([
        { label: "Age", key: "age", property: "age", create: () => getOptionVia3D6(sotdlcc.clockwork.ages) },
        { label: "Background", key: "background", property: "background", create: () => rnd(sotdlcc.clockwork.backgrounds) },
        { label: "Personality", key: "personality", property: "personality", create: () => getOptionVia3D6(sotdlcc.clockwork.personalities) },
        { label: "Form", key: "form", property: "form", create: () => getOptionVia3D6(sotdlcc.clockwork.forms) },
        { label: "Purpose", key: "purpose", property: "purpose", create: () => rnd(sotdlcc.clockwork.purposes) },
        { label: "Appearance", key: "appearance", property: "appearance", create: () => getOptionVia3D6(sotdlcc.clockwork.appearances) }
    ], data => data.attributes.strength, data => data.defence),
    dwarf: createAncestryConfig([
        { label: "Background", key: "background", property: "background", create: () => rnd(sotdlcc.dwarf.backgrounds) },
        { label: "Age", key: "age", property: "age", create: () => getOptionVia3D6(sotdlcc.dwarf.ages) },
        { label: "Personality", key: "personality", property: "personality", create: () => getOptionVia3D6(sotdlcc.dwarf.personalities) },
        { label: "Hated Creature", key: "hatred", create: () => rnd(sotdlcc.dwarf.hatreds) },
        { label: "Build", key: "build", property: "build", create: () => getOptionVia3D6(sotdlcc.dwarf.builds) },
        { label: "Appearance", key: "appearance", property: "appearance", create: () => getOptionVia3D6(sotdlcc.dwarf.appearances) }
    ], data => data.health, data => data.attributes.agility),
    goblin: createAncestryConfig([
        { label: "Age", key: "age", property: "age", create: () => getOptionVia3D6(sotdlcc.goblin.ages) },
        { label: "Build", key: "build", property: "build", create: () => getOptionVia3D6(sotdlcc.goblin.builds) },
        { label: "Appearance", key: "appearance", property: "appearance", create: () => getOptionVia3D6(sotdlcc.goblin.appearances) }
    ], data => data.attributes.strength, data => data.attributes.agility),
    orc: createAncestryConfig([
        { label: "Age", key: "age", property: "age", create: () => getOptionVia3D6(sotdlcc.orc.ages) },
        { label: "Build", key: "build", property: "build", create: () => getOptionVia3D6(sotdlcc.orc.builds) },
        { label: "Appearance", key: "appearance", property: "appearance", create: () => getOptionVia3D6(sotdlcc.orc.appearances) }
    ], data => data.attributes.strength, data => data.attributes.agility),
    changeling: createAncestryConfig([
        { label: "Background", key: "background", property: "background", create: () => rnd(sotdlcc.changeling.backgrounds) },
        { label: "True Age", key: "trueAge", property: "age", create: () => getOptionVia3D6(sotdlcc.changeling.trueAges) },
        { label: "Apparent Gender", key: "apparentGender", property: "gender", create: () => getOptionVia3D6(sotdlcc.changeling.apparentGenders) },
        {
            label: "Apparent Ancestry",
            key: "apparentAncestry",
            create: () => {
                const result = getOptionVia3D6(sotdlcc.changeling.apparentAncestry);
                return result.ancestry === "random"
                    ? { ...result, selectedAncestry: rnd(getBorrowableAncestries()) }
                    : result;
            },
            render: renderApparentAncestry
        },
        {
            label: "Apparent Age",
            key: "apparentAge",
            property: "age",
            dependsOn: "apparentAncestry",
            create: summary => getOptionVia3D6(
                sotdlcc[getSelectedApparentAncestry(summary)].ages
            )
        },
        {
            label: "Apparent Build",
            key: "apparentBuild",
            property: "build",
            dependsOn: "apparentAncestry",
            create: summary => getOptionVia3D6(
                sotdlcc[getSelectedApparentAncestry(summary)].builds
            )
        },
        {
            label: "Apparent Appearance",
            key: "apparentAppearance",
            property: "appearance",
            dependsOn: "apparentAncestry",
            create: summary => getOptionVia3D6(
                sotdlcc[getSelectedApparentAncestry(summary)].appearances
            )
        },
        { label: "Quirk", key: "quirk", create: () => rnd(sotdlcc.changeling.quirks) },
        { label: "Personality", key: "personality", property: "personality", create: () => getOptionVia3D6(sotdlcc.changeling.personalities) }
    ], data => data.attributes.strength, data => data.attributes.agility)
};

document.addEventListener("DOMContentLoaded", () => {
    dom("#char-name-schema").addEventListener("change", newName);
    dom("#char-gender").addEventListener("change", newName);
    dom("#ancestries").addEventListener("change", () => {
        const config = updateAncestry(dom("#ancestries").value);
        calculateAndRenderCharacter(config);
    });

    fetch("./sotdlcc.json?v=20261021-changeling-ancestry", { cache: "no-store" })
        .then(res => res.json())
        .then(json => {
            sotdlcc = json;
            dom("#main").classList.remove("hidden");
            dom("#loading").classList.add("hidden");
            setAncestries();
            randomise();
        });
});

function setAncestries() {
    dom("#ancestries").replaceChildren();

    for (const ancestry of sotdlcc.ancestries) {
        dom("#ancestries").appendChild(
            el("option", { innerText: cap(ancestry), value: ancestry })
        );
    }
}

function newName() {
    character.nameSchema = dom("#char-name-schema").value;
    character.gender = dom("#char-gender").value;
    character.name = window.generateName(character.nameSchema, character.gender);
    dom("#char-name").innerText = character.name;
}

function randomise() {
    randomiseName();
    randomiseAncestry();
    randomiseProfessions();
    randomiseEquipment();
}

function randomiseName() {
    rndSelect("char-name-schema");
    rndSelect("char-gender");
    newName();
}

function randomiseAncestry() {
    const ancestry = rnd(sotdlcc.ancestries);
    dom("#ancestries").value = ancestry;
    const config = updateAncestry(ancestry, true);
    calculateAndRenderCharacter(config);
}

function randomiseAncestrySummary(key) {
    const config = ancestryConfig[character.ancestry];
    const field = config?.summaryFields.find(summaryField => summaryField.key === key);
    if (!field) return;

    character.ancestrySummary[key] = field.create(character.ancestrySummary);
    refreshDependentSummaryFields(config, key);
    clearEffectResolutions(`${character.ancestry}.summary.${key}.`);
    renderAncestrySummary(config);
    calculateAndRenderCharacter(config);
}

function refreshDependentSummaryFields(config, key) {
    for (const field of config.summaryFields) {
        if (field.dependsOn === key) {
            character.ancestrySummary[field.key] = field.create(character.ancestrySummary);
            clearEffectResolutions(`${character.ancestry}.summary.${field.key}.`);
        }
    }
}

function getBorrowableAncestries() {
    return sotdlcc.changeling.apparentAncestry
        .filter(option => option.ancestry !== "random")
        .map(option => option.ancestry);
}

function getSelectedApparentAncestry(summary) {
    const apparentAncestry = summary.apparentAncestry;
    return apparentAncestry.ancestry === "random"
        ? apparentAncestry.selectedAncestry
        : apparentAncestry.ancestry;
}

function renderApparentAncestry(row, field, option) {
    if (option.ancestry !== "random") {
        row.appendChild(el("p", { innerText: `${field.label}: ${option.startingForm}` }));
        return;
    }

    const select = document.createElement("select");
    select.className = "effect-choice-select";
    select.setAttribute("aria-label", "Choose an apparent ancestry");
    for (const ancestry of getBorrowableAncestries()) {
        select.appendChild(el("option", {
            value: ancestry,
            innerText: cap(ancestry)
        }));
    }
    select.value = option.selectedAncestry;
    select.addEventListener("change", event => {
        option.selectedAncestry = event.target.value;
        refreshDependentSummaryFields(ancestryConfig[character.ancestry], field.key);
        renderAncestrySummary(ancestryConfig[character.ancestry]);
        calculateAndRenderCharacter(ancestryConfig[character.ancestry]);
    });
    row.append(
        el("p", { innerText: `${field.label}: Choose an ancestry.` }),
        select
    );
}

function randomiseProfessions() {
    character.professions = [getProfessionChoice(), getProfessionChoice()];
    calculateAndRenderCharacter(ancestryConfig[character.ancestry]);
}

function randomiseEquipment() {
    character.equipment = getOptionVia3D6(sotdlcc.equipment);
    calculateAndRenderCharacter(ancestryConfig[character.ancestry]);
}

function updateAncestry(ancestry, ancestryWasRandomised = false) {
    const ancestryChanged = character.ancestry !== ancestry;
    character.ancestry = ancestry;

    const config = ancestryConfig[ancestry];
    const regenerateSummary =
        ancestryChanged ||
        ancestryWasRandomised ||
        !character.ancestrySummary;

    if (ancestryChanged || ancestryWasRandomised) {
        character.effectResolutions = {};
    } else if (regenerateSummary) {
        clearEffectResolutions(`${ancestry}.summary.`);
    }

    if (regenerateSummary) {
        character.ancestrySummary = config.createSummary();
    }

    renderAncestrySummary(config);
    return config;
}

function renderAncestrySummary(config) {
    dom("#ancestry-summary").replaceChildren();

    if (!character.ancestrySummary) return;

    for (const field of config.summaryFields) {
        const option = character.ancestrySummary[field.key];
        const row = el("div", { className: "ancestry-summary-field" });
        const button = el("button", {
            type: "button",
            className: "section-randomise no-print",
            innerText: "⚄",
            title: `Randomise ${field.label}`
        });
        button.setAttribute("aria-label", `Randomise ${field.label}`);
        button.addEventListener("click", () => randomiseAncestrySummary(field.key));
        row.appendChild(button);
        if (field.render) {
            field.render(row, field, option);
        } else {
            const text = field.property ? option[field.property] : option;
            row.appendChild(el("p", { innerText: `${field.label}: ${text}` }));
        }
        renderEffectChoices(
            row,
            option?.effects,
            `${character.ancestry}.summary.${field.key}`
        );
        dom("#ancestry-summary").appendChild(row);
    }

    for (const [talentIndex, talent] of sotdlcc[character.ancestry].talents.entries()) {
        const paragraph = el("p");
        paragraph.append(
            el("strong", { innerText: `${talent.name}: ` }),
            document.createTextNode(talent.description)
        );
        dom("#ancestry-summary").appendChild(paragraph);

        const choices = el("div", { className: "ancestry-talent-choices" });
        renderEffectChoices(choices, talent.effects, `${character.ancestry}.talent.${talentIndex}`);
        dom("#ancestry-summary").appendChild(choices);
    }
}

function getCharacterEffects() {
    const effects = [];
    const ancestry = sotdlcc[character.ancestry];

    for (const [talentIndex, talent] of ancestry.talents.entries()) {
        addEffects(effects, talent.effects, `talent.${talentIndex}`, talent.name);
    }

    for (const [summaryKey, option] of Object.entries(character.ancestrySummary ?? {})) {
        if (!option || typeof option !== "object") continue;
        addEffects(effects, option.effects, `summary.${summaryKey}`, cap(summaryKey));
    }

    return effects;
}

function addEffects(destination, effects, sourceKey, sourceLabel) {
    for (const [effectIndex, effect] of (effects ?? []).entries()) {
        destination.push({
            key: `${character.ancestry}.${sourceKey}.${effectIndex}`,
            sourceLabel,
            effect
        });
    }
}

function renderProfessions() {
    dom("#professions").replaceChildren();
    for (const [index, profession] of character.professions.entries()) {
        const row = el("div", { className: "profession-choice" });
        const typeSelect = document.createElement("select");
        typeSelect.setAttribute("aria-label", `Profession ${index + 1} type`);

        for (const type of Object.keys(sotdlcc.professions)) {
            typeSelect.appendChild(el("option", { innerText: type, value: type }));
        }
        typeSelect.value = profession.type;
        typeSelect.addEventListener("change", event => {
            profession.type = event.target.value;
            profession.name = rnd(sotdlcc.professions[profession.type]);
            renderProfessions();
        });

        const professionSelect = document.createElement("select");
        professionSelect.setAttribute("aria-label", `Profession ${index + 1}`);
        for (const name of sotdlcc.professions[profession.type]) {
            professionSelect.appendChild(el("option", { innerText: name, value: name }));
        }
        professionSelect.value = profession.name;
        professionSelect.addEventListener("change", event => {
            profession.name = event.target.value;
        });

        row.append(typeSelect, professionSelect);
        dom("#professions").appendChild(row);
    }
}

function renderEquipment() {
    if (!character.equipment) return;

    dom("#equipment-wealth").innerText = character.equipment.wealth;
    dom("#equipment-desc").innerText = character.equipment.description;
    dom("#equipment-ul").replaceChildren();

    for (const equipment of character.equipment.equipment) {
        dom("#equipment-ul").appendChild(el("li", { innerText: equipment }));
    }
}

function getProfession() {
    const profession = getProfessionChoice();
    return `${profession.type}: ${profession.name}`;
}

function getProfessionChoice() {
    const type = rnd(Object.keys(sotdlcc.professions));
    return {
        type,
        name: rnd(sotdlcc.professions[type])
    };
}

function calculateAndRenderCharacter(config) {
    const calculated = createBaseCharacter(config);
    const effects = getCharacterEffects();

    for (const item of effects) {
        applyEffect(calculated, item.effect, item.key);
    }

    renderProfessions();
    renderEquipment();
    renderCalculatedValues(calculated.values);
    renderCalculatedGrants(calculated.grants);
}

function createBaseCharacter(config) {
    const data = sotdlcc[character.ancestry];
    const sizes = Array.isArray(data.sizes) ? data.sizes : [data.sizes];
    const availableSizes = sizes.map(parseSize);
    const size = availableSizes.length === 1
        ? availableSizes[0]
        : availableSizes.includes(1) ? 1 : availableSizes[0];

    return {
        values: {
            ...data.attributes,
            health: config.health(data),
            defence: config.defence(data),
            perception: data.perceptionChange + data.attributes.intellect,
            insanity: 0,
            corruption: 0,
            speed: data.speed,
            power: data.power,
            size
        },
        grants: [],
        notes: []
    };
}

const effectHandlers = {
    adjust(calculated, effect, key) {
        const amount = resolveAmount(effect.amount, `${key}.amount`);
        calculated.values[effect.target] += amount;
    },

    set(calculated, effect) {
        calculated.values[effect.target] = effect.value;
    },

    grant(calculated, effect, key) {
        let resolvedValue = null;

        if (effect.target === "profession" && effect.method === "random") {
            const resolutionKey = `${key}.value`;
            resolvedValue = getEffectResolution(resolutionKey, effect);

            if (resolvedValue === null) {
                resolvedValue = getProfession();
                setEffectResolution(resolutionKey, effect, resolvedValue);
            }
        }

        calculated.grants.push({
            ...effect,
            key,
            resolvedAmount: effect.amount === undefined
                ? effect.count ?? 1
                : resolveAmount(effect.amount, `${key}.amount`),
            resolvedValue
        });
    },

    note(calculated, effect) {
        calculated.notes.push(effect.text);
    },

    choice(calculated, effect, key) {
        const selectedIndex = getEffectResolution(key, effect);
        if (selectedIndex === null) return;

        const selected = effect.options[selectedIndex];
        if (!selected) return;

        for (const [nestedIndex, nestedEffect] of (selected.effects ?? []).entries()) {
            applyEffect(calculated, nestedEffect, `${key}.choice.${selectedIndex}.${nestedIndex}`);
        }
    }
};

function applyEffect(calculated, effect, key) {
    const handler = effectHandlers[effect.type];
    if (!handler) {
        console.warn("EFFECT TYPE NOT FOUND:", effect.type, effect);
        return;
    }

    handler(calculated, effect, key);
}

function renderCalculatedValues(values) {
    renderSizeOptions(values.size);

    for (const [target, value] of Object.entries(values)) {
        if (value === null || value === undefined) continue;

        const elementId = target === "defence" ? "defense" : target;
        const element = document.querySelector("#" + elementId);
        if (element) element.value = value;
    }
}

function parseSize(size) {
    return size === "1/2" ? 0.5 : Number(size);
}

function renderSizeOptions(value) {
    const data = sotdlcc[character.ancestry];
    const sizes = Array.isArray(data.sizes) ? data.sizes : [data.sizes];
    const options = sizes.map(size => parseSize(size));

    if (value !== null && value !== undefined && !options.includes(value)) {
        options.push(value);
    }
    const select = dom("#size");
    select.replaceChildren(...options.map(size =>
        el("option", { value: String(size), innerText: formatValue(size) })
    ));
    select.value = String(value);
}

function renderCalculatedGrants(grants) {
    const languages = dom("#languages");
    languages.replaceChildren();

    const ancestry = sotdlcc[character.ancestry];
    appendP("languages", ancestry.languagesAndProfessions);

    for (const grant of grants) {
        if (grant.target === "profession" && grant.resolvedValue) {
            appendP("professions", `Additional: ${grant.resolvedValue}`);
        }

        if (grant.target === "language") {
            for (let index = 0; index < grant.resolvedAmount; index++) {
                renderLanguageGrant(languages, grant, index);
            }
        }

        if (grant.target === "item") {
            dom("#equipment-ul").appendChild(
                el("li", { innerText: `Additional: ${grant.name}` })
            );
        }

        if (grant.target === "currency") {
            const currency = currencyLabels[grant.denomination] ?? grant.denomination;
            dom("#equipment-ul").appendChild(
                el("li", { innerText: `Additional: ${grant.resolvedAmount} ${currency}` })
            );
        }
    }
}

function renderLanguageGrant(container, grant, index) {
    const key = `${grant.key}.language.${index}`;
    const select = document.createElement("select");
    select.className = "effect-choice-select";
    select.setAttribute("aria-label", `Additional language ${index + 1}`);

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.innerText = "Choose a language…";
    select.appendChild(placeholder);

    for (const language of sotdlcc.languages) {
        const option = document.createElement("option");
        option.value = language;
        option.innerText = language;
        select.appendChild(option);
    }

    const selectedLanguage = getEffectResolution(key, grant);
    select.value = selectedLanguage ?? "";
    select.addEventListener("change", event => {
        if (event.target.value === "") {
            delete character.effectResolutions[key];
        } else {
            setEffectResolution(key, grant, event.target.value);
        }

        calculateAndRenderCharacter(ancestryConfig[character.ancestry]);
    });

    const label = document.createElement("label");
    label.append(document.createTextNode("Additional language: "), select);
    container.appendChild(label);
}

function renderEffectChoices(container, effects = [], keyPrefix) {
    for (const [index, effect] of effects.entries()) {
        if (effect.type !== "choice") continue;

        const key = `${keyPrefix}.${index}`;
        const row = el("div", { className: "ancestry-effect-choice" });
        renderEffectChoice(row, effect, key);
        container.appendChild(row);

        const selectedIndex = getEffectResolution(key, effect);
        const selected = selectedIndex === null ? null : effect.options[selectedIndex];
        if (selected) {
            renderEffectChoices(
                container,
                selected.effects,
                `${key}.choice.${selectedIndex}`
            );
        }
    }
}

function renderEffectChoice(container, effect, key) {
    const prompt = document.createElement("span");
    prompt.className = "effect-prompt";
    prompt.innerText = effect.prompt + " ";
    container.appendChild(prompt);

    const select = document.createElement("select");
    select.className = "effect-choice-select";
    select.setAttribute("aria-label", effect.prompt);
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.innerText = "Choose…";
    select.appendChild(placeholder);

    for (const [index, option] of effect.options.entries()) {
        const optionElement = document.createElement("option");
        optionElement.value = index;
        optionElement.innerText = option.label;
        select.appendChild(optionElement);
    }

    const selectedIndex = getEffectResolution(key, effect);
    select.value = selectedIndex === null ? "" : selectedIndex;
    select.addEventListener("change", event => {
        if (event.target.value === "") {
            delete character.effectResolutions[key];
        } else {
            setEffectResolution(key, effect, Number(event.target.value));
        }

        renderAncestrySummary(ancestryConfig[character.ancestry]);
        calculateAndRenderCharacter(ancestryConfig[character.ancestry]);
    });

    container.appendChild(select);
}

function resolveAmount(amount, key) {
    if (typeof amount === "number") return amount;

    if (amount?.dice) {
        const existing = getEffectResolution(key, amount);
        if (existing !== null) return existing;

        const rolled = rollDice(amount.dice);
        setEffectResolution(key, amount, rolled);
        return rolled;
    }

    throw new Error("Invalid effect amount: " + JSON.stringify(amount));
}

function rollDice(notation) {
    const match = notation.match(/^(\d+)d(\d+)$/i);
    if (!match) throw new Error("Invalid dice notation: " + notation);

    const numberOfDice = Number(match[1]);
    const dieSize = Number(match[2]);
    let total = 0;

    for (let die = 0; die < numberOfDice; die++) {
        total += Math.floor(Math.random() * dieSize) + 1;
    }

    return total;
}

function getEffectResolution(key, effect) {
    const resolution = character.effectResolutions[key];
    if (!resolution) return null;
    return resolution.signature === JSON.stringify(effect) ? resolution.value : null;
}

function setEffectResolution(key, effect, value) {
    character.effectResolutions[key] = {
        signature: JSON.stringify(effect),
        value
    };
}

function clearEffectResolutions(keyPrefix) {
    for (const key of Object.keys(character.effectResolutions)) {
        if (key.startsWith(keyPrefix)) {
            delete character.effectResolutions[key];
        }
    }
}

function formatValue(value) {
    return value === 0.5 ? "1/2" : value;
}
