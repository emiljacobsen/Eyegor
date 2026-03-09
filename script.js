// An array of house objects, with fields
// house : String
// cards : [Object]
// Will get fetched from DoK.
let housesAndCards
// The `cards` objects look like this:
  // anomaly: false
  // bonusAember: 0
  // bonusCapture: 0
  // bonusDamage: 0
  // bonusDiscard: 0
  // bonusDraw: 0
  // bonusHouses: Array []
  // cardTitle: "Burning Glare"
  // cardTitleUrl: "https://keyforge-card-images.s3-us-west-2.amazonaws.com/card-images-houses/sanctum/burning-glare.png"
  // enhanced: false
  // legacy: false
  // maverick: false
  // rarity: "Common"

// The active card (a number from 0 to 35).
let cardNum = 0

// API key from a dummy DoK account.
const apiKey = "efb8d62a-bd0d-4925-a706-665ac3f43ee0"

// DoK API request.
const requestOptions = {
  method: "GET",
  headers: {
    "Api-Key": apiKey,
  },
}

// Regular expression to capture deck IDs
const deckIdPattern = /[a-z\d]{8}-(?:[a-z\d]{4}-){3}[a-z\d]{12}/

// To avoid a strange effect where the same card image
// is repeated as new ones are loading in, I use this helper
// function to clear out the images. This makes everything
// kind of blink but it's better, and will do for now.
function clearCardImgs() {
  for (card of document.querySelectorAll(".card")) {
    card["src"] = ""
    // card["src"] = "static/image_loading.png"
  }
}

// Set `alt` and `src` of the HTMLElement `img` to
// the card title and URL, respectively, from `card`.
function updateCardImg(img, card) {
  img["alt"] = card.cardTitle
  img["src"] = card.cardTitleUrl
}

// Get the card object corresponding to the number `num`
// (between 0 and 35).
function getCard(num) {
  const cNum = num % 12
  const hNum = (num - cNum) / 12

  return housesAndCards[hNum].cards[cNum]
}

// Get the house (String) of card number `num`.
function getHouse(num) {
  const hNum = (num - num % 12) / 12
  return housesAndCards[hNum]["house"]
}

// Set the `housesAndCards` variable by fetching
// the deck with ID `deckId` from DoK.
// Also sets the active card to no 0,
// switches the display style of `card_viewer`
// to `grid`, and shoots off the deck name and
// DoK link to the HTML.
function loadDeck(deckId) {
  const apiUrl = "https://decksofkeyforge.com/public-api/v3/decks/"
    + deckId

  // I don't fully understand the syntax of this fetch call,
  // I copied it and adapted it from some blog post.
  fetch(apiUrl, requestOptions)
  .then(response => {
    if (!response.ok)
      throw new Error("Network response was not ok")
    
    return response.json()
  })
  .then(data => {
    housesAndCards = data.deck.housesAndCards
    changeCard(0)
    document.getElementById("deck_name").innerText = data.deck.name
    document.getElementById("deck_name_link").href =
      "https://decksofkeyforge.com/decks/" + deckId
    document.getElementById("card_viewer").style.display = "grid"
  })
  .catch(error => {
    console.error("Error:", error)
  })
}

// Read the deck_link input, get the deck ID and 
// pass that to the `loadDeck` function.
function loadDeckFromInput() {
  const link = document.getElementById("deck_link").value
  const ids = deckIdPattern.exec(link)
  if (ids == null) {
    console.error("Invalid Link")
    // TODO: tell the user outside of the console.
    return
  }
  loadDeck(ids[0])
}

// Pass a predetermined deck ID to the `loadDeck` funtion.
function loadDemoDeck() {
  loadDeck("31b044fe-5a9d-45f7-b239-20f6678e90a5")
}

// Wraps mod 36, but only stupidly, i.e.,
// only works if the out-of-bounds number is
// off by one, i.e., equal to -1 or 36.
function stupidWrap(n) {
  let res = n

  if (n < 0)
    res = 35
  else if (n > 35)
    res = 0

  return res
}

// Increment the cardNum by `s` and update the
// `card_viewer` accordingly.
function changeCard(s) {
  // Set image src to blank, to avoid
  // confusing behaviour.
  // There should be a better way of doing this?
  clearCardImgs()

  // Increment the card number.
  cardNum = stupidWrap(cardNum + s)

  // Update the previous and next cards (that's easy).
  let prevCardImg = document.getElementById("prev")
  let nextCardImg = document.getElementById("next")
  updateCardImg(prevCardImg, getCard(stupidWrap(cardNum - 1)))
  updateCardImg(nextCardImg, getCard(stupidWrap(cardNum + 1)))

  // Now we want to update the active card
  // (this is more complicated).

  // Here are the relevant HTML elements.
  let activeCardImg = document.getElementById("card_img")
  let activeHousePar = document.getElementById("active_house")
  let activeNumberPar = document.getElementById("active_number")
  let activeDataPar = document.getElementById("active_data")

  // Here's the card data.
  const activeCard = getCard(cardNum)

  // Update the img.
  updateCardImg(activeCardImg, activeCard)

  // Update the house text.
  activeHousePar.innerText = getHouse(cardNum)

  // Update the card number text.
  activeNumberPar.innerText = "Card Number " + (cardNum + 1)

  // We now spend some time formatting the text about enhancements,
  // whether the card is a legacy or maverick, or whether it's an anomaly.

  // Start with an empty string.
  let dataTxt = ""

  // If the card is enhanced, add on all the enhancements to the string.
  if (activeCard["enhanced"] == true) {
    dataTxt += "\n Enhanced:"
    
    enhTxt = ""
    
    const aember = activeCard["bonusAember"]
    const capture = activeCard["bonusCapture"]
    const damage = activeCard["bonusDamage"]
    const discard = activeCard["bonusDiscard"]
    const draw = activeCard["bonusDraw"]
    const houses = activeCard["bonusHouses"]

    if (aember > 0) {
      enhTxt += ", " + aember + " Aember"
    }
    if (capture > 0) {
      enhTxt += ", " + capture + " Capture"
    }
    if (damage > 0) {
      enhTxt += ", " + damage + " Damage"
    }
    if (discard > 0) {
      enhTxt += ", " + discard + " Discard"
    }
    if (draw > 0) {
      enhTxt += ", " + draw + " Draw"
    }
    if (houses.length > 0) {
      enhTxt += ", " + houses.toString()
    }

    // Remove the initial comma and add a period.
    dataTxt += enhTxt.slice(1) + "."
  }

  // Add a word if the card is an anomaly, legecy or maverick.
  if (activeCard["anomaly"] == true) {
    dataTxt += "\n Anomaly."
  }
  if (activeCard["legacy"] == true) {
    dataTxt += "\n Legacy."
  }
  if (activeCard["maverick"] == true) {
    dataTxt += "\n Maverick."
  }

  // Trim the initial line break and send it to HTML.
  activeDataPar.innerText = dataTxt.trimStart()
}