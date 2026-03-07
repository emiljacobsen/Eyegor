let housesAndCards
let cardNum = 0

const apiKey = "efb8d62a-bd0d-4925-a706-665ac3f43ee0"
const deckIdPattern = /[a-z\d]{8}-(?:[a-z\d]{4}-){3}[a-z\d]{12}/

const requestOptions = {
  method: "GET",
  headers: {
    "Api-Key": apiKey,
  },
}

function updateCardImg(img, card) {
  img["alt"] = card.cardTitle
  img["src"] = ""
  img["src"] = "image_loading.png"
  img["src"] = card.cardTitleUrl
}

function getCard(num) {
  const cNum = num % 12
  const hNum = (num - cNum) / 12

  return housesAndCards[hNum].cards[cNum]
}

function getHouse(num) {
  const hNum = (num - num % 12) / 12
  return housesAndCards[hNum]["house"]
}

function loadDeck() {
  const link = document.getElementById("deck_link").value
  const ids = deckIdPattern.exec(link)
  if (ids == null) {
    console.error("Invalid Link")
    // TODO: tell the user outside of the console.
    return
  }
  const apiUrl = "https://decksofkeyforge.com/public-api/v3/decks/"
    + ids[0]

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
    document.getElementById("card_viewer").style.display = "grid"
  })
  .catch(error => {
    console.error("Error:", error)
  })
}

function stupidWrap(n) {
  let res = n

  if (n < 0)
    res = 35
  else if (n > 35)
    res = 0

  return res
}

function changeCard(s) {
  cardNum = stupidWrap(cardNum + s)

  let prevCardImg = document.getElementById("prev")
  let nextCardImg = document.getElementById("next")
  updateCardImg(prevCardImg, getCard(stupidWrap(cardNum - 1)))
  updateCardImg(nextCardImg, getCard(stupidWrap(cardNum + 1)))

  let activeCardImg = document.getElementById("card_img")
  let activeHousePar = document.getElementById("active_house")
  let activeNumberPar = document.getElementById("active_number")
  let activeDataPar = document.getElementById("active_data")

  const activeCard = getCard(cardNum)

  updateCardImg(activeCardImg, activeCard)

  activeHousePar.innerText = getHouse(cardNum)

  activeNumberPar.innerText = "Card Number " + (cardNum + 1)

  // Example card
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

  let dataTxt = ""

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

    dataTxt += enhTxt.slice(1) + "."
  }

  if (activeCard["anomaly"] == true) {
    dataTxt += "\n Anomaly."
  }
  if (activeCard["legacy"] == true) {
    dataTxt += "\n Legacy."
  }
  if (activeCard["maverick"] == true) {
    dataTxt += "\n Maverick."
  }

  activeDataPar.innerText = dataTxt.trimStart()
}