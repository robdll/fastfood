const restaurants = [
  {
    id: 'rest-roma',
    name: 'Roma Express',
    address: 'Via Roma 12, Milano',
    phone: '02 1234 5678',
    tags: ['promo'],
  },
  {
    id: 'rest-napoli',
    name: 'Napoli Street',
    address: 'Via Toledo 44, Napoli',
    phone: '081 234 5566',
    tags: ['popular'],
  },
  {
    id: 'rest-torino',
    name: 'Torino Bite',
    address: 'Corso Francia 98, Torino',
    phone: '011 8877 2211',
    tags: ['new'],
  },
]

const menus = {
  'rest-roma': [
    {
      id: 'roma-001',
      name: 'Cheeseburger',
      category: 'Burger',
      price: 6.5,
      origin: 'catalog',
      imageUrl: null,
    },
    {
      id: 'roma-002',
      name: 'Patatine classiche',
      category: 'Side',
      price: 2.8,
      origin: 'catalog',
      imageUrl: null,
    },
    {
      id: 'roma-003',
      name: 'Cola 33cl',
      category: 'Drink',
      price: 2.2,
      origin: 'catalog',
      imageUrl: null,
    },
  ],
  'rest-napoli': [
    {
      id: 'napoli-001',
      name: 'Chicken wrap',
      category: 'Wrap',
      price: 5.9,
      origin: 'catalog',
      imageUrl: null,
    },
    {
      id: 'napoli-002',
      name: 'Onion rings',
      category: 'Side',
      price: 3.4,
      origin: 'catalog',
      imageUrl: null,
    },
    {
      id: 'napoli-003',
      name: 'Sprite 33cl',
      category: 'Drink',
      price: 2.1,
      origin: 'catalog',
      imageUrl: null,
    },
  ],
  'rest-torino': [
    {
      id: 'torino-001',
      name: 'Veggie burger',
      category: 'Burger',
      price: 6.2,
      origin: 'custom',
      imageUrl: null,
    },
    {
      id: 'torino-002',
      name: 'Insalata fresca',
      category: 'Salad',
      price: 4.5,
      origin: 'custom',
      imageUrl: null,
    },
    {
      id: 'torino-003',
      name: 'Limonata 33cl',
      category: 'Drink',
      price: 2.3,
      origin: 'catalog',
      imageUrl: null,
    },
  ],
}

const getRestaurantById = (id) =>
  restaurants.find((restaurant) => restaurant.id === id)

const getRestaurantMenuById = (id) => menus[id] ?? []

export { restaurants, getRestaurantById, getRestaurantMenuById }
