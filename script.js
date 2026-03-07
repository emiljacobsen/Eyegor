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

function setCard(elt, num) {
  const cNum = num % 12
  const hNum = (num - cNum) / 12

  elt["alt"] = housesAndCards[hNum].cards[cNum].cardTitle
  elt["src"] = housesAndCards[hNum].cards[cNum].cardTitleUrl
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
  let prevCard = document.getElementById("prev")
  let activeCard = document.getElementById("card_img")
  let nextCard = document.getElementById("next")

  cardNum = stupidWrap(cardNum + s)

  setCard(prevCard, stupidWrap(cardNum - 1))
  setCard(activeCard, cardNum)
  setCard(nextCard, stupidWrap(cardNum + 1))
}