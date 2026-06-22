function dom(selector) {
    return selector ? (document.getElementById(selector) || document.querySelector(selector)) : document;
}

function doms(selector) {
    return document.querySelectorAll(selector);
}

function el(tag, attr) {
    let elment = document.createElement(tag);
    for (let prop in attr) {
        elment[prop] = attr[prop];
    }
    return elment;
}

function append(parentId, element) {
    dom("#" + parentId).appendChild(element);
}

function appendP(parentId, text) {
    append(parentId, el("p", { innerText: text }));
}

function rnd(input) {
    if (Array.isArray(input)) 
        return input[Math.floor(Math.random() * input.length)];
    else 
        return Math.floor(Math.random() * Number(input) + 1);
}

function D6() {
    return rnd(6);
}
function threeD6() { 
    return D6() + D6() + D6(); 
}

function chance(p) {
    return Math.random() < p;
}

function cap(s) {
    return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function weightedPickIndex(weights) {
  const buckets = [];
  let i = 1;
  for (let weight of weights) {
    for (let n = 0; n < weight; n++) buckets.push(i);
    i++;
  }

  return rnd(buckets);
}