/* eslint-disable no-console */
/* eslint-disable no-undef */
'use strict';

const STORE = {
  items: [
    {id: cuid(), name: 'apples', checked: false, isEditing: false},
    {id: cuid(), name: 'oranges', checked: false, isEditing: false},
    {id: cuid(), name: 'milk', checked: true, isEditing: false},
    {id: cuid(), name: 'bread', checked: false, isEditing: false}
  ],
  hideCompleted: false,
  searchTerm: null,
};

function generateItemElement(item) {
  let itemMainTitle;
  if (item.isEditing) {
    itemMainTitle = `
      <form id="edit-item-name-form">
        <input type="text" name="edit-name" class="js-edit-item-name" value="${item.name}" />
      </form>
    `;
  } else {
    itemMainTitle = `
      <span class="shopping-item js-shopping-item ${item.checked ? 'shopping-item__checked' : ''}">
        ${item.name}
      </span>`;
  }
  return `
    <li data-item-id="${item.id}">
      ${itemMainTitle}
      <div class="shopping-item-controls">
        <button class="shopping-item-toggle js-item-toggle">
            <span class="button-label">check</span>
        </button>
        <button class="shopping-item-delete js-item-delete">
            <span class="button-label">delete</span>
        </button>
      </div>
    </li>`;
}

function generateShoppingItemsString(shoppingList) {
  console.log('Generating shopping list element');

  const items = shoppingList.map((item) => generateItemElement(item));
  
  return items.join('');
}

function renderShoppingList() {
  // render the shopping list in the DOM
  console.log('`renderShoppingList` ran');

  // set up a copy of the store's items in a local variable that we will reassign to a new
  // version if any filtering of the list occurs
  let filteredItems = STORE.items;
  let searchTerm = STORE.searchTerm;

  // if the `hideCompleted` property is true, then we want to reassign filteredItems to a version
  // where ONLY items with a "checked" property of false are included
  if (STORE.hideCompleted) {
    filteredItems = filteredItems.filter(item => !item.checked);
  }

  if (STORE.searchTerm) {
    filteredItems = filteredItems.filter(item => item.name.includes(searchTerm));
  }

  // at this point, all filtering work has been done (or not done, if that's the current settings), so
  // we send our `filteredItems` into our HTML generation function 
  const shoppingListItemsString = generateShoppingItemsString(filteredItems);

  // insert that HTML into the DOM
  $('.js-shopping-list').html(shoppingListItemsString);
}

function addItemToShoppingList(itemName) {
  console.log(`Adding "${itemName}" to shopping list`);
  STORE.items.push({id: cuid(), name: itemName, checked: false, isEditing: false});
}

function handleNewItemSubmit() {
  $('#js-shopping-list-form').submit(function(event) {
    event.preventDefault();
    console.log('`handleNewItemSubmit` ran');
    const newItemName = $('.js-shopping-list-entry').val();
    $('.js-shopping-list-entry').val('');
    addItemToShoppingList(newItemName);
    renderShoppingList();
  });
}

function toggleCheckedForListItem(itemId) {
  console.log('Toggling checked property for item with id ' + itemId);
  const item = STORE.items.find(item => item.id === itemId);
  item.checked = !item.checked;
}

function getItemIdFromElement(item) {
  return $(item)
    .closest('li')
    .data('item-id');
}

function handleItemCheckClicked() {
  $('.js-shopping-list').on('click', '.js-item-toggle', event => {
    console.log('`handleItemCheckClicked` ran');
    const id = getItemIdFromElement(event.currentTarget);
    toggleCheckedForListItem(id);
    renderShoppingList();
  });
}

// name says it all. responsible for deleting a list item.
function deleteListItem(itemId) {
  console.log(`Deleting item with id  ${itemId} from shopping list`);

  // as with `addItemToShoppingLIst`, this function also has the side effect of
  // mutating the global STORE value.
  //
  // First we find the index of the item with the specified id using the native
  // Array.prototype.findIndex() method. Then we call `.splice` at the index of 
  // the list item we want to remove, with a removeCount of 1.
  const itemIndex = STORE.items.findIndex(item => item.id === itemId);
  STORE.items.splice(itemIndex, 1);
}

function handleDeleteItemClicked() {
  // like in `handleItemCheckClicked`, we use event delegation
  $('.js-shopping-list').on('click', '.js-item-delete', event => {
    // get the index of the item in STORE
    const itemIndex = getItemIdFromElement(event.currentTarget);
    // delete the item
    deleteListItem(itemIndex);
    // render the updated shopping list
    renderShoppingList();
  });
}

// Toggles the STORE.hideCompleted property
function toggleHideFilter() {
  STORE.hideCompleted = !STORE.hideCompleted;
}

// Places an event listener on the checkbox for hiding completed items
function handleToggleHideFilter() {
  $('.js-hide-completed-toggle').on('click', () => {
    toggleHideFilter();
    renderShoppingList();
  });
}

function updateSearchTerm(searchItem) {
  STORE.searchTerm = searchItem;
}

function handleSearchItemSubmit() {
  $('#js-shopping-list-search').submit(function(event) {
    event.preventDefault();
    console.log('`handleSearchItemSubmit` ran');
    const searchItemName = $('.js-shopping-list-search-entry').val();
    updateSearchTerm(searchItemName);
    renderShoppingList();
  });
}

function handleSearchResetSubmit() {
  $('#js-shopping-list-reset').submit(function(event) {
    event.preventDefault();
    console.log('`handleSearchResetSubmit` ran');
    $('.js-shopping-list-search-entry').val('');
    updateSearchTerm(null);
    renderShoppingList();
  });
}

function setIsEditing(itemId, val) {
  console.log('Toggling isEditing property for item with id ' + itemId);
  const item = STORE.items.find(item => item.id === itemId);
  item.isEditing = val;
}

function handleEditItemName() {
  $('.js-shopping-list').on('click', '.js-shopping-item', function(event){
    console.log('`handleEditItemName` ran');
    const id = getItemIdFromElement(event.currentTarget);
    setIsEditing(id, true);
    renderShoppingList();
  });
}

function editItemName(itemId, name) {
  console.log('Changing name for item with id ' + itemId);
  const item = STORE.items.find(item => item.id === itemId);
  item.name = name;
}

function handleEditItemNameSubmit() {
  $('.js-shopping-list').on('submit', '#edit-item-name-form', event => {
    event.preventDefault();
    const id = getItemIdFromElement(event.target);
    const newName = $('.js-edit-item-name').val();
    editItemName(id, newName);
    setIsEditing(id, false);
    renderShoppingList();
  });
}

function handleShoppingList() {
  renderShoppingList();
  handleNewItemSubmit();
  handleItemCheckClicked();
  handleDeleteItemClicked();
  handleToggleHideFilter();
  handleSearchItemSubmit();
  handleSearchResetSubmit();
  handleEditItemName();
  handleEditItemNameSubmit();
}

$(handleShoppingList);