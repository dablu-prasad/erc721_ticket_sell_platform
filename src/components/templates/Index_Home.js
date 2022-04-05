/* pages/index.js */
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"
import React, { Fragment } from "react";
import {
  nftaddress, nftmarketaddress
} from './config'

import NFT from './artifacts/contracts/NFT.sol/NFT.json'
import Market from './artifacts/contracts/SBTNFT.sol/SBTNFT.json'
import { computeHeadingLevel } from '@testing-library/react';

function Index_Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    /* create a generic provider and query for unsold market items */
    const provider = new ethers.providers.JsonRpcProvider("https://kovan.infura.io/v3/e55b832a28fc45498b65d1e91a2b9b4f")
    //await window.ethereum.request({ method: 'eth_requestAccounts' })
    //const provider = new ethers.providers.Web3Provider(window.ethereum);
    //const signer = provider.getSigner();
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
    const data = await marketContract.fetchMarketItems()

    /*
    *  map over items returned from smart contract and format 
    *  them as well as fetch their token metadata
    */
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
     let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        organizer: meta.data.organizer,
        guest: meta.data.guest,
        time: meta.data.time,
         price,
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded') 
  }
  async function buyNft(nft) {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)

    /* user will be prompted to pay the asking proces to complete the transaction */
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')  
    console.log(nftaddress) 
    console.log(nft.tokenId) 
    console.log(String(price)) 
    const transaction = await contract.createMarketSale(nftaddress, nft.tokenId,{value:price})
  // await transaction.wait()
    loadNFTs()
  }
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No Tikets in marketplace</h1>)
  return (
    <div className='app-container'>  
    
     <h2>List of Organize Event Tikets</h2> 
     <form>
     <table className="table table-bordered">
    
      <thead className="thead-dark">
      <tr>
        <th>TokenId</th>
        <th>Organizer_Name</th>
        <th>Event Name</th>
        <th>Event Time</th>
        <th>Event_Tiket_Price</th>
        <th>Buy Events</th>
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
        <td><button type="button" className="btn btn-primary" onClick={() => buyNft(nft)} >Buy</button></td>
        </tr>
        </tbody>
        </Fragment>
        
    );
  })}  
  </table>
  </form>
  </div>  
  )
}

export default Index_Home;