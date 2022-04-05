import NFT from './artifacts/contracts/NFT.sol/NFT.json'
import SBTNFT from './artifacts/contracts/SBTNFT.sol/SBTNFT.json'
import { useState } from "react";
import { ethers } from "ethers";
import {nftaddress,nftmarketaddress} from './config.js'
import Home from "./Home"
import { create as ipfsHttpClient } from 'ipfs-http-client'
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')


 function CreateItem() {
    const [formInput, updateFormInput] = useState({ organizer: '', guest: '',time:'',price:'' })
   
      async function createMarket() {
        const { organizer, guest,time,price } = formInput

        if (!organizer || !guest || !time || !price) return
        /* first, upload to IPFS */
        const data = JSON.stringify({
          organizer, guest,time,price
        })
        try {
          const added = await client.add(data)
          const url = `https://ipfs.infura.io/ipfs/${added.path}`
          /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
          createSale(url)
        } catch (error) {
          console.log('Error uploading file: ', error)
        }  
        clearText() ;
      }

      function clearText()  
    {
        document.getElementById('i1').value = "";
        document.getElementById('i2').value = "";
        document.getElementById('i3').value = "";
        document.getElementById('i4').value = "";
    } 

      async function createSale(url) {
         await window.ethereum.request({ method: 'eth_requestAccounts' })
        const provider = new ethers.providers.Web3Provider(window.ethereum);   
        const signer = provider.getSigner()
        console.log(url)
        
        /* next, create the item */
        let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
        let transaction = await contract.createToken(url)
        console.log(transaction)
        console.log(transaction.value.toNumber())
       // let tokenId = transaction.value.toNumber()
        let tx = await transaction.wait()
        console.log(tx)


        
        let event = tx.events[0]
        console.log(event)
        let value = event.args[2]
        let tokenId = value.toNumber()
      
        /* then list the item for sale on the marketplace */
        contract = new ethers.Contract(nftmarketaddress, SBTNFT.abi, signer)
       console.log(contract)
       console.log(tokenId)

       console.log(formInput)

      //  let listingPrice = await contract.getListingPrice()
      //  listingPrice = listingPrice.toString()

      //  const organizer = ethers.utils.parseUnits(formInput.organizer);
      //  const guest = ethers.utils.parseUnits(formInput.guest);
      //  const time = ethers.utils.parseUnits(formInput.time);
      //  const topic = ethers.utils.parseUnits(formInput.topic);
       
       await contract.createMarketItem(nftaddress, tokenId, formInput.organizer,formInput.guest,formInput.time,formInput.price)
       // await transaction.wait()

        console.log("EventNFT");
      //  router.push('/')
      }
  return (
    <div>
    <Home/>
<div className="mb-3">
<label  className="form-label">Organizer_Name:</label>
<input className="form-control" id="i1" onChange={e => updateFormInput({ ...formInput, organizer: e.target.value })} />
</div>
<div className="mb-3">
<label  className="form-label">Event_Name:</label>
<textarea  className="form-control" id="i2" onChange={e=>updateFormInput({ ...formInput,guest:e.target.value})}/>
</div>

<div className="mb-3">
<label  className="form-label">Event_Time:</label>
<textarea  className="form-control" id="i3" onChange={e=>updateFormInput({ ...formInput,time:e.target.value})}/>
</div>

<div className="mb-3">
<label  className="form-label">Price:</label>
<textarea  className="form-control" id="i4" onChange={e=>updateFormInput({ ...formInput,price:e.target.value})}/>
</div>

<button onClick={createMarket} className="btn btn-primary" >Create_Event</button>
    </div>
  )
}

export default CreateItem;