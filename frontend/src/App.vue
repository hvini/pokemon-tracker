<template>
  <div class="max-w-4xl mx-auto p-4">
    <h1 class="text-3xl font-bold text-center mb-6 text-red-600">Pokémon TCG Portfolio</h1>

    <!-- Add Card Form -->
    <div class="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 class="text-xl font-semibold mb-4">Add a Card</h2>
      <form @submit.prevent="addCard" class="space-y-4">

        <div>
          <label class="block text-sm font-medium text-gray-700">Set</label>
          <select v-model="form.setName" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-gray-50">
            <option disabled value="">Select a subset...</option>
            <optgroup label="30th Anniversary Specials (2026)">
              <option v-for="set in anniversarySets" :key="set" :value="set">{{ set }}</option>
            </optgroup>
            <optgroup label="Scarlet & Violet Series (2023-2026)">
              <option v-for="set in svSets" :key="set" :value="set">{{ set }}</option>
            </optgroup>
            <optgroup label="Sword & Shield Series (2020-2023)">
              <option v-for="set in swshSets" :key="set" :value="set">{{ set }}</option>
            </optgroup>
            <optgroup label="Sun & Moon Series (2017-2019)">
              <option v-for="set in smSets" :key="set" :value="set">{{ set }}</option>
            </optgroup>
          </select>
        </div>


        <div class="relative">
          <label class="block text-sm font-medium text-gray-700">Card Name (Searchable)</label>
          <input 
                 v-model="form.cardName" 
                 @focus="showSuggestions = true"
                 @input="showSuggestions = true"
                 @blur="hideSuggestions"
                 required 
                 autocomplete="off"
                 placeholder="Start typing a Pokémon name..." 
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-gray-50" 
                 />

          <!-- Custom Vue Dropdown -->
          <ul 
                 v-if="showSuggestions && suggestedPokemonNames.length"
                 class="absolute z-10 w-full bg-white border border-gray-300 mt-1 max-h-48 overflow-y-auto rounded-md shadow-lg"
                 >
                 <li 
                 v-for="pokemon in suggestedPokemonNames" 
                 :key="pokemon"
                 @click="selectPokemon(pokemon)"
                 class="px-4 py-2 hover:bg-red-50 active:bg-red-100 cursor-pointer border-b last:border-b-0 border-gray-100 text-gray-800"
                 >
                 {{ pokemon }}
                 </li>
          </ul>
            <p class="text-xs text-gray-500 mt-1">You can add numbers/details after selecting (e.g., "Pikachu ex 001/050")</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Variant / Rarity</label>
          <select v-model="form.variant" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-gray-50">
            <option disabled value="">Select a variant...</option>
            <option v-for="variant in variants" :key="variant" :value="variant">{{ variant }}</option>
          </select>
        </div>

        <button type="submit" class="w-full bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition">
          Add to Portfolio
        </button>
      </form>
    </div>

    <!-- Portfolio List -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <div class="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 class="text-xl font-semibold">My Collection</h2>
        <!-- Search Filter -->
        <div class="w-full sm:w-64">
          <input 
             v-model="searchQuery" 
             type="text" 
             placeholder="Search cards, sets, or variants..." 
             class="block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-gray-50 text-sm"
             />
        </div>
      </div>

      <div v-if="portfolio.length === 0" class="text-gray-500 text-center py-4">
        No cards in your portfolio yet. Add some above!
      </div>
      <div v-else-if="filteredPortfolio.length === 0" class="text-gray-500 text-center py-4">
        No cards match your search.
      </div>
      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Set</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Card</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="card in paginatedPortfolio" :key="card.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ card.setName }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">{{ card.cardName }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {{ card.variant }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">x{{ card.quantity }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    @click="removeCard(card.id)" 
                    class="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition"
                    >
                    Remove
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="flex justify-between items-center mt-4 text-sm text-gray-700">
          <button 
             @click="currentPage--" 
             :disabled="currentPage === 1"
             class="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
             >
             Previous
          </button>
            <span>Page {{ currentPage }} of {{ totalPages || 1 }}</span>
            <button 
             @click="currentPage++" 
             :disabled="currentPage >= totalPages"
             class="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
             >
             Next
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, shallowRef, computed, watch, onMounted } from 'vue'

const anniversarySets = [
  '30th Celebration', 
  'McDonald\'s 30th Anniversary Promo (2021)'
]

const svSets = [
  'Scarlet & Violet Base Set', 'Paldea Evolved', 'Obsidian Flames', 
  '151', 'Paradox Rift', 'Paldean Fates', 'Temporal Forces', 
  'Twilight Masquerade', 'Shrouded Fable', 'Stellar Crown', 
  'Surging Sparks', 'Prismatic Evolutions', 'Journey Together', 
  'Destined Rivals', 'Black Bolt & White Flare', 'Mega Evolution',
  'Scarlet & Violet Promos (SVP)', 'Scarlet & Violet Energies (SVE)'
]

const swshSets = [
  'Sword & Shield Base Set', 'Rebel Clash', 'Darkness Ablaze', 
  'Champion\'s Path', 'Vivid Voltage', 'Shining Fates', 
  'Battle Styles', 'Chilling Reign', 'Evolving Skies', 
  'Celebrations', 'Fusion Strike', 'Brilliant Stars', 
  'Astral Radiance', 'Pokémon GO', 'Lost Origin', 
  'Silver Tempest', 'Crown Zenith', 'Sword & Shield Promos (SWSH)'
]

const smSets = [
  'Cosmic Eclipse', 'Hidden Fates', 'Unified Minds',
  'Unbroken Bonds', 'Team Up', 'Sun & Moon Promos'
]

const variants = [
  'Normal (Non-Holo)', 'Reverse Holo', 'Holo Rare', 'Confetti Holo',
  'Double Rare (ex / V)', 'Ultra Rare (Full Art)', 
  'Illustration Rare (Alt Art)', 'Special Illustration Rare',
  'Hyper Rare (Gold)'
]

const form = ref({
  setName: '',
  cardName: '',
  variant: ''
})


const portfolio = ref([])
const allPokemonNames = shallowRef([])
const apiUrl = `/api/cards`

// Pagination and Search State
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

const showSuggestions = ref(false)

const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

const selectPokemon = (name) => {
  form.value.cardName = name
  showSuggestions.value = false
}

const suggestedPokemonNames = computed(() => {
  const query = form.value.cardName.toLowerCase()
  if (!query) return allPokemonNames.value.slice(0, 20)

  return allPokemonNames.value
    .filter(name => name.toLowerCase().includes(query))
    .slice(0, 20)
})

// Computed property to filter the portfolio based on search input
const filteredPortfolio = computed(() => {
  if (!searchQuery.value) return portfolio.value

  const query = searchQuery.value.toLowerCase()
  return portfolio.value.filter(card => 
    card.cardName.toLowerCase().includes(query) ||
    card.setName.toLowerCase().includes(query) ||
    card.variant.toLowerCase().includes(query)
  )
})

// Computed property for total pages based on the filtered results
const totalPages = computed(() => {
  return Math.ceil(filteredPortfolio.value.length / itemsPerPage)
})

// Computed property to slice the filtered array for the current page
const paginatedPortfolio = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredPortfolio.value.slice(start, end)
})

// Watcher to reset to page 1 whenever the user types in the search box
watch(searchQuery, () => {
  currentPage.value = 1
})

const fetchPokemonNames = async () => {
  try {
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1300')
    const data = await res.json()
    allPokemonNames.value = data.results.map(p => 
      p.name.charAt(0).toUpperCase() + p.name.slice(1)
    )
  } catch (error) {
    console.error("Error fetching Pokémon names:", error)
  }
}

const fetchPortfolio = async () => {
  try {
    const res = await fetch(apiUrl)
    portfolio.value = await res.json()
  } catch (error) {
    console.error("Error fetching cards:", error)
  }
}

const addCard = async () => {
  try {
    await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })

    form.value.cardName = ''
    form.value.variant = ''

    await fetchPortfolio()
  } catch (error) {
    console.error("Error adding card:", error)
  }
}

const removeCard = async (id) => {
  try {
    await fetch(`${apiUrl}/${id}`, {
      method: 'DELETE'
    })
    await fetchPortfolio()

    // Safety check: if removing the last item on the last page, go back one page
    if (paginatedPortfolio.value.length === 1 && currentPage.value > 1) {
      currentPage.value--
    }
  } catch (error) {
    console.error("Error removing card:", error)
  }
}

onMounted(() => {
  fetchPortfolio()
  fetchPokemonNames()
})
</script>
