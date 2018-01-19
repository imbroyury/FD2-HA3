"use strict";

let addZoneControls = document.getElementById('add-zone-controls'),
    addTagInputField = document.getElementById('add-tag-input-field'),
    addTagBtn = document.getElementById('add-tag-btn'),
    addedTagsContainer = document.getElementById('added-tags'),

    chooseTagField = document.getElementById('choose-tag-input-field'),
    autocompleteDiv = document.getElementById('autocomplete-wrap'),
    chosenTagsContainer = document.getElementById('chosen-tags'),

    tagsSet = new Set(),
    chosenTagsSet = new Set();

addTagBtn.addEventListener('click', () => {
    let val = addTagInputField.value.trim();

    if (!val) {
        addErrorDiv('no name entered');
    } else if (tagsSet.has(val)) {
        addErrorDiv('tag already exists');
    } else {
        removeErrorMessage();
        tagsSet.add(val);
        insertTagDiv(val);
        addTagInputField.value = '';
    }
});

/* add tag on Enter as well as on add button */
addTagInputField.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) addTagBtn.click()
});

addedTagsContainer.addEventListener('click', e => {
    if (e.target.classList.contains('remove-tag-btn')) {
        let tagDiv = e.target.parentElement;
        tagsSet.delete(tagDiv.dataset.tagName);
        tagDiv.remove();
    }
});

chooseTagField.addEventListener('input', e => {
    let searchVal = e.target.value;
    if (searchVal) {
        let caseSensitive = [],
            caseInsensitive = [];

        Array.from(tagsSet.values())
            .filter(i => !chosenTagsSet.has(i) && i.toLowerCase().startsWith(searchVal.toLowerCase()))
            .sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1)
            .forEach(i => i.startsWith(searchVal) ? caseSensitive.push(i) : caseInsensitive.push(i));

        let autocompleteArray = [...caseSensitive, ...caseInsensitive];

        clearAutocomplete();
        fillAutocomplete(autocompleteArray, searchVal.length);
    } else {
        clearAutocomplete();
    }
});

chooseTagField.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        let attemptedEntry = e.target.value;
        if (tagsSet.has(attemptedEntry) && !chosenTagsSet.has(attemptedEntry)) {
            chosenTagsSet.add(attemptedEntry);
            chosenTagsContainer.appendChild(createTagDiv(attemptedEntry, 2));
            chooseTagField.value = '';
            clearAutocomplete();
        }
    }
});

chooseTagField.addEventListener('focusout', () => {
    chooseTagField.value = '';
    clearAutocomplete();
});

// mousedown event used instead of click because it happens before focusout for input field
autocompleteDiv.addEventListener('mousedown', (e) => {
    if (e.target.id !== 'js-no-tags-message') {
        let tagName = e.target.dataset.tagName;
        chosenTagsSet.add(tagName);
        chosenTagsContainer.appendChild(createTagDiv(tagName, 2));
        clearAutocomplete();
    }
});

chosenTagsContainer.addEventListener('click', e => {
    if (e.target.classList.contains('remove-chosen-tag-btn')) {
        let tagDiv = e.target.parentElement;
        chosenTagsSet.delete(tagDiv.dataset.tagName);
        tagDiv.remove();
    }
});

function addErrorDiv(message) {
    removeErrorMessage();
    let errorDiv = document.createElement('div');
    errorDiv.classList.add('error-message');
    errorDiv.textContent = message;
    addZoneControls.appendChild(errorDiv);
    setTimeout(() => errorDiv.classList.add('visible'), 50);
    setTimeout(() => errorDiv.classList.remove('visible'), 800);
    setTimeout(() => removeErrorMessage(errorDiv), 1000);
}

/* if called with an argument - removes certain div (setTimeout case)
 * if called with no arguments - checks if there is an error message
 * currently displayed and removes it (general case)
 */
function removeErrorMessage(errorDiv) {
    errorDiv = errorDiv || addZoneControls.querySelector('.error-message');
    if (errorDiv) errorDiv.remove();
}

/* insert tag in alphabetical order */
function insertTagDiv(name) {
    addedTagsContainer.insertBefore(createTagDiv(name, 1), findNextChild());

    function findNextChild() {
        let tagDivs = [...addedTagsContainer.children],
            arrOfTags = tagDivs.map(i => i.dataset.tagName),
            nextIndex = -1;

        arrOfTags.some((element, index) => {
            if (element.toLowerCase() > name.toLowerCase()) {
                nextIndex = index;
            }
            return element.toLowerCase() > name.toLowerCase()
        });

        /* as per specification
         * if insertBefore is called when refChild is null
         * newChild is inserted at the end of the list of children
         */
        return nextIndex === -1 ? null : tagDivs[nextIndex];
    }
}

/* function adds similar tags to both zones
 * zone 1 = add zone (left), zone 2 = choose zone (right)
 */
function createTagDiv(name, zone) {
    let classSet = {};

    if (zone === 1) {
        classSet['tagClass'] = 'tag';
        classSet['tagTextClass'] = 'tag-text';
        classSet['removeButtonClass'] = 'remove-tag-btn';
    } else if (zone === 2) {
        classSet['tagClass'] = 'chosen-tag';
        classSet['tagTextClass'] = 'chosen-tag-text';
        classSet['removeButtonClass'] = 'remove-chosen-tag-btn';
    }

    let tagDiv = document.createElement('div'),
        tagText = document.createElement('span'),
        removeTag = document.createElement('span');

    tagDiv.classList.add(classSet['tagClass']);
    tagDiv.dataset.tagName = name;

    tagText.classList.add(classSet['tagTextClass']);
    tagText.textContent = name;

    removeTag.classList.add(classSet['removeButtonClass']);
    removeTag.textContent = 'X';

    tagDiv.append(tagText, removeTag);

    return tagDiv;
}

function clearAutocomplete() {
    while (autocompleteDiv.firstChild) {
        autocompleteDiv.firstChild.remove();
    }
}

function fillAutocomplete(tagsArray, markedLength) {
    let autocompleteTagDiv = document.createElement('div');
    autocompleteTagDiv.classList.add('autocomplete-tag');

    if (tagsArray.length > 0) {
        let fragment = document.createDocumentFragment();
        fragment.append(...tagsArray.map(tag => {
            let currentTag = autocompleteTagDiv.cloneNode(true);
            currentTag.innerHTML = `<b>${tag.substr(0, markedLength)}</b>${tag.substr(markedLength)}`;
            currentTag.dataset.tagName = tag;
            return currentTag;
        }));
        autocompleteDiv.appendChild(fragment);
    } else if (tagsArray.length === 0) {
        autocompleteTagDiv.id = 'js-no-tags-message';
        autocompleteTagDiv.textContent = 'no tags found';
        autocompleteDiv.appendChild(autocompleteTagDiv);
    }
}