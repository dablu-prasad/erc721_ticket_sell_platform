import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"
import Home from './Home'
import {
  nftmarketaddress, nftaddress
} from './config'

import React, { Fragment } from "react";
import Market from './artifacts/contracts/SBTNFT.sol/SBTNFT.json'
import NFT from './artifacts/contracts/NFT.sol/NFT.json'

function My_Digital_Asset() {
    
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })

    console.log(Market)
    console.log(NFT)
    console.log(nftmarketaddress)
    console.log(nftaddress)
    const [account]= await window.ethereum.request({ method: 'eth_requestAccounts' })
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    console.log(Market.abi)
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const data = await marketContract.fetchMyNFTs()
    console.log(Market.abi)
    console.log(data)
    console.log("Hello My_Digital_Asset")
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        organizer: meta.data.organizer,
        guest: meta.data.guest,
        time: meta.data.time,
      
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded') 
    console.log(nfts)
  }
//  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No assets owned</h1>)
  return (
    <div className="flex justify-center">
    <Home/>
      <div className="p-4">
      <div  className="card" style={{width: 18+'rem'}}>
      <form>
     <table className="table table-bordered">
    
      <thead className="thead-dark">
      <tr>
        <th>TokenId</th>
        <th>Organizer_Name</th>
        <th>Event_Name</th>
        <th>Event_Time</th>
        <th>Event_Price</th>
      </tr>
    </thead>
    
  { nfts.map((nft,i)=>{
    return(
      <Fragment>
       <tbody>
      <tr>
      <th key={i}>{nft.tokenId}</th>
        <td>{nft.organizer}</td>
        <td>{nft.guest}</td>
        <td>{nft.time}</td>
        <td>{nft.price}</td>
        </tr>
        </tbody>
        </Fragment>
        
    );
  })}  
  </table>
  </form>
        </div>
      </div>
    </div>
  )
}

export default My_Digital_Asset