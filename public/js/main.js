const form = document.querySelector("form");
const email = document.getElementById("email");
const feil = document.getElementById("emailFeil");

form.addEventListener("submit", (e) => {
    if (!email.validity.valid) {
        e.preventDefault();
        feil.textContent = "Du må bruke en @afk.no-adresse.";
        feil.hidden = false;
    }
});

email.addEventListener("input", () => {
    feil.hidden = true;
});