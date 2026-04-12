import DWARF from "./nameSchemas/dwarf.json" with { type: "json" };
import ELF from "./nameSchemas/elf.json" with { type: "json" };
import HUMAN from "./nameSchemas/human.json" with { type: "json" };
import HALFLING from "./nameSchemas/halfling.json" with { type: "json" };
import MONSTER from "./nameSchemas/monster.json" with { type: "json" };

function makeSyllable(schema) {
  const onset = chance(schema.onsetChance) ? rnd(schema.onsets) : "";
  const nucleus = rnd(schema.nuclei);
  const coda = chance(schema.codaChance) ? rnd(schema.codas) : "";
  return onset + nucleus + coda;
}

function makeStem(schema, syllables) {
  let stem = "";

  for (let i = 0; i < syllables; i++) {
    if (i == 0) {
      stem += cap(makeSyllable(schema));
    } 
    else {
      stem += makeSyllable(schema).toLowerCase();
    }
  }

  return stem;
}

function makeGivenName(schema, gender) {
  if (gender != "Male" && gender != "Female" && gender != "Other")
    throw new Error('gender must be one of "Male", "Female", "Other"');

  const syllables = weightedPickIndex(schema.weights.syllables);

  let givenName = makeStem(schema, syllables).toLowerCase();

  if (chance(schema.endingChance)) {
    givenName += rnd(schema.givenEndings[gender]);
  }

  if(givenName.length < 2) givenName = makeGivenName(schema, gender);

  return cap(givenName);
}

function makeFamilyName(schema) {
  if (chance(schema.family.compoundChance)) {
    return cap((rnd(schema.family.clanStarts) + rnd(schema.family.clanEnds)).toLowerCase());
  }

  const syllables = weightedPickIndex(schema.weights.syllables);
  let familyName = syllables == 1 ? makeStem(schema, 1) : makeStem(schema, syllables - 1) + rnd(schema.family.familySuffixes);
  
  if(familyName.length < 2) familyName = makeFamilyName(schema);

  return familyName;
}

export const NAME_SCHEMAS = { DWARF, ELF, HUMAN, HALFLING, MONSTER };

// Generic API:
export function generateName(race, gender) {
  const schema = NAME_SCHEMAS[race.trim().toUpperCase()];
  if (!schema) throw new Error(`Unknown race "${race}". Use one of: ${Object.keys(NAME_SCHEMAS).join(", ")}`);

  let name = `${makeGivenName(schema, gender)} ${makeFamilyName(schema)}` ;
    // Cleanup rules are schema-defined so each culture can be tuned.
  if (schema.cleanup?.collapseVowels) {
    name = name.replace(new RegExp(schema.cleanup.collapseVowels, "g"), "$1");
  }
  if (schema.cleanup?.collapseConsonants) {
    name = name.replace(new RegExp(schema.cleanup.collapseConsonants, "gi"), "$1");
  }

  return name;
}

window.generateName = generateName;