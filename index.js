import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"
const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
withdrawButton.onclick = withdraw
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance


async function connect() {
    if (typeof window.ethereum !== "undefined") {
        console.log("metamask detected")
        await window.ethereum.request({ method: "eth_requestAccounts" })
        connectButton.innerHTML = "Connected!"
    }
    else {
        connectButton.innerHTML = "No metamask!"
    }
}

async function getBalance() {
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value;
    console.log(`${ethAmount} being funded..`)
    if (typeof window.ethereum !== "undefined") {
        //to send a transaction we need following
        //provider/connection to blockchain
        //signer/ wallet 
        //contract ABI and address to interact with
        //this is where ethers come in

        //get the http endpoint from metamsk
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner(); //gets the address of the connected account
        console.log(signer)
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.fund({ value: ethers.utils.parseEther(ethAmount) })
            await listenForTransactionMine(transactionResponse, provider)
            console.log("done")
        }
        catch (err) {
            console.log(err)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)

    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve() //only finish this function after all this is done
        })
    })

}

async function withdraw() {
    if (typeof window.ethereum != "undefined") {
        console.log("Withdrawing..")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        }
        catch (err) {
            console.log(err)
        }
    }

}